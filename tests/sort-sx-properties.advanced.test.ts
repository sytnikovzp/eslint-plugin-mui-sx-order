import { RuleTester } from 'eslint';
import rule from '../dist/lib/rules/sort-sx-properties';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

describe('sort-sx-properties advanced cases', () => {
  it('should preserve spread elements and only sort adjacent Properties', () => {
    ruleTester.run('sort-sx-properties', rule, {
      valid: [],
      invalid: [
        {
          code: `const sx = { c: 3, a: 1, ...rest, b: 2 };`,
          // Expected: sort only the block [c, a] before the spread, and [b] remains after
          output: `const sx = { a: 1, c: 3, ...rest, b: 2 };`,
          errors: [{ messageId: 'incorrectOrder' }],
        },
      ],
    });
  });

  it('should preserve comments and formatting', () => {
    ruleTester.run('sort-sx-properties', rule, {
      valid: [],
      invalid: [
        {
          code: `const sx = {\n  /* top-level comment */\n  padding: 10, // pad\n  // between\n  margin: 5,\n};`,
          output: `const sx = {\n  /* top-level comment */\n  margin: 5, // pad\n  // between\n  padding: 10\n};`,
          errors: [{ messageId: 'incorrectOrder' }],
        },
      ],
    });
  });

  it('should handle responsive objects and nested sorting', () => {
    ruleTester.run('sort-sx-properties', rule, {
      valid: [],
      invalid: [
        {
          code: `const sx = {\n  md: { padding: 2, margin: 1 },\n  sm: { margin: 1, padding: 2 },\n};`,
          output: `const sx = {\n  sm: {\nmargin: 1,\npadding: 2\n  },\n  md: {\nmargin: 1,\npadding: 2\n  }\n};`,
          errors: [{ messageId: 'incorrectOrder' }],
        },
      ],
    });
  });

  it.skip('should only process createStyles when imported from MUI', () => {
    // For this test we simulate code that uses createStyles as identifier
    // The improved rule should check import source to avoid false positives
    ruleTester.run('sort-sx-properties', rule, {
      valid: [
        {
          code: `import { createStyles as notMui } from 'not-mui';\nconst styles = notMui({ padding: 2, margin: 1 });`,
        },
      ],
      invalid: [
        {
          code: `import { createStyles } from '@mui/styles';\nconst styles = createStyles({ padding: 2, margin: 1 });`,
          output: `import { createStyles } from '@mui/styles';\nconst styles = createStyles({\nmargin: 1,\npadding: 2\n});`,
          errors: [{ messageId: 'incorrectOrder' }],
        },
      ],
    });
  });
});
