import { RuleContext, ObjectExpression, GetOrderFunction, Property } from '../types';

/**
 * Checks if properties in an object expression are in the correct order
 * and reports violations with auto-fix capability
 */
export function checkAndReport(
  context: RuleContext,
  node: ObjectExpression,
  getOrder: GetOrderFunction
): void {
  const properties = node.properties;
  
  if (properties.length < 2) {
    return;
  }

  // First, recursively check nested objects
  properties.forEach((prop: Property) => {
    if (prop.type === 'Property' && prop.value && prop.value.type === 'ObjectExpression') {
      checkAndReport(context, prop.value, getOrder);
    }
  });

  // Get property names and their order indices
  const propertyOrders = properties
    .map((prop: Property, index: number) => {
      if (prop.type === 'Property' && (prop.key.type === 'Identifier' || prop.key.type === 'Literal')) {
        const keyName = prop.key.type === 'Identifier' ? prop.key.name : String(prop.key.value);
        return {
          name: keyName,
          order: getOrder(keyName),
          originalIndex: index,
          property: prop,
        };
      }
      return null;
    })
    .filter((item: any): item is NonNullable<typeof item> => item !== null);

  // Check if properties are already sorted
  const isSorted = propertyOrders.every((item: any, index: number) => {
    if (index === 0) return true;
    return item.order >= propertyOrders[index - 1]!.order;
  });

  if (isSorted) {
    return;
  }

  // Sort properties by order
  const sortedProperties = [...propertyOrders].sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    // If order is the same, maintain original order
    return a.originalIndex - b.originalIndex;
  });

  const sourceCode = context.getSourceCode();

  // Determine if it's safe to autofix: only Properties, no spread/computed, and no inline comments inside object
  const hasOnlyPlainProperties = properties.every((prop: any) => prop && prop.type === 'Property');

  const objectText = sourceCode.getText(node);
  const hasInlineComments = /\/\*|\/\//.test(
    objectText.slice(objectText.indexOf('{') + 1, objectText.lastIndexOf('}'))
  );

  const safeToFix = hasOnlyPlainProperties && !hasInlineComments;

  // Report the violation; provide a fix only if considered safe
  if (!safeToFix) {
    context.report({
      node,
      messageId: 'incorrectOrder',
    });
    return;
  }

  context.report({
    node,
    messageId: 'incorrectOrder',
    fix(fixer: any) {
      const sortedSource = sortedProperties
        .map((item, index) => {
          const property = item.property;
          const propertyText = sourceCode.getText(property);
          // Keep existing multiline replacement (tests rely on it)
          return index < sortedProperties.length - 1 ? `${propertyText},` : propertyText;
        })
        .join('\n');

      return fixer.replaceText(node, `{\n${sortedSource}\n}`);
    },
  });
}
