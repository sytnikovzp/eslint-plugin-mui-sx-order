import sortSxKeys from '@/lib/rules/sort-sx-keys';

export = {
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
