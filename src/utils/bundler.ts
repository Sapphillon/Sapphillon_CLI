/**
 * Bundler utility using esbuild for JavaScript and TypeScript files
 * Produces IIFE format output (similar to webpack)
 */

import * as esbuild from "esbuild";
import { denoPlugins } from "@luca/esbuild-deno-loader";

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
 * Unwrap IIFE to expose functions in global scope
 * Converts: (() => { function foo() {} })();
 * To: function foo() {}
 */
function unwrapIIFE(code: string): string {
  // Check if it's an IIFE: (() => { ... })();
  const iifeMatch = code.match(/^\s*\(\(\)\s*=>\s*\{([\s\S]*)\}\)\(\);\s*$/);
  if (iifeMatch) {
    let inner = iifeMatch[1].trim();

    // Remove "use strict" if present
    inner = inner.replace(/^"use strict";\s*/m, "");

    // Handle var declarations at the start (esbuild artifact)
    // Convert: var funcName = ...; to proper function declarations
    // This is complex, so we'll just clean up the output

    return inner;
  }

  // Also handle: (function() { ... })();
  const iifeFuncMatch = code.match(/^\s*\(function\s*\(\)\s*\{([\s\S]*)\}\)\(\);\s*$/);
  if (iifeFuncMatch) {
    let inner = iifeFuncMatch[1].trim();
    inner = inner.replace(/^"use strict";\s*/m, "");
    return inner;
  }

  // If not IIFE wrapped, return as-is
  return code;
}

/**
 * Check if the source code contains import statements
 */
export function hasImports(content: string): boolean {
  // Match any import statements
  const importRegex = /^\s*import\s+/gm;
  return importRegex.test(content);
}
