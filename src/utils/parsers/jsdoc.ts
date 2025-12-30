/**
 * JSDoc parser for extracting function metadata from JavaScript files
 */

export interface ParameterInfo {
  name: string;
  idx: number;
  type: string;
  description: string;
}

export interface ReturnInfo {
  type: string;
  idx: number;
  description: string;
}

export interface PermissionInfo {
  type: string;
  resource: string;
}

export interface FunctionInfo {
  name: string;
  description: string;
  parameters: ParameterInfo[];
  returns: ReturnInfo[];
  permissions: PermissionInfo[];
  body: string;
}

/**
 * Extract all exported functions with their JSDoc comments from a JavaScript file
 */
export function parseJavaScript(content: string): FunctionInfo[] {
  const functions: FunctionInfo[] = [];

  // Match JSDoc comment followed by export function
  const jsdocFunctionRegex =
    /\/\*\*\s*([\s\S]*?)\s*\*\/\s*\nexport\s+function\s+(\w+)\s*\(([^)]*)\)\s*\{([\s\S]*?)\n\}/g;

  let match;
  while ((match = jsdocFunctionRegex.exec(content)) !== null) {
    const jsdocContent = match[1];
    const functionName = match[2];
    const params = match[3];
    const body = match[4];

    const functionInfo = parseJsDoc(jsdocContent, functionName, params, body);
    functions.push(functionInfo);
  }

  return functions;
}

/**
 * Parse JSDoc comment content and extract metadata
 */
function parseJsDoc(
  jsdocContent: string,
  functionName: string,
  _params: string,
  body: string,
): FunctionInfo {
  const lines = jsdocContent.split("\n").map((line) =>
    line.replace(/^\s*\*\s?/, "").trim()
  );

  let description = "";
  const parameters: ParameterInfo[] = [];
  const returns: ReturnInfo[] = [];
  const permissions: PermissionInfo[] = [];

  let paramIdx = 0;
  let returnIdx = 0;

  for (const line of lines) {
    // Parse @param {type} name - description
    const paramMatch = line.match(/@param\s+\{([^}]+)\}\s+(\w+)\s*(?:-\s*(.*))?/);
    if (paramMatch) {
      parameters.push({
        name: paramMatch[2],
        idx: paramIdx++,
        type: paramMatch[1],
        description: paramMatch[3] || "",
      });
      continue;
    }

    // Parse @returns {type} description
    const returnMatch = line.match(/@returns?\s+\{([^}]+)\}\s*(.*)/);
    if (returnMatch) {
      returns.push({
        type: returnMatch[1],
        idx: returnIdx++,
        description: returnMatch[2] || "",
      });
      continue;
    }

    // Parse @permission ["FileSystemRead:/etc", "FileSystemWrite:/etc"]
    const permissionMatch = line.match(/@permission\s+\[(.*)\]/);
    if (permissionMatch) {
      const permissionStr = permissionMatch[1];
      // Parse the permission strings like "FileSystemRead:/etc"
      const permRegex = /"([^:]+):([^"]+)"/g;
      let permMatch;
      while ((permMatch = permRegex.exec(permissionStr)) !== null) {
        permissions.push({
          type: permMatch[1],
          resource: permMatch[2],
        });
      }
      continue;
    }

    // If not a tag and we haven't collected description yet
    if (!line.startsWith("@") && !description) {
      description = line;
    }
  }

  return {
    name: functionName,
    description,
    parameters,
    returns,
    permissions,
    body: body.trim(),
  };
}
