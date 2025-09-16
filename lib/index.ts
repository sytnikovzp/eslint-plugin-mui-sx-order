import sortSxKeys from './rules/sort-sx-keys';

const plugin = {
  rules: {
    'sort-sx-keys': sortSxKeys,
  },
  configs: {
    recommended: {
      plugins: ['mui-sx-order'],
      rules: {
        'mui-sx-order/sort-sx-keys': 'warn',
      },
    },
  },
};

export = plugin;
