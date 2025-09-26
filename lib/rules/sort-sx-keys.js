const { getOrder } = require('../utils/preferredOrder');
const { isStyleObjectName } = require('../utils/propertyUtils');
const { checkAndReport } = require('../utils/checkAndReport');

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
    messages: {
      incorrectOrder: 'Properties in sx/style should be sorted by priority.',
    },
  },

  create(context) {
    return {
      JSXAttribute(node) {
        if (
          node.name.name !== 'sx' ||
          !node.value ||
          node.value.type !== 'JSXExpressionContainer' ||
          node.value.expression.type !== 'ObjectExpression'
        ) {
          return;
        }

        checkAndReport(context, node.value.expression, getOrder);
      },

      VariableDeclarator(node) {
        if (
          node.id &&
          isStyleObjectName(node.id.name) &&
          node.init &&
          node.init.type === 'ObjectExpression'
        ) {
          checkAndReport(context, node.init, getOrder);
        }
      },

      ExportNamedDeclaration(node) {
        if (
          node.declaration &&
          node.declaration.type === 'VariableDeclaration'
        ) {
          for (const decl of node.declaration.declarations) {
            if (
              decl.id &&
              isStyleObjectName(decl.id.name) &&
              decl.init &&
              decl.init.type === 'ObjectExpression'
            ) {
              checkAndReport(context, decl.init, getOrder);
            }
          }
        }
      },

      CallExpression(node) {
        if (
          node.callee.name === 'createStyles' &&
          node.arguments.length &&
          node.arguments[0].type === 'ObjectExpression'
        ) {
          checkAndReport(context, node.arguments[0], getOrder);
        }
      },
    };
  },
};
