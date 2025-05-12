module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // built files
    "/generated/**/*", // generated files
    "test-itinerary.ts", // don’t lint your standalone runner
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    // your stylistic preferences
    "quotes": ["error", "double"],
    "indent": ["error", 2],

    // turn off rules that are blocking you today
    "max-len": "off",
    "camelcase": "off",
    "valid-jsdoc": "off",
    "require-jsdoc": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "import/no-unresolved": 0,
  },
};
