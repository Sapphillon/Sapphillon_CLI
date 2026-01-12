/**
 * 2つの数値を加算します。
 * @param {number} a - 足される数
 * @param {number} b - 足す数
 * @returns {number} 合計
 * @permission ["FileSystemRead:/etc", "FileSystemWrite:/etc"]
 */
function add(a, b) {
  return a + b;
}

Sapphillon.Package = {
  meta: {
    name: "TypeScript Example",
    version: "1.0.0",
    description: "A simple TypeScript-based plugin example.",
    package_id: "com.example.typescript"
  },
  functions: {
    add: {
      handler: add,
      permissions: [{type: "FileSystemRead", resource: "/etc"}, {type: "FileSystemWrite", resource: "/etc"}],
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
