module.exports = {
  env: {
    browser: true,
    node: true,
    commonjs: true,
    es6: true,
  },
  extends: [
    "standard-with-typescript"
  ],
  rules: {
    "@typescript-eslint/no-namespace": "off",
    "no-inner-declarations": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/indent": ["error", 4],
    "@typescript-eslint/prefer-ts-expect-error":"off",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/no-this-alias":"off"
    // 'no-param-reassign': 'off',
    // 'no-unused-expressions': 'off',
    // 'prefer-destructuring': 'off',
    // 'class-methods-use-this': 'off',
    // 'no-case-declarations': 'off',
    // 'no-plusplus': ['error', { 'allowForLoopAfterthoughts': true }],
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: "./tsconfig.json"
  }
}