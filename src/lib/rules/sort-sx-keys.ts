import { RuleModule, RuleListener, RuleContext, JSXAttribute, VariableDeclarator, ExportNamedDeclaration, CallExpression } from '../types';
import { getOrder } from '../utils/preferredOrder';
import { isStyleObjectName } from '../utils/propertyUtils';
import { checkAndReport } from '../utils/checkAndReport';

const rule: RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Sort MUI sx keys or style objects according to best practice',
      recommended: false,
    },
    fixable: 'code',
    schema: [],
    messages: {
      incorrectOrder: 'Properties in sx/style should be sorted by priority.',
    },
  },

  create(context: RuleContext): RuleListener {
    return {
      JSXAttribute(node: JSXAttribute) {
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

      VariableDeclarator(node: VariableDeclarator) {
        // Skip if this is inside an ExportNamedDeclaration (handled separately)
        if (node.parent && node.parent.type === 'VariableDeclaration' && 
            node.parent.parent && node.parent.parent.type === 'ExportNamedDeclaration') {
          return;
        }

        if (
          node.id &&
          node.id.type === 'Identifier' &&
          isStyleObjectName(node.id.name) &&
          node.init &&
          node.init.type === 'ObjectExpression'
        ) {
          checkAndReport(context, node.init, getOrder);
        }
      },

      ExportNamedDeclaration(node: ExportNamedDeclaration) {
        if (
          node.declaration &&
          node.declaration.type === 'VariableDeclaration'
        ) {
          for (const decl of node.declaration.declarations) {
            if (
              decl.id &&
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

      CallExpression(node: CallExpression) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'createStyles' &&
          node.arguments.length &&
          node.arguments[0] &&
          node.arguments[0].type === 'ObjectExpression'
        ) {
          checkAndReport(context, node.arguments[0], getOrder);
        }
      },
    };
  },
};

export default rule;
