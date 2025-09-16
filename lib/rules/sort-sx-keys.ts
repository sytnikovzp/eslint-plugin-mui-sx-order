import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { getOrder } from '../utils/preferredOrder';
import { isStyleObjectName } from '../utils/propertyUtils';
import { checkAndReport } from '../utils/checkAndReport';

const rule: TSESLint.RuleModule<'incorrectOrder', []> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Auto-sorts MUI sx/style props for clean, consistent code with ESLint',
    },
    fixable: 'code',
    schema: [],
    messages: {
      incorrectOrder: 'Properties in sx/style should be sorted by priority.',
    },
  },
  defaultOptions: [],
  create(context) {
    function checkDeclarator(
      id: TSESTree.Identifier,
      init: TSESTree.Expression | null
    ) {
      if (!init) return;

      if (init.type === 'ObjectExpression') {
        checkAndReport(context, init, getOrder);
      } else if (init.type === 'ArrayExpression') {
        for (const elem of init.elements) {
          if (elem?.type === 'ObjectExpression')
            checkAndReport(context, elem, getOrder);
        }
      }
    }

    return {
      JSXAttribute(node: TSESTree.JSXAttribute) {
        if (
          node.name.name !== 'sx' ||
          !node.value ||
          node.value.type !== 'JSXExpressionContainer'
        )
          return;

        const expr = node.value.expression;
        if (expr.type === 'ObjectExpression') {
          checkAndReport(context, expr, getOrder);
        } else if (expr.type === 'ArrayExpression') {
          for (const elem of expr.elements) {
            if (elem?.type === 'ObjectExpression')
              checkAndReport(context, elem, getOrder);
          }
        }
      },

      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        if (node.id.type === 'Identifier' && isStyleObjectName(node.id.name)) {
          checkDeclarator(node.id, node.init);
        }
      },

      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
        if (
          node.declaration &&
          node.declaration.type === 'VariableDeclaration'
        ) {
          for (const decl of node.declaration.declarations) {
            if (
              decl.id.type === 'Identifier' &&
              isStyleObjectName(decl.id.name)
            ) {
              checkDeclarator(decl.id, decl.init);
            }
          }
        }
      },

      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'createStyles' &&
          node.arguments.length
        ) {
          const arg = node.arguments[0];
          if (arg.type === 'ObjectExpression') {
            checkAndReport(context, arg, getOrder);
          } else if (arg.type === 'ArrayExpression') {
            for (const elem of arg.elements) {
              if (elem?.type === 'ObjectExpression') {
                checkAndReport(context, elem, getOrder);
              }
            }
          }
        }
      },
    };
  },
};

export default rule;
