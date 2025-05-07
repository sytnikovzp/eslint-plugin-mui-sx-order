const preferredOrder = [
  // Positioning
  'position', 'zIndex', 'top', 'right', 'bottom', 'left',

  // Display & Flexbox
  'display', 'visibility', 'overflow',
  'flexDirection', 'flexWrap', 'flexGrow', 'flexShrink', 'flexBasis',
  'justifyContent', 'alignItems', 'alignSelf', 'alignContent',
  'order', 'gap', 'rowGap', 'columnGap',

  // Box Model - Spacing
  'width', 'minWidth', 'maxWidth',
  'height', 'minHeight', 'maxHeight',
  'boxSizing',

  // Spacing Shorthands
  'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my',
  'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',

  'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py',
  'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',

  // Borders
  'border', 'borderWidth', 'borderStyle', 'borderColor',
  'borderTop', 'borderTopWidth', 'borderTopStyle', 'borderTopColor',
  'borderRight', 'borderRightWidth', 'borderRightStyle', 'borderRightColor',
  'borderBottom', 'borderBottomWidth', 'borderBottomStyle', 'borderBottomColor',
  'borderLeft', 'borderLeftWidth', 'borderLeftStyle', 'borderLeftColor',
  'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius',

  // Background & Effects
  'background', 'backgroundColor', 'bgcolor', 'backgroundImage', 'backgroundRepeat', 'backgroundSize', 'backgroundPosition',
  'boxShadow', 'filter', 'backdropFilter',
  'opacity', 'transform', 'willChange',

  // Typography
  'fontFamily', 'fontSize', 'fontStyle', 'fontWeight',
  'lineHeight', 'letterSpacing',
  'textAlign', 'textDecoration', 'textTransform', 'textOverflow', 'textIndent',
  'whiteSpace', 'wordBreak',
  'color',

  // Content & Media
  'objectFit', 'objectPosition', 'content',

  // Animation
  'transition', 'animation',

  // Interactivity
  'cursor', 'pointerEvents', 'userSelect',

  // Responsive (breakpoints last)
  'xs', 'sm', 'md', 'lg', 'xl',
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

function sortMediaQueries(properties) {
  const mediaQueries = properties.filter(
    (prop) => prop.key.type === 'Literal' && ['xs', 'sm', 'md'].includes(prop.key.value)
  );
  const regularProperties = properties.filter(
    (prop) => prop.key.type !== 'Literal' || !['xs', 'sm', 'md'].includes(prop.key.value)
  );

  return [
    ...regularProperties,
    ...mediaQueries.sort((a, b) => {
      const order = ['xs', 'sm', 'md'];
      const aKey = a.key.value;
      const bKey = b.key.value;
      return order.indexOf(aKey) - order.indexOf(bKey);
    }),
  ];
}

function sortPseudoClasses(properties) {
  const pseudoClasses = properties.filter(
    (prop) => typeof prop.key.value === 'string' && prop.key.value.startsWith('&')
  );
  const regularProperties = properties.filter(
    (prop) => !(typeof prop.key.value === 'string' && prop.key.value.startsWith('&'))
  );

  return [...regularProperties, ...pseudoClasses];
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

        const sortedProps = sortPseudoClasses(
          sortMediaQueries(node.value.expression.properties)
        );
        checkAndReport(context, node.value.expression, sortedProps);
      },

      VariableDeclarator(node) {
        if (
          node.id &&
          isStyleObjectName(node.id.name) &&
          node.init &&
          node.init.type === 'ObjectExpression'
        ) {
          const sortedProps = sortPseudoClasses(
            sortMediaQueries(node.init.properties)
          );
          checkAndReport(context, node.init, sortedProps);
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
              const sortedProps = sortPseudoClasses(
                sortMediaQueries(decl.init.properties)
              );
              checkAndReport(context, decl.init, sortedProps);
            }
          });
        }
      },
    };
  },
};