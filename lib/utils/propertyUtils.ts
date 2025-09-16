import type { TSESTree } from '@typescript-eslint/utils';

function getKey(prop: TSESTree.ObjectLiteralElement): string {
  if (prop.type !== 'Property') return '';
  const key = prop.key;
  if (key.type === 'Identifier') return key.name;
  if (key.type === 'Literal') return String(key.value);
  if (key.type === 'TemplateLiteral')
    return key.quasis.map((q) => q.value.cooked).join('');
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
    
    if (aKey.startsWith('&') || bKey.startsWith('&')) {
      return 0;
    }
    
    return getOrder(aKey) - getOrder(bKey);
  });
}

function isStyleObjectName(name: unknown): boolean {
  return typeof name === 'string' && /style/i.test(name);
}

export { getKey, sortProperties, isStyleObjectName };
