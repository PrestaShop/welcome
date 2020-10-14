module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
    jquery: true,
    mocha: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  plugins: [
    'import',
  ],
  extends: [
    'prestashop',
  ],
  globals: {},
  rules: {
    'no-new': 0,
    'class-methods-use-this': 0,
  },
};
