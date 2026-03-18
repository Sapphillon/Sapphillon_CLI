use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct PackageSection {
    pub name: String,
    pub version: String,
    pub description: String,
    pub entry: Option<String>,
    pub author_id: Option<String>,
    pub package_id: Option<String>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct PackageToml {
    pub package: PackageSection,
}

#[derive(Debug, Clone)]
pub struct ResolvedPackageToml {
    pub name: String,
    pub version: String,
    pub description: String,
    pub entry: String,
    pub author_id: String,
    pub package_id: String,
}

pub fn parse_package_toml(content: &str) -> anyhow::Result<ResolvedPackageToml> {
    let raw: PackageToml = toml::from_str(content)?;

    let author_id = raw.package.author_id.clone().unwrap_or_default();
    let name = raw.package.name.clone();

    // Auto-generate package_id from author_id.name if not provided
    let package_id = if let Some(pid) = raw.package.package_id {
        pid
    } else {
        if author_id.is_empty() {
            to_package_id_component(&name)
        } else {
            format!("{}.{}", author_id, to_package_id_component(&name))
        }
    };

    Ok(ResolvedPackageToml {
        name,
        version: raw.package.version,
        description: raw.package.description,
        entry: raw.package.entry.unwrap_or_else(|| "src/index.js".to_string()),
        author_id,
        package_id,
    })
}

fn to_package_id_component(name: &str) -> String {
    let re = regex::Regex::new(r"[^a-z0-9]+").unwrap();
    re.replace_all(&name.to_lowercase(), "-")
        .trim_matches('-')
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_package_toml_full() {
        let content = r#"
[package]
name = "My Plugin"
version = "1.2.3"
description = "A test plugin"
entry = "src/main.js"
author_id = "test-author"
package_id = "custom.id"
"#;
        let parsed = parse_package_toml(content).unwrap();
        assert_eq!(parsed.name, "My Plugin");
        assert_eq!(parsed.version, "1.2.3");
        assert_eq!(parsed.description, "A test plugin");
        assert_eq!(parsed.entry, "src/main.js");
        assert_eq!(parsed.author_id, "test-author");
        assert_eq!(parsed.package_id, "custom.id");
    }

    #[test]
    fn test_parse_package_toml_auto_id() {
        let content = r#"
[package]
name = "My Plugin"
version = "1.0.0"
description = "Desc"
author_id = "jules"
"#;
        let parsed = parse_package_toml(content).unwrap();
        assert_eq!(parsed.package_id, "jules.my-plugin");
    }

    #[test]
    fn test_to_package_id_component() {
        assert_eq!(to_package_id_component("My Plugin!"), "my-plugin");
        assert_eq!(to_package_id_component("--Test--"), "test");
    }
}
