import type { Rule } from 'eslint';
import { getOrder } from '../utils/preferredOrder';
import { isStyleObjectName } from '../utils/propertyUtils';
import { checkAndReport } from '../utils/checkAndReport';

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Auto-sorts MUI sx/style props for clean, consistent code with ESLint',
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
          node.id.type === 'Identifier' &&
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
              decl.id.type === 'Identifier' &&
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
          node.callee.type === 'Identifier' &&
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

export default rule;
