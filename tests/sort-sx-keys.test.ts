import { TSESLint } from '@typescript-eslint/utils';
import rule from '../lib/rules/sort-sx-keys';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
});

ruleTester.run('sort-sx-keys', rule, {
  valid: [
    {
      code: `
        const styles = {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'red',
        };
      `,
    },
    {
      code: `
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'blue',
        }} />
      `,
    },
  ],
  invalid: [
    {
      code: `
        const styles = {
          backgroundColor: 'red',
          display: 'flex',
          justifyContent: 'center',
        };
      `,
      errors: [{ messageId: 'incorrectOrder' }],
      output: `const styles = { display: 'flex', justifyContent: 'center', backgroundColor: 'red' };`,
    },
    {
      code: `
        <Box sx={{
          backgroundColor: 'blue',
          display: 'flex',
          justifyContent: 'center',
        }} />
      `,
      errors: [{ messageId: 'incorrectOrder' }],
      output: `<Box sx={{ display: 'flex', justifyContent: 'center', backgroundColor: 'blue' }} />`,
    },
  ],
});
