use std::fs;
use std::path::{Path, PathBuf};
use anyhow::{anyhow, Context};
use crate::utils::parsers::toml::parse_package_toml;
use crate::utils::parsers::jsdoc::{parse_javascript, FunctionInfo};
use crate::utils::bundler::{bundle, has_imports, BundleOptions};

pub struct BuildOptions {
    pub project: Option<String>,
    pub output: Option<String>,
}

pub async fn exec(options: BuildOptions) -> anyhow::Result<()> {
    let project_dir = options.project.as_deref().unwrap_or(".");
    let output_dir = options.output.as_deref().unwrap_or(project_dir);

    let package_toml_path = Path::new(project_dir).join("package.toml");
    let package_toml_content = fs::read_to_string(&package_toml_path)
        .with_context(|| format!("package.toml not found at {:?}", package_toml_path))?;

    let package_toml = parse_package_toml(&package_toml_content)?;

    let entry_path = Path::new(project_dir).join(&package_toml.entry);
    let entry_content = fs::read_to_string(&entry_path)
        .with_context(|| format!("Entry file not found at {:?}", entry_path))?;

    let functions = parse_javascript(&entry_content);
    if functions.is_empty() {
        println!("Warning: No exported functions found in entry file");
    }

    let is_ts = entry_path.extension().map_or(false, |ext| ext == "ts" || ext == "tsx");
    let needs_bundling = is_ts || has_imports(&entry_content);

    let mut bundled_code = if needs_bundling {
        println!("📦 Bundling dependencies...");
        let result = bundle(BundleOptions {
            entry_point: entry_path.to_string_lossy().into_owned(),
            project_dir: project_dir.to_string(),
        }).await?;

        if result.is_typescript {
            println!("   - TypeScript transpiled");
        }
        result.code
    } else {
        // Simple JS, just remove exports
        remove_exports_only(&entry_content)
    };

    // Generate package.js content
    let package_js_content = format!(
r#"{bundled_code}

Sapphillon.Package = {{
  meta: {{
    name: "{name}",
    version: "{version}",
    description: "{description}",
    author_id: "{author_id}",
    package_id: "{package_id}"
  }},
  functions: {{
{functions_obj}
  }}
}};
"#,
        bundled_code = bundled_code,
        name = escape_js_string(&package_toml.name),
        version = escape_js_string(&package_toml.version),
        description = escape_js_string(&package_toml.description),
        author_id = escape_js_string(&package_toml.author_id),
        package_id = escape_js_string(&package_toml.package_id),
        functions_obj = generate_functions_object(&functions)
    );

    let output_path = Path::new(output_dir).join("package.js");
    fs::write(&output_path, package_js_content)?;

    println!("✅ Build complete: {:?}", output_path);
    println!("   - Found {} function(s)", functions.len());
    if needs_bundling {
        println!("   - Dependencies bundled into single file");
    }

    Ok(())
}

fn escape_js_string(s: &str) -> String {
    s.replace('\\', "\\\\")
        .replace('"', "\\\"")
        .replace('\n', "\\n")
        .replace('\r', "\\r")
        .replace('\t', "\\t")
}

fn remove_exports_only(code: &str) -> String {
    let re_keyword = regex::Regex::new(r"(?m)^export\s+").unwrap();
    re_keyword.replace_all(code, "").trim().to_string()
}

fn generate_functions_object(functions: &[FunctionInfo]) -> String {
    let mut entries = Vec::new();

    for fn_info in functions {
        let permissions: Vec<String> = fn_info.permissions.iter()
            .map(|p| format!(r#"{{type: "{}", resource: "{}"}}"#, escape_js_string(&p.r#type), escape_js_string(&p.resource)))
            .collect();

        let parameters: Vec<String> = fn_info.parameters.iter()
            .map(|p| format!(r#"{{ name: "{}", idx: {}, type: "{}", description: "{}" }}"#,
                escape_js_string(&p.name), p.idx, escape_js_string(&p.r#type), escape_js_string(&p.description)))
            .collect();

        let returns: Vec<String> = fn_info.returns.iter()
            .map(|r| format!(r#"{{ type: "{}", idx: {}, description: "{}" }}"#,
                escape_js_string(&r.r#type), r.idx, escape_js_string(&r.description)))
            .collect();

        let params_str = if parameters.is_empty() { "[]".to_string() } else { format!("[\n        {}\n      ]", parameters.join(",\n        ")) };
        let returns_str = if returns.is_empty() { "[]".to_string() } else { format!("[\n        {}\n      ]", returns.join(",\n        ")) };

        entries.push(format!(
r#"    {name}: {{
      handler: {name},
      permissions: [{permissions}],
      description: "{description}",
      parameters: {parameters},
      returns: {returns}
    }}"#,
            name = fn_info.name,
            permissions = permissions.join(", "),
            description = escape_js_string(&fn_info.description),
            parameters = params_str,
            returns = returns_str
        ));
    }

    entries.join(",\n")
}
