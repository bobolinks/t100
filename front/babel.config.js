module.exports = {
  presets: [
    ['@vue/app'],
    [
      '@babel/preset-env',
      {
        corejs: 3,
        useBuiltIns: 'usage'
      }
    ]
  ],
  plugins: ['@babel/plugin-proposal-optional-chaining'],
};
