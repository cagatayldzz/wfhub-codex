import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  trailingComma: "es5",
  endOfLine: "lf",
  insertFinalNewline: true,
  ignorePatterns: ["dist/**", "data/**", "api/**", "swagger/**"],
  sortImports: {
    customGroups: [
      {
        groupName: "node",
        elementNamePattern: ["node:*", "fs", "path"],
      },
      {
        groupName: "wfcd",
        elementNamePattern: ["@wfcd/items"],
      },
      {
        groupName: "utils",
        elementNamePattern: ["./utils/**"],
      },
    ],
    groups: [
      "node",
      "wfcd",
      "utils",
      ["value-builtin", "value-external"],
      ["value-internal", "value-parent", "value-sibling", "value-index"],
      "unknown",
    ],
  },
});
