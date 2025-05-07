const preferredOrder = [
  'position', 'top', 'right', 'bottom', 'left', 'zIndex',
  'display', 'flexDirection', 'flexWrap', 'flexGrow', 'flexShrink',
  'justifyContent', 'alignItems', 'alignSelf', 'gap',
  'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
  'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my',
  'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py',
  'margin', 'marginRight', 'padding',
  'border', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft', 'borderRadius',
  'backgroundColor', 'bgcolor', 'backgroundImage',
  'boxShadow', 'filter',
  'color', 'fontFamily', 'fontSize', 'fontWeight',
  'lineHeight', 'letterSpacing',
  'textAlign', 'textDecoration', 'textIndent', 'textOverflow', 'whiteSpace', 'wordBreak',
  'objectFit', 'overflow', 'cursor', 'transform', 'transition', 'willChange', 'content',
  'xs', 'sm',
];

function getOrder(key) {
  const index = preferredOrder.indexOf(key);
  return index === -1 ? preferredOrder.length + key.charCodeAt(0) : index;
}

function isStyleObjectName(name) {
  return typeof name === 'string' && name.toLowerCase().includes('style');
}

function checkAndReport(context, node, props) {
  const sorted = [...props].sort((a, b) => {
    if (a.type !== 'Property' || b.type !== 'Property') return 0;
    const aKey = a.key.name || a.key.value;
    const bKey = b.key.name || b.key.value;
    return getOrder(aKey) - getOrder(bKey);
  });

  const isSorted = props.every((prop, i) => prop === sorted[i]);
  if (isSorted) return;

  context.report({
    node,
    message: 'Style properties should be sorted by best practices',
    fix(fixer) {
      const sourceCode = context.getSourceCode();
      const sortedText = sorted.map((prop) => sourceCode.getText(prop)).join(', ');
      return fixer.replaceText(node, `{ ${sortedText} }`);
    },
  });
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Sort MUI sx keys or style objects according to best practice',
      recommended: false,
    },
    fixable: 'code',
    schema: [],
  },

  create(context) {
    return {
      JSXAttribute(node) {
        if (
          node.name.name !== 'sx' ||
          !node.value ||
          node.value.type !== 'JSXExpressionContainer' ||
          node.value.expression.type !== 'ObjectExpression'
        ) return;

        checkAndReport(context, node.value.expression, node.value.expression.properties);
      },

      VariableDeclarator(node) {
        if (
          node.id &&
          isStyleObjectName(node.id.name) &&
          node.init &&
          node.init.type === 'ObjectExpression'
        ) {
          checkAndReport(context, node.init, node.init.properties);
        }
      },

      ExportNamedDeclaration(node) {
        if (
          node.declaration &&
          node.declaration.type === 'VariableDeclaration'
        ) {
          node.declaration.declarations.forEach((decl) => {
            if (
              decl.id &&
              isStyleObjectName(decl.id.name) &&
              decl.init &&
              decl.init.type === 'ObjectExpression'
            ) {
              checkAndReport(context, decl.init, decl.init.properties);
            }
          });
        }
      },
    };
  },
};
