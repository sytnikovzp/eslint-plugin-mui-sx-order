import sortSxProperties from './lib/rules/sort-sx-properties';

const plugin = {
  rules: {
    'sort-sx-properties': sortSxProperties,
    'sort-sx-keys': sortSxProperties,
  },
};

export = plugin;
