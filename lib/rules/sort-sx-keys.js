const preferredOrder = [
  // Positioning
  'position', 'top', 'right', 'bottom', 'left', 'zIndex',

  // Display & Layout
  'display', 'boxSizing', 'visibility', 'overflow', 'overflowX', 'overflowY',

  // Flexbox
  'flex', 'flexBasis', 'flexDirection', 'flexFlow', 'flexGrow', 'flexShrink', 'flexWrap',
  'justifyContent', 'justifyItems', 'justifySelf',
  'alignContent', 'alignItems', 'alignSelf',
  'order', 'gap', 'rowGap', 'columnGap',

  // Grid
  'grid', 'gridArea', 'gridTemplate', 'gridTemplateAreas',
  'gridTemplateRows', 'gridTemplateColumns',
  'gridRow', 'gridRowStart', 'gridRowEnd',
  'gridColumn', 'gridColumnStart', 'gridColumnEnd',
  'gridAutoFlow', 'gridAutoRows', 'gridAutoColumns',
  'gridGap', 'gridRowGap', 'gridColumnGap',
  'placeItems', 'placeContent', 'placeSelf',

  // Spacing & Box model
  'width', 'minWidth', 'maxWidth',
  'height', 'minHeight', 'maxHeight',
  'aspectRatio',

  // Spacing Shorthands
  'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my',
  'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',

  'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py',
  'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',

  // Border
  'border', 'borderWidth', 'borderStyle', 'borderColor',
  'borderTop', 'borderTopWidth', 'borderTopStyle', 'borderTopColor',
  'borderRight', 'borderRightWidth', 'borderRightStyle', 'borderRightColor',
  'borderBottom', 'borderBottomWidth', 'borderBottomStyle', 'borderBottomColor',
  'borderLeft', 'borderLeftWidth', 'borderLeftStyle', 'borderLeftColor',
  'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius',
  'borderBottomLeftRadius', 'borderBottomRightRadius',

  // Background & Effects
  'background', 'backgroundColor', 'bgcolor', 'backgroundImage',
  'backgroundSize', 'backgroundPosition', 'backgroundRepeat', 'backgroundClip',
  'boxShadow', 'filter', 'opacity', 'backdropFilter',

  // Typography
  'font', 'fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'fontVariant',
  'letterSpacing', 'lineHeight', 'color',
  'textAlign', 'textDecoration', 'textTransform', 'textIndent', 'textOverflow',
  'whiteSpace', 'wordBreak', 'overflowWrap',

  // Other visuals
  'objectFit', 'objectPosition', 'content',

  // Transitions & Animations
  'transition', 'transitionDuration', 'transitionTimingFunction',
  'animation', 'transform', 'willChange',

  // Interactions
  'cursor', 'pointerEvents', 'userSelect',

  // Responsive
  'xs', 'sm', 'md', 'lg', 'xl',
];

function getOrder(key) {
  const index = preferredOrder.indexOf(key);
  return index === -1 ? preferredOrder.length + key.charCodeAt(0) : index;
}

function isStyleObjectName(name) {
  return typeof name === 'string' && name.toLowerCase().includes('style');
}

function sortMediaQueries(properties) {
  const mediaQueries = properties.filter(
    (prop) =>
      prop.key.type === 'Literal' && ['xs', 'sm', 'md'].includes(prop.key.value)
  );
  const regularProperties = properties.filter(
    (prop) =>
      prop.key.type !== 'Literal' ||
      !['xs', 'sm', 'md'].includes(prop.key.value)
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
    (prop) =>
      typeof prop.key.value === 'string' && prop.key.value.startsWith('&')
  );
  const regularProperties = properties.filter(
    (prop) =>
      !(typeof prop.key.value === 'string' && prop.key.value.startsWith('&'))
  );

  return [...regularProperties, ...pseudoClasses];
}

function sortProperties(properties) {
  return [...properties].sort((a, b) => {
    const aKey = a.key.name || a.key.value;
    const bKey = b.key.name || b.key.value;
    return getOrder(aKey) - getOrder(bKey);
  });
}

function checkAndReport(context, node) {
  const props = node.properties;
  const sorted = sortProperties(props);

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
      checkAndReport(context, prop.value);
    }
  }
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Sort MUI sx keys or style objects according to best practice',
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
        )
          return;

        checkAndReport(context, node.value.expression);
      },

      VariableDeclarator(node) {
        if (
          node.id &&
          isStyleObjectName(node.id.name) &&
          node.init &&
          node.init.type === 'ObjectExpression'
        ) {
          checkAndReport(context, node.init);
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
              checkAndReport(context, decl.init);
            }
          });
        }
      },
    };
  },
};
