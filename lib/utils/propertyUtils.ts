import type { TSESTree } from '@typescript-eslint/utils';

function getKey(prop: TSESTree.ObjectLiteralElement): string {
  if (prop.type !== 'Property') return '';
  if (prop.key.type === 'Identifier') return prop.key.name;
  if (prop.key.type === 'Literal') return String(prop.key.value);
  return '';
}

function sortProperties(
  properties: TSESTree.ObjectLiteralElement[],
  getOrder: (key: string) => number
): TSESTree.ObjectLiteralElement[] {
  return [...properties].sort((a, b) => {
    if (a.type !== 'Property') return 0;
    if (b.type !== 'Property') return 0;
    const aKey = getKey(a);
    const bKey = getKey(b);
    return getOrder(aKey) - getOrder(bKey);
  });
}

function isStyleObjectName(name: unknown): boolean {
  return typeof name === 'string' && /style/i.test(name);
}

export { getKey, sortProperties, isStyleObjectName };
