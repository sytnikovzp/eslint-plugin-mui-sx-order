import { TSESLint } from '@typescript-eslint/utils';
import rule from '@/lib/rules/sort-sx-keys';

const { RuleTester } = TSESLint;

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
});

ruleTester.run('sort-sx-keys', rule, [
  {
    code: `
      const style = {
        position: 'absolute',
        top: 0,
        margin: 5,
        padding: 10,
        backgroundColor: '#fff',
      };
    `,
  },
  {
    code: `<Box sx={{ margin: 1, padding: 2, backgroundColor: '#eee' }} />`,
  },
  {
    code: `
      const style = {
        padding: 10,
        margin: 5,
      };
    `,
    output: `
      const style = {
        margin: 5,
        padding: 10,
      };
    `,
    errors: [{ messageId: 'incorrectOrder' }],
  },
]);
