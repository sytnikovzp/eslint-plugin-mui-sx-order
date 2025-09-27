import { RuleTester } from 'eslint';
import rule from '../dist/lib/rules/sort-sx-keys';

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
    {
      code: `const styles = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  margin: '16px',
  padding: '8px',
  borderRadius: '4px',
  backgroundColor: '#f5f5f5',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};`,
    },
    {
      code: `export const themeStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 1000,
  width: '100%',
  height: '100%',
};`,
    },
    {
      code: `export const stylesAuthenticatedUserBlockBox = {
  display: 'flex',
  alignItems: 'center',
};`,
    },
    {
      code: `const styles = {
  position: 'relative',
  '&:hover': {
    backgroundColor: '#f5f5f5',
    transform: 'scale(1.05)',
  },
  '&:before': {
    position: 'absolute',
    top: 0,
    left: 0,
    content: '""',
  },
};`,
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
    {
      code: `<Box sx={{ padding: 2, margin: 1, backgroundColor: '#eee' }} />`,
      output: `<Box sx={{\nmargin: 1,\npadding: 2,\nbackgroundColor: '#eee'\n}} />`,
      errors: [{ messageId: 'incorrectOrder' }],
    },
    {
      code: `const styles = {
  backgroundColor: '#f5f5f5',
  position: 'relative',
  padding: '8px',
  margin: '16px',
  display: 'flex',
};`,
      output: `const styles = {
position: 'relative',
display: 'flex',
margin: '16px',
padding: '8px',
backgroundColor: '#f5f5f5'
};`,
      errors: [{ messageId: 'incorrectOrder' }],
    },
    {
      code: `export const stylesAuthenticatedUserBlockBox = {
  alignItems: 'center',
  display: 'flex',
};`,
      output: `export const stylesAuthenticatedUserBlockBox = {
display: 'flex',
alignItems: 'center'
};`,
      errors: [{ messageId: 'incorrectOrder' }],
    },
  ],
});
