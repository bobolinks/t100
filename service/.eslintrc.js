module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/essential', 'eslint:recommended'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    'no-restricted-syntax': 'off',
    'no-param-reassign': 'off',
    'max-len': ['error', { code: 240 }],
    'arrow-parens': 'off',
    'no-eval': 'off',
    'no-prototype-builtins': 'off',
    'no-multi-assign': 'off',
    'no-underscore-dangle': 'off',
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
