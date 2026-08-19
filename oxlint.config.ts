import { defineConfig } from "oxlint";

export default defineConfig({
  options: {
    typeAware: true,
    typeCheck: true,
  },
  env: {
    es2024: true,
    node: true,
  },
  ignorePatterns: ["dist/**"],
  plugins: ["typescript", "vitest"],
  overrides: [
    {
      files: ["__tests__/**/*.test.ts"],
      env: {
        vitest: true,
      },
      rules: {
        "vitest/no-focused-tests": "error",
        "vitest/no-standalone-expect": "error",
      },
    },
  ],
  rules: {
    "no-debugger": "error",
    "no-empty-function": "error",
    "no-constant-binary-expression": "error",
    "no-constant-condition": "error",
    "no-unused-expressions": "error",
    "no-duplicate-imports": "error",
    "no-cond-assign": "error",
    "no-unreachable": "error",
    "no-sequences": "error",
    "no-unsafe-finally": "error",
    "no-throw-literal": "error",
    "typescript/no-explicit-any": "off",
    "typescript/no-namespace": "off",
    "typescript/ban-types": "off",
  },
});
