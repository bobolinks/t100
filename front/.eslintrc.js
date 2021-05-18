module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    '@tencent/eslint-config-tencent',
    'plugin:vue/base',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'max-len': ['error', { code: 240 }],
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
