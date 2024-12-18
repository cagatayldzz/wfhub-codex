import eslintPluginTypescript from "@typescript-eslint/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";
import eslintPluginPrettier from "eslint-plugin-prettier";
import perfectionist from "eslint-plugin-perfectionist";
import ts from "typescript-eslint";

const perfectionistList = {
  "perfectionist/sort-imports": [
    "error",
    {
      customGroups: {
        value: {
          node: ["path", "fs"],
          wfcd: ["warframe-items"],
          utils: ["./utils/.*"],
        },
      },
      groups: ["node", "wfcd", "utils"],
      type: "line-length",
      ignoreCase: true,
      order: "desc",
    },
  ],
  "perfectionist/sort-objects": [
    "error",
    {
      partitionByComment: false,
      partitionByNewLine: false,
      type: "line-length",
      ignoreCase: true,
      order: "desc",
    },
  ],
  "perfectionist/sort-named-imports": [
    "error",
    {
      type: "line-length",
      ignoreAlias: false,
      groupKind: "mixed",
      ignoreCase: true,
      order: "desc",
    },
  ],
  "perfectionist/sort-object-types": [
    "error",
    {
      partitionByNewLine: false,
      type: "line-length",
      ignoreCase: true,
      order: "desc",
    },
  ],
  "perfectionist/sort-named-exports": [
    "error",
    {
      type: "line-length",
      groupKind: "mixed",
      ignoreCase: true,
      order: "desc",
    },
  ],
  "perfectionist/sort-intersection-types": [
    "error",
    {
      type: "line-length",
      ignoreCase: true,
      order: "desc",
    },
  ],
  "perfectionist/sort-switch-case": [
    "error",
    {
      type: "line-length",
      ignoreCase: true,
      order: "desc",
    },
  ],
  "perfectionist/sort-union-types": [
    "error",
    {
      type: "line-length",
      ignoreCase: true,
      order: "desc",
    },
  ],
  "perfectionist/sort-interfaces": [
    "error",
    {
      type: "line-length",
      ignoreCase: true,
      order: "desc",
    },
  ],
  "perfectionist/sort-jsx-props": [
    "error",
    {
      type: "line-length",
      ignoreCase: true,
      order: "desc",
    },
  ],
  "perfectionist/sort-exports": [
    "error",
    {
      type: "line-length",
      ignoreCase: true,
      order: "desc",
    },
  ],
  "perfectionist/sort-maps": [
    "error",
    {
      type: "line-length",
      ignoreCase: true,
      order: "desc",
    },
  ],
};

/** @type { import("eslint").Linter.Config[] } */
export default [
  ...ts.configs.recommended,
  {
    ignores: ["dist"],
  },
  {
    rules: {
      ...perfectionistList,
      "no-multiple-empty-lines": ["error", { maxEOF: 0, max: 1 }],
      "@typescript-eslint/no-empty-function": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-var": "off",
      "@typescript-eslint/no-namespace": "off",
      "no-constant-binary-expression": "error",
      "@typescript-eslint/ban-types": "off",
      "react-hooks/exhaustive-deps": "off",
      "no-constant-condition": "error",
      "no-unused-expressions": "error",
      "no-duplicate-imports": "error",
      "no-cond-assign": "error",
      "no-unreachable": "error",
      "spaced-comment": "error",
      "no-sequences": "error",
      "no-unused-vars": "off",
      "no-undef": "off",
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: "module",
        ecmaVersion: 2020,
      },
      parser: typescriptEslintParser,
    },
    plugins: {
      "@typescript-eslint": eslintPluginTypescript,
      prettier: eslintPluginPrettier,
      perfectionist,
    },
    files: ["**/*.{js,ts,mjs,cjs}"],
  },
];
