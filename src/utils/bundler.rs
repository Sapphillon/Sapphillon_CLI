use std::path::Path;
use anyhow::{anyhow, Context};
use std::fs;
use regex::Regex;

pub struct BundleOptions {
    pub entry_point: String,
    pub project_dir: String,
}

pub struct BundleResult {
    pub code: String,
    pub is_typescript: bool,
}

/// A simplified bundler that handles TypeScript transpilation and basic merging.
/// For this initial Rust rewrite, we'll focus on transpilation and basic export removal.
/// We'll use a regex-based transpiler for simple TS cases if SWC is having dependency issues,
/// or try to fix the SWC setup.
pub async fn bundle(options: BundleOptions) -> anyhow::Result<BundleResult> {
    let entry_path = Path::new(&options.entry_point);
    let is_typescript = entry_path.extension().map_or(false, |ext| ext == "ts" || ext == "tsx");

    let content = fs::read_to_string(entry_path)
        .with_context(|| format!("Failed to read entry point: {}", options.entry_point))?;

    let mut code = if is_typescript {
        // Fallback to a simpler approach if SWC fails
        simple_transpile_ts(&content)
    } else {
        content
    };

    // Simple export removal to match the original behavior
    code = remove_exports(&code);

    Ok(BundleResult {
        code: code.trim().to_string(),
        is_typescript,
    })
}

fn simple_transpile_ts(content: &str) -> String {
    // Very basic TS to JS conversion: remove type annotations
    // This is not a complete transpiler but covers basic cases for our plugins
    let mut code = content.to_string();

    // Remove ': number', ': string', ': boolean', ': void', etc.
    let re_types = Regex::new(r":\s*(number|string|boolean|void|any|string\[\]|number\[\])").unwrap();
    code = re_types.replace_all(&code, "").to_string();

    // Remove 'as string', etc.
    let re_as = Regex::new(r"\s+as\s+\w+").unwrap();
    code = re_as.replace_all(&code, "").to_string();

    code
}

fn remove_exports(code: &str) -> String {
    let re_named = Regex::new(r"(?m)^export\s+\{[^}]*\};?\s*$").unwrap();
    let re_keyword = Regex::new(r"(?m)^export\s+").unwrap();

    let step1 = re_named.replace_all(code, "");
    re_keyword.replace_all(&step1, "").to_string()
}

pub fn has_imports(content: &str) -> bool {
    let re = Regex::new(r"(?m)^\s*import\s+").unwrap();
    re.is_match(content)
}
