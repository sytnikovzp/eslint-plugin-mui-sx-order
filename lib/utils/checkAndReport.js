const { sortProperties } = require('./propertyUtils');

function checkAndReport(context, node, getOrder) {
  const props = node.properties;
  if (!Array.isArray(props)) return;

  const sorted = sortProperties(props, getOrder);
  const isSorted = props.every((prop, i) => prop === sorted[i]);

  if (!isSorted) {
    context.report({
      node,
      message: 'Style properties should be sorted by best practices',
      fix(fixer) {
        const sourceCode = context.getSourceCode();
        const sortedText = sorted
          .map((prop) => sourceCode.getText(prop))
          .join(', ');
        return fixer.replaceText(node, `{ ${sortedText} }`);
      },
    });
  }

  for (const prop of props) {
    if (prop.type === 'Property' && prop.value.type === 'ObjectExpression') {
      checkAndReport(context, prop.value, getOrder);
    }
  }
}

module.exports = { checkAndReport };
