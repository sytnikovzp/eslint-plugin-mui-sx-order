const { sortProperties } = require('./propertyUtils');

function checkAndReport(context, node, getOrder) {
  const props = node.properties;
  if (!Array.isArray(props)) {
    return;
  }

  const sorted = sortProperties(props, getOrder);
  const isSorted = props.every((prop, i) => prop === sorted[i]);

  if (!isSorted) {
    context.report({
      node,
      messageId: 'incorrectOrder',
      fix(fixer) {
        const sourceCode = context.getSourceCode();
        const text = sourceCode.getText(node);

        const [firstLine] = text.split('\n');
        const baseIndentMatch = firstLine.match(/^(\s*){/);
        const baseIndent = baseIndentMatch ? baseIndentMatch[1] : '';

        const indent = `${baseIndent}  `;
        const propsTexts = sorted.map((prop) => sourceCode.getText(prop));
        const sortedText = propsTexts.join(`,\n${indent}`);

        const [start, end] = node.range;

        return fixer.replaceTextRange(
          [start + 1, end - 1],
          `\n${indent}${sortedText},\n${baseIndent}`
        );
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
