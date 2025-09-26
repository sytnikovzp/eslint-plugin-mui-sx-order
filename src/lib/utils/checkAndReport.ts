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

  // Get property names and their order indices
  const propertyOrders = properties
    .map((prop: Property, index: number) => {
      if (prop.type === 'Property' && prop.key.type === 'Identifier') {
        return {
          name: prop.key.name,
          order: getOrder(prop.key.name),
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

  // Report the violation with auto-fix
  context.report({
    node,
    messageId: 'incorrectOrder',
    fix(fixer: any) {
      const sourceCode = context.getSourceCode();
      const sortedSource = sortedProperties
        .map((item, index) => {
          const property = item.property;
          const propertyText = sourceCode.getText(property);
          
          // Add comma if not the last property
          return index < sortedProperties.length - 1 
            ? `${propertyText},` 
            : propertyText;
        })
        .join('\n');

      // Replace the entire object expression
      return fixer.replaceText(node, `{\n${sortedSource}\n}`);
    },
  });
}
