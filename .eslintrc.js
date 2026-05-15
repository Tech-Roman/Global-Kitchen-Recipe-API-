module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    // Enforce consistent use of async/await over raw callbacks
    'no-await-in-loop': 'warn',

    // Prevent accidental console.log left in production
    'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],

    // Catch undefined variables early
    'no-undef': 'error',

    // Enforce const where variables are never reassigned
    'prefer-const': 'error',

    // Consistent semicolons
    semi: ['error', 'always'],

    // Single quotes for strings
    quotes: ['error', 'single'],

    // 2-space indentation
    indent: ['error', 2],

    // No unused variables
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

    // Enforce === over ==
    eqeqeq: ['error', 'always'],
  },
};
