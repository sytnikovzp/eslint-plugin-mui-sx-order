function getKey(prop) {
  if (!prop.key) {
    return '';
  }
  return prop.key.name || prop.key.value || '';
}

function sortProperties(properties, getOrder) {
  return [...properties].sort((a, b) => {
    const aKey = getKey(a);
    const bKey = getKey(b);
    return getOrder(aKey) - getOrder(bKey);
  });
}

function isStyleObjectName(name) {
  return typeof name === 'string' && name.toLowerCase().includes('style');
}

module.exports = { getKey, sortProperties, isStyleObjectName };
