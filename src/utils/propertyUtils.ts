function getKey(prop: any): string {
  if (!prop.key) {
    return '';
  }
  return prop.key.name || prop.key.value || '';
}

function sortProperties(
  properties: any[],
  getOrder: (key: string) => number
): any[] {
  return [...properties].sort((a, b) => {
    const aKey = getKey(a);
    const bKey = getKey(b);
    return getOrder(aKey) - getOrder(bKey);
  });
}

function isStyleObjectName(name: unknown): boolean {
  return typeof name === 'string' && name.toLowerCase().includes('style');
}

export { getKey, sortProperties, isStyleObjectName };
