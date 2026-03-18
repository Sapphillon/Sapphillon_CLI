use assert_cmd::Command;
use predicates::prelude::*;
use std::fs;
use tempfile::tempdir;

#[test]
fn test_init_basic() -> anyhow::Result<()> {
    let dir = tempdir()?;
    let mut cmd = Command::cargo_bin("sapphillon")?;

    cmd.current_dir(dir.path())
        .arg("init")
        .arg("test-plugin")
        .assert()
        .success();

    let plugin_dir = dir.path().join("test-plugin");
    assert!(plugin_dir.is_dir());
    assert!(plugin_dir.join("package.toml").is_file());
    assert!(plugin_dir.join("src/index.js").is_file());

    let toml_content = fs::read_to_string(plugin_dir.join("package.toml"))?;
    assert!(toml_content.contains(r#"name = "test-plugin""#));
    assert!(toml_content.contains(r#"package_id = "com.example""#));

    Ok(())
}

#[test]
fn test_init_ts() -> anyhow::Result<()> {
    let dir = tempdir()?;
    let mut cmd = Command::cargo_bin("sapphillon")?;

    cmd.current_dir(dir.path())
        .arg("init")
        .arg("ts-plugin")
        .arg("--language")
        .arg("typescript")
        .assert()
        .success();

    let plugin_dir = dir.path().join("ts-plugin");
    assert!(plugin_dir.join("src/index.ts").is_file());

    let toml_content = fs::read_to_string(plugin_dir.join("package.toml"))?;
    assert!(toml_content.contains(r#"entry = "src/index.ts""#));

    Ok(())
}

#[test]
fn test_build_basic() -> anyhow::Result<()> {
    let dir = tempdir()?;

    // First init
    let mut init_cmd = Command::cargo_bin("sapphillon")?;
    init_cmd.current_dir(dir.path())
        .arg("init")
        .arg("my-plugin")
        .assert()
        .success();

    let plugin_dir = dir.path().join("my-plugin");

    // Then build
    let mut build_cmd = Command::cargo_bin("sapphillon")?;
    build_cmd.current_dir(&plugin_dir)
        .arg("build")
        .assert()
        .success();

    assert!(plugin_dir.join("package.js").is_file());
    let package_js = fs::read_to_string(plugin_dir.join("package.js"))?;
    assert!(package_js.contains("Sapphillon.Package"));
    assert!(package_js.contains(r#"name: "my-plugin""#));
    assert!(package_js.contains("add: {"));

    Ok(())
}

#[test]
fn test_help() -> anyhow::Result<()> {
    let mut cmd = Command::cargo_bin("sapphillon")?;
    cmd.arg("--help")
        .assert()
        .success()
        .stdout(predicate::str::contains("A command-line tool for creating and building Sapphillon plugin packages"));
    Ok(())
}
