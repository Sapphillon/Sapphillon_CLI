/**
 * Bundler utility using esbuild for JavaScript and TypeScript files
 * Produces IIFE format output (similar to webpack)
 */

import * as esbuild from "npm:esbuild@0.24.2";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@0.11.1";

export interface BundleOptions {
  entryPoint: string;
  projectDir: string;
}

export interface BundleResult {
  code: string;
  isTypeScript: boolean;
}

/**
 * Check if the entry file uses TypeScript
 */
function isTypeScriptFile(entryPoint: string): boolean {
  return entryPoint.endsWith(".ts") || entryPoint.endsWith(".tsx");
}

/**
 * Bundle the entry point and all its dependencies into a single JavaScript string
 * Uses esbuild to produce IIFE format output (similar to webpack)
 */
export async function bundle(options: BundleOptions): Promise<BundleResult> {
  const { entryPoint } = options;
  const isTypeScript = isTypeScriptFile(entryPoint);

  try {
    const result = await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      write: false, // Return output in memory
      format: "iife", // IIFE format (similar to webpack)
      platform: "browser", // Target browser environment
      target: "es2020",
      minify: false, // Keep readable
      sourcemap: false,
      treeShaking: true,
      charset: "utf8", // Preserve non-ASCII characters (Japanese, etc.)
      legalComments: "none", // Remove all comments
      plugins: [...denoPlugins()],
      // Don't wrap in global name since we'll append Sapphillon.Package
      globalName: undefined,
    });

    if (result.errors.length > 0) {
      const errorMessages = result.errors.map((e) => e.text).join("\n");
      throw new Error(`Bundling failed:\n${errorMessages}`);
    }

    if (result.outputFiles.length === 0) {
      throw new Error("No output generated from bundler");
    }

    let code = result.outputFiles[0].text;

    // Remove the IIFE wrapper for cleaner integration with Sapphillon.Package
    // esbuild produces: (() => { ... })();
    // We want the inner content to be available in global scope
    code = unwrapIIFE(code);

    return {
      code: code.trim(),
      isTypeScript,
    };
  } finally {
    // Always stop esbuild to clean up resources
    await esbuild.stop();
  }
}

/**
 * Unwrap IIFE to expose functions in global scope and remove comments
 * Converts: (() => { function foo() {} })();
 * To: function foo() {}
 */
function unwrapIIFE(code: string): string {
  let inner = code;

  // Check if it's an IIFE: (() => { ... })();
  const iifeMatch = code.match(/^\s*\(\(\)\s*=>\s*\{([\s\S]*)\}\)\(\);\s*$/);
  if (iifeMatch) {
    inner = iifeMatch[1].trim();
  } else {
    // Also handle: (function() { ... })();
    const iifeFuncMatch = code.match(/^\s*\(function\s*\(\)\s*\{([\s\S]*)\}\)\(\);\s*$/);
    if (iifeFuncMatch) {
      inner = iifeFuncMatch[1].trim();
    }
  }

  // Remove "use strict" if present
  inner = inner.replace(/^"use strict";\s*/m, "");

  // Remove single-line comments (esbuild path comments like "// path/to/file.js")
  inner = inner.replace(/^\s*\/\/[^\n]*\n/gm, "");

  // Remove empty lines left over
  inner = inner.replace(/\n\s*\n\s*\n/g, "\n\n");

  return inner.trim();
}

/**
 * Check if the source code contains import statements
 */
export function hasImports(content: string): boolean {
  // Match any import statements
  const importRegex = /^\s*import\s+/gm;
  return importRegex.test(content);
}
