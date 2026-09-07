import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist", "legacy", "node_modules", "playwright-report", "test-results"] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "e2e/**"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
    },
  },
  { files: ["**/*.js", "**/*.mjs"], ...tseslint.configs.disableTypeChecked },
);
