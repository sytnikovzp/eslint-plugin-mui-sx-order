"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const sort_sx_keys_1 = __importDefault(require("../lib/rules/sort-sx-keys"));
const ruleTester = new utils_1.TSESLint.RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
    },
});
ruleTester.run('sort-sx-keys', sort_sx_keys_1.default, {
    valid: [
        {
            code: `
        const buttonStyle = {
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
        {
            code: `
        const styles = {
          display: 'flex',
          '&:hover': {
            color: 'red',
            backgroundColor: 'yellow',
          }
        };
      `,
        },
        {
            code: `
        <Box sx={[{ display: 'flex', justifyContent: 'center', alignItems: 'center' }]} />
      `,
        },
        {
            code: `
        const styles = {
          display: 'flex',
          '&:hover': {
            backgroundColor: 'yellow',
            color: 'red',
          }
        };
      `,
        },
    ],
    invalid: [
        {
            code: `
        const buttonStyle = {
          backgroundColor: 'red',
          display: 'flex',
          justifyContent: 'center',
        };
      `,
            errors: [{ messageId: 'incorrectOrder' }],
            output: `
        const buttonStyle = {
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: 'red',
        };
      `,
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
            output: `
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: 'blue',
        }} />
      `,
        },
        {
            code: `
        <Box sx={[{ backgroundColor: 'blue', display: 'flex' }]} />
      `,
            errors: [{ messageId: 'incorrectOrder' }],
            output: `
        <Box sx={[{ display: 'flex', backgroundColor: 'blue' }]} />
      `,
        },
    ],
});
//# sourceMappingURL=sort-sx-keys.test.js.map