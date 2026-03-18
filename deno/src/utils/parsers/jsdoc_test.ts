import { parseJavaScript } from "./jsdoc.ts";

Deno.test("parseJavaScript - parses single exported function", () => {
  const content = `
/**
 * Adds two numbers.
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The sum
 */
export function add(a, b) {
  return a + b;
}
`;
  const functions = parseJavaScript(content);
  if (functions.length !== 1) {
    throw new Error(`Expected 1 function, got ${functions.length}`);
  }
  const fn = functions[0];
  if (fn.name !== "add") {
    throw new Error(`Expected function name 'add', got '${fn.name}'`);
  }
  if (fn.description !== "Adds two numbers.") {
    throw new Error(`Expected description 'Adds two numbers.', got '${fn.description}'`);
  }
  if (fn.parameters.length !== 2) {
    throw new Error(`Expected 2 parameters, got ${fn.parameters.length}`);
  }
  if (fn.parameters[0].name !== "a") {
    throw new Error(`Expected first param name 'a', got '${fn.parameters[0].name}'`);
  }
  if (fn.parameters[0].type !== "number") {
    throw new Error(`Expected first param type 'number', got '${fn.parameters[0].type}'`);
  }
  if (fn.returns.length !== 1) {
    throw new Error(`Expected 1 return, got ${fn.returns.length}`);
  }
  if (fn.returns[0].type !== "number") {
    throw new Error(`Expected return type 'number', got '${fn.returns[0].type}'`);
  }
});

Deno.test("parseJavaScript - parses permissions", () => {
  const content = `
/**
 * Reads a file.
 * @param {string} path - The file path
 * @returns {string} The file content
 * @permission ["FileSystemRead:/etc", "FileSystemWrite:/tmp"]
 */
export function readFile(path) {
  return "";
}
`;
  const functions = parseJavaScript(content);
  if (functions.length !== 1) {
    throw new Error(`Expected 1 function, got ${functions.length}`);
  }
  const fn = functions[0];
  if (fn.permissions.length !== 2) {
    throw new Error(`Expected 2 permissions, got ${fn.permissions.length}`);
  }
  if (fn.permissions[0].type !== "FileSystemRead") {
    throw new Error(
      `Expected first permission type 'FileSystemRead', got '${fn.permissions[0].type}'`,
    );
  }
  if (fn.permissions[0].resource !== "/etc") {
    throw new Error(
      `Expected first permission resource '/etc', got '${fn.permissions[0].resource}'`,
    );
  }
  if (fn.permissions[1].type !== "FileSystemWrite") {
    throw new Error(
      `Expected second permission type 'FileSystemWrite', got '${fn.permissions[1].type}'`,
    );
  }
});

Deno.test("parseJavaScript - parses multiple functions", () => {
  const content = `
/**
 * Function one.
 * @param {number} x - Input
 * @returns {number} Output
 */
export function one(x) {
  return x;
}

/**
 * Function two.
 * @param {string} s - Input
 * @returns {string} Output
 */
export function two(s) {
  return s;
}
`;
  const functions = parseJavaScript(content);
  if (functions.length !== 2) {
    throw new Error(`Expected 2 functions, got ${functions.length}`);
  }
  if (functions[0].name !== "one") {
    throw new Error(`Expected first function name 'one', got '${functions[0].name}'`);
  }
  if (functions[1].name !== "two") {
    throw new Error(`Expected second function name 'two', got '${functions[1].name}'`);
  }
});

Deno.test("parseJavaScript - handles Japanese descriptions", () => {
  const content = `
/**
 * 2つの数値を加算します。
 * @param {number} a - 足される数
 * @param {number} b - 足す数
 * @returns {number} 合計
 */
export function add(a, b) {
  return a + b;
}
`;
  const functions = parseJavaScript(content);
  if (functions.length !== 1) {
    throw new Error(`Expected 1 function, got ${functions.length}`);
  }
  const fn = functions[0];
  if (fn.description !== "2つの数値を加算します。") {
    throw new Error(`Expected Japanese description, got '${fn.description}'`);
  }
  if (fn.parameters[0].description !== "足される数") {
    throw new Error(`Expected Japanese param description, got '${fn.parameters[0].description}'`);
  }
});

Deno.test("parseJavaScript - parses async exported function", () => {
  const content = `
/**
 * Fetches data asynchronously.
 * @param {string} id - The resource ID
 * @returns {Promise<object>} The fetched data
 */
export async function fetchData(id) {
  return {};
}
`;
  const functions = parseJavaScript(content);
  if (functions.length !== 1) {
    throw new Error(`Expected 1 function, got ${functions.length}`);
  }
  const fn = functions[0];
  if (fn.name !== "fetchData") {
    throw new Error(`Expected function name 'fetchData', got '${fn.name}'`);
  }
  if (fn.description !== "Fetches data asynchronously.") {
    throw new Error(`Expected description 'Fetches data asynchronously.', got '${fn.description}'`);
  }
  if (fn.parameters.length !== 1) {
    throw new Error(`Expected 1 parameter, got ${fn.parameters.length}`);
  }
  if (fn.parameters[0].name !== "id") {
    throw new Error(`Expected param name 'id', got '${fn.parameters[0].name}'`);
  }
  if (fn.returns.length !== 1) {
    throw new Error(`Expected 1 return, got ${fn.returns.length}`);
  }
  if (fn.returns[0].type !== "Promise<object>") {
    throw new Error(`Expected return type 'Promise<object>', got '${fn.returns[0].type}'`);
  }
});
