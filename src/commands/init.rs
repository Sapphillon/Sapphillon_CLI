use std::fs;
use std::path::Path;
use anyhow::{anyhow, Context};

pub struct InitOptions {
    pub name: String,
    pub directory: Option<String>,
    pub package_id: Option<String>,
    pub description: Option<String>,
    pub language: Option<String>,
}

pub async fn exec(options: InitOptions) -> anyhow::Result<()> {
    let language = options.language.as_deref().unwrap_or("javascript").to_lowercase();
    let is_typescript = match language.as_str() {
        "typescript" | "ts" => true,
        "javascript" | "js" => false,
        _ => return Err(anyhow!("Error: Invalid language '{}'. Use 'javascript' (js) or 'typescript' (ts)", language)),
    };

    let target_dir_str = options.directory.as_deref().unwrap_or(&options.name);
    let target_dir = validate_path(target_dir_str)?;

    if Path::new(&target_dir).exists() {
        return Err(anyhow!("Directory '{}' already exists", target_dir));
    }

    println!("📁 Creating plugin package: {}", options.name);
    println!("   Language: {}", if is_typescript { "TypeScript" } else { "JavaScript" });

    if let Err(e) = create_structure(&target_dir, &options, is_typescript) {
        // Cleanup on error
        let _ = fs::remove_dir_all(&target_dir);
        return Err(e).context("Failed to initialize plugin package");
    }

    println!("\n✅ Plugin package initialized successfully!");
    println!("\nNext steps:");
    println!("  1. cd {}", target_dir);
    let entry_file = if is_typescript { "src/index.ts" } else { "src/index.js" };
    println!("  2. Edit {} to add your plugin functions", entry_file);
    println!("  3. Run 'sapphillon build' to build your package");

    Ok(())
}

fn validate_path(path: &str) -> anyhow::Result<String> {
    let normalized = path.replace('\\', "/");
    if normalized.contains("../") || normalized.starts_with("..") {
        return Err(anyhow!("Invalid path: '{}' contains directory traversal sequences", path));
    }
    Ok(normalized)
}

fn create_structure(target_dir: &str, options: &InitOptions, is_typescript: bool) -> anyhow::Result<()> {
    fs::create_dir_all(target_dir)?;
    fs::create_dir_all(format!("{}/src", target_dir))?;

    let package_toml = generate_package_toml(options, is_typescript);
    fs::write(format!("{}/package.toml", target_dir), package_toml)?;
    println!("   ✓ Created package.toml");

    let gitignore = generate_gitignore();
    fs::write(format!("{}/.gitignore", target_dir), gitignore)?;
    println!("   ✓ Created .gitignore");

    let entry_file = if is_typescript { "index.ts" } else { "index.js" };
    let entry_content = if is_typescript { generate_index_ts() } else { generate_index_js() };
    fs::write(format!("{}/src/{}", target_dir, entry_file), entry_content)?;
    println!("   ✓ Created src/{}", entry_file);

    Ok(())
}

fn escape_toml_string(s: &str) -> String {
    s.replace('\\', "\\\\")
        .replace('"', "\\\"")
        .replace('\n', "\\n")
        .replace('\r', "\\r")
        .replace('\t', "\\t")
}

fn generate_package_toml(options: &InitOptions, is_typescript: bool) -> String {
    let package_id = options.package_id.as_deref().unwrap_or("com.example");
    let default_desc = format!("Plugin package for {}", options.name);
    let description = options.description.as_deref().unwrap_or(&default_desc);
    let entry = if is_typescript { "src/index.ts" } else { "src/index.js" };

    format!(
r#"[package]
name = "{}"
version = "1.0.0"
description = "{}"
entry = "{}"
package_id = "{}"
"#,
        escape_toml_string(&options.name),
        escape_toml_string(description),
        escape_toml_string(entry),
        escape_toml_string(package_id)
    )
}

fn generate_gitignore() -> String {
    r#"# Build outputs
package.js
*.js.map

# Dependencies
node_modules/
deno.lock

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Temporary files
*.tmp
.tmp/
tmp/
"#.to_string()
}

fn generate_index_js() -> String {
    r#"/**
 * 2つの数値を加算します。
 * @param {number} a - 足される数
 * @param {number} b - 足す数
 * @returns {number} 合計
 * @permission ["FileSystemRead:/etc", "FileSystemWrite:/etc"]
 */
export function add(a, b) {
  return a + b;
}
"#.to_string()
}

fn generate_index_ts() -> String {
    r#"/**
 * 2つの数値を加算します。
 * @param {number} a - 足される数
 * @param {number} b - 足す数
 * @returns {number} 合計
 * @permission ["FileSystemRead:/etc", "FileSystemWrite:/etc"]
 */
export function add(a: number, b: number): number {
  return a + b;
}
"#.to_string()
}
