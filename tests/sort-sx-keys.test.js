const { RuleTester } = require('eslint');
const rule = require('../dist/lib/rules/sort-sx-keys').default;

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

ruleTester.run('sort-sx-keys', rule, {
  valid: [
    {
      code: `const style = {
  position: 'absolute',
  top: 0,
  margin: 5,
  padding: 10,
  backgroundColor: '#fff',
};`,
    },
    {
      code: `<Box sx={{ margin: 1, padding: 2, backgroundColor: '#eee' }} />`,
    },
  ],
  invalid: [
    {
      code: `const style = {
  padding: 10,
  margin: 5,
};`,
      output: `const style = {
margin: 5,
padding: 10
};`,
      errors: [{ messageId: 'incorrectOrder' }],
    },
  ],
});
