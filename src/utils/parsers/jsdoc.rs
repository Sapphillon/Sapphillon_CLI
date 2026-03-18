use regex::Regex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParameterInfo {
    pub name: String,
    pub idx: i32,
    pub r#type: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReturnInfo {
    pub r#type: String,
    pub idx: i32,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionInfo {
    pub r#type: String,
    pub resource: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionInfo {
    pub name: String,
    pub description: String,
    pub parameters: Vec<ParameterInfo>,
    pub returns: Vec<ReturnInfo>,
    pub permissions: Vec<PermissionInfo>,
    pub body: String,
}

pub fn parse_javascript(content: &str) -> Vec<FunctionInfo> {
    let mut functions = Vec::new();

    // Regex breakdown matched with Deno implementation:
    // \/\*\*                          - JSDoc start
    // ((?:(?!\*\/)[\s\S])*?)          - content until */
    // \*\/                            - JSDoc end
    // \s*export\s+                    - export keyword
    // (async\s+)?                     - optional async
    // function\s+(\w+)                - function name
    // \s*\(([^)]*)\)                  - parameters
    // (?:\s*:\s*[^{]+)?               - optional TS return type
    // \s*\{([\s\S]*?)\n\}             - body (ends with a newline before })
    let jsdoc_function_regex = Regex::new(
        r"(?x)
        /\*\*
        ((?s:.*?))
        \*/
        \s*export\s+
        (async\s+)?
        function\s+(\w+)
        \s*\(([^)]*)\)
        (?:\s*:\s*[^{]+)?
        \s*\{(?s:(.*?))\n\}",
    )
    .unwrap();

    for cap in jsdoc_function_regex.captures_iter(content) {
        let jsdoc_content = &cap[1];
        let function_name = &cap[3];
        let _params = &cap[4];
        let body = &cap[5];

        let function_info = parse_jsdoc(jsdoc_content, function_name, body);
        functions.push(function_info);
    }

    functions
}

fn parse_jsdoc(jsdoc_content: &str, function_name: &str, body: &str) -> FunctionInfo {
    let lines: Vec<String> = jsdoc_content
        .lines()
        .map(|line| {
            line.trim()
                .trim_start_matches('*')
                .trim_start_matches(' ')
                .to_string()
        })
        .collect();

    let mut description = String::new();
    let mut parameters = Vec::new();
    let mut returns = Vec::new();
    let mut permissions = Vec::new();

    let mut param_idx = 0;
    let mut return_idx = 0;

    let param_re = Regex::new(r"@param\s+\{([^}]+)\}\s+(\w+)\s*(?:-\s*(.*))?").unwrap();
    let return_re = Regex::new(r"@returns?\s+\{([^}]+)\}\s*(.*)").unwrap();
    let permission_re = Regex::new(r#"@permission\s+\[(.*)\]"#).unwrap();
    let perm_item_re = Regex::new(r#""([^:]+):([^"]+)""#).unwrap();

    for line in lines {
        if let Some(cap) = param_re.captures(&line) {
            parameters.push(ParameterInfo {
                r#type: cap[1].to_string(),
                name: cap[2].to_string(),
                idx: param_idx,
                description: cap.get(3).map_or("", |m| m.as_str()).to_string(),
            });
            param_idx += 1;
            continue;
        }

        if let Some(cap) = return_re.captures(&line) {
            returns.push(ReturnInfo {
                r#type: cap[1].to_string(),
                idx: return_idx,
                description: cap.get(2).map_or("", |m| m.as_str()).to_string(),
            });
            return_idx += 1;
            continue;
        }

        if let Some(cap) = permission_re.captures(&line) {
            let permission_str = &cap[1];
            for p_cap in perm_item_re.captures_iter(permission_str) {
                permissions.push(PermissionInfo {
                    r#type: p_cap[1].to_string(),
                    resource: p_cap[2].to_string(),
                });
            }
            continue;
        }

        if !line.starts_with('@') && !line.is_empty() && description.is_empty() {
            description = line.to_string();
        }
    }

    FunctionInfo {
        name: function_name.to_string(),
        description,
        parameters,
        returns,
        permissions,
        body: body.trim().to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_javascript() {
        let content = r#"
/**
 * 2つの数値を加算します。
 * @param {number} a - 足される数
 * @param {number} b - 足す数
 * @returns {number} 合計
 * @permission ["FileSystemRead:/etc", "FileSystemWrite:/etc"]
 */
export function add(a, b) {
  return a + b;
}
"#;
        let functions = parse_javascript(content);
        assert_eq!(functions.len(), 1);
        let f = &functions[0];
        assert_eq!(f.name, "add");
        assert_eq!(f.description, "2つの数値を加算します。");
        assert_eq!(f.parameters.len(), 2);
        assert_eq!(f.parameters[0].name, "a");
        assert_eq!(f.parameters[0].idx, 0);
        assert_eq!(f.parameters[0].r#type, "number");
        assert_eq!(f.parameters[0].description, "足される数");
        assert_eq!(f.returns.len(), 1);
        assert_eq!(f.returns[0].r#type, "number");
        assert_eq!(f.returns[0].description, "合計");
        assert_eq!(f.permissions.len(), 2);
        assert_eq!(f.permissions[0].r#type, "FileSystemRead");
        assert_eq!(f.permissions[0].resource, "/etc");
        assert_eq!(f.body, "return a + b;");
    }

    #[test]
    fn test_parse_javascript_async_ts() {
        let content = r#"
/**
 * Test async TS function
 * @param {string} msg
 * @returns {Promise<void>}
 */
export async function test(msg: string): Promise<void> {
  console.log(msg);
}
"#;
        let functions = parse_javascript(content);
        assert_eq!(functions.len(), 1);
        let f = &functions[0];
        assert_eq!(f.name, "test");
        assert_eq!(f.parameters.len(), 1);
        assert_eq!(f.body, "console.log(msg);");
    }
}
