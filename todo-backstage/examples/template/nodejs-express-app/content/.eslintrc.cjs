module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
{{#if useTypeScript}}
    '@typescript-eslint/recommended',
{{/if}}
  ],
  parser: {{#if useTypeScript}}'@typescript-eslint/parser'{{else}}'espree'{{/if}},
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
{{#if useTypeScript}}
    '@typescript-eslint',
{{/if}}
  ],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'off',
{{#if useTypeScript}}
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
{{/if}}
  },
};