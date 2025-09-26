import { ESLint } from 'eslint';
import sortSxKeys from './lib/rules/sort-sx-keys';

const plugin: ESLint.Plugin = {
  rules: {
    'sort-sx-keys': sortSxKeys,
  },
};

export default plugin;
