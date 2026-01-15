# Sapphillon Package Specification

This document describes the structure and format of Sapphillon plugin packages.

## Overview

Sapphillon plugins are built from source files into a single `package.js` file that contains both the executable code and metadata about the plugin.

## Pre-Build Structure

A plugin project has the following structure:

```
my-plugin/
├── package.toml   # パッケージ全体の定義（名前、バージョン、author_id等）
└── src/
    └── index.js   # エントリーポイント（または index.ts）
```

## package.toml

The `package.toml` file defines the plugin metadata. This file is required and must be placed in the root of the plugin directory.

### Format

```toml
[package]
name = "my-awesome-plugin"
version = "1.0.0"
description = "テキスト処理用の便利関数セット"
entry = "src/index.js"
author_id = "app.sapphillon"
```

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | The human-readable name of the plugin |
| `version` | Yes | Semantic version (e.g., "1.0.0") |
| `description` | Yes | A brief description of the plugin |
| `entry` | No | Entry file path (default: "src/index.js") |
| `author_id` | Yes | Author identifier in reverse domain format (e.g., "app.sapphillon") |

> [!NOTE]
> `package_id` is automatically generated from `author_id.name`. For example, if `author_id` is "app.sapphillon" and `name` is "My Awesome Plugin", the `package_id` will be "app.sapphillon.my-awesome-plugin".

## Entry File (index.js / index.ts)

The entry file contains the plugin's functions. Each exported function with JSDoc annotations will be included in the built package.

### JSDoc Annotations

Use JSDoc comments to describe functions and specify required permissions:

```javascript
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
```

### Supported Annotations

| Annotation | Format | Description |
|------------|--------|-------------|
| Description | First non-tag line | Function description (used in `description` field) |
| `@param` | `@param {type} name - description` | Parameter definition |
| `@returns` | `@returns {type} description` | Return value definition |
| `@permission` | `@permission ["Type:resource", ...]` | Required permissions |

### Permission Format

Permissions are specified as an array of strings in the format `"Type:resource"`:

```javascript
@permission ["FileSystemRead:/etc", "FileSystemWrite:/etc", "Net:api.example.com"]
```

Common permission types:
- `FileSystemRead` - Read access to a file or directory
- `FileSystemWrite` - Write access to a file or directory
- `Net` - Network access to a specific domain

## Built Output (package.js)

After building with `sapphillon build`, a `package.js` file is generated that contains the bundled code and metadata.

### Format

```javascript
function add(a, b) {
  return a + b;
}

Sapphillon.Package = {
  // package.toml からの情報
  meta: {
    name: "my-awesome-plugin",
    version: "1.0.0",
    description: "テキスト処理用の便利関数セット",
    author_id: "app.sapphillon",
    package_id: "app.sapphillon.my-awesome-plugin"
  },
  // JSDocから生成されたスキーマ情報
  functions: {
    add: {
      handler: add,         // 実際の関数参照
      permissions: [
        { type: "FileSystemRead", resource: "/etc" },
        { type: "FileSystemWrite", resource: "/etc" }
      ],
      description: "2つの数値を加算します。",
      parameters: [
        { name: "a", idx: 0, type: "number", description: "足される数" },
        { name: "b", idx: 1, type: "number", description: "足す数" }
      ],
      returns: [
        { type: "number", idx: 0, description: "合計" }
      ]
    }
  }
};
```

### Sapphillon.Package Structure

#### meta

| Field | Description |
|-------|-------------|
| `name` | Plugin name from package.toml |
| `version` | Version string from package.toml |
| `description` | Description from package.toml |
| `author_id` | Author identifier from package.toml |
| `package_id` | Auto-generated: `{author_id}.{name-slug}` |

#### functions

Each function is an object with:

| Field | Description |
|-------|-------------|
| `handler` | Reference to the actual function |
| `permissions` | Array of `{ type, resource }` objects |
| `description` | Function description from JSDoc |
| `parameters` | Array of parameter definitions |
| `returns` | Array of return value definitions |

##### Parameter Definition

```javascript
{ name: "paramName", idx: 0, type: "number", description: "Description" }
```

##### Return Definition

```javascript
{ type: "number", idx: 0, description: "Description" }
```

## Building

To build a plugin:

```bash
# In the plugin directory
sapphillon build

# Or specify a project directory
sapphillon build --project ./my-plugin
```

## Example

See the `examples/` directory for complete plugin examples:

- `examples/javascript-plugin/` - Simple JavaScript plugin
- `examples/typescript-plugin/` - TypeScript plugin with type annotations
- `examples/weather-forecast-plugin/` - Plugin with async functions and network access
