/* eslint-env node */
// require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    // Needs to be the last plugin so that it can turn off conflicting
    // linter rules (including plugins) in favor of prettier config.
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "simple-import-sort"],
  overrides: [
    {
      files: ["*.ts", "*.js", "*.cjs", "*.mjs"],
      rules: {
        eqeqeq: ["error", "always", { null: "ignore" }],
      },
    },
    {
      files: ["*.ts"],
      rules: {
        "no-unused-vars": "off",
        "@typescript-eslint/consistent-type-imports": [
          "error",
          {
            prefer: "type-imports",
            disallowTypeAnnotations: true,
            fixStyle: "inline-type-imports",
          },
        ],
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            argsIgnorePattern: "^_",
          },
        ],
        "simple-import-sort/imports": [
          "error",
          // These are the default sort patterns but collapsed to remove import groups. See:
          // https://github.com/lydell/eslint-plugin-simple-import-sort#how-do-i-remove-all-blank-lines-between-imports
          { groups: [["^\\u0000", "^node:", "^@?\\w", "^", "^\\."]] },
        ],
        "simple-import-sort/exports": "error",
        "sort-imports": "off", // not compatible with simple-import-sort
      },
    },
    {
      files: ["*.js", "*.cjs", "*.mjs"],
      rules: {
        "no-unused-vars": [
          "error",
          {
            argsIgnorePattern: "^_",
          },
        ],
      },
    },
  ],
};
