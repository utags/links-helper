/** @type {import('xo').FlatXoConfig} */
const xoConfig = [
  {
    ignores: ["build/**/*", "**/*.user.js"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    space: 2,
    prettier: "compat",
    languageOptions: {
      globals: {
        document: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "objectLiteralProperty",
          format: null,
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
      "import-x/extensions": 0,
      "n/file-extension-in-import": 0,
      "import-x/order": 0,
      "@typescript-eslint/unified-signatures": 0,
      "@typescript-eslint/prefer-nullish-coalescing": 0,
      "@typescript-eslint/prefer-optional-chain": 0,
      "logical-assignment-operators": 0,
      "unicorn/prevent-abbreviations": 0,
      "capitalized-comments": 0,
      "prefer-destructuring": 0,
      "new-cap": 0,
      // temp
      "@typescript-eslint/no-unsafe-assignment": 0,
      "@typescript-eslint/no-unsafe-call": 0,
    },
  },
  {
    files: ["src/**/*.ts"],
    rules: {
      "@stylistic/indent": 0,
      "@stylistic/indent-binary-ops": 0,
    },
  },
  {
    files: ["scripts/**/*.mjs"],
    rules: {
      "@stylistic/indent": 0,
      "@stylistic/indent-binary-ops": 0,
      "unicorn/no-process-exit": 0,
    },
  },
  {
    files: "src/messages/*.ts",
    rules: {
      "@typescript-eslint/naming-convention": 0,
    },
  },
]

export default xoConfig
