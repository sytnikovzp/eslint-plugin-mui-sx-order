import type { TSESLint } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { getOrder } from '@/lib/utils/preferredOrder';
import { isStyleObjectName } from '@/lib/utils/propertyUtils';
import { checkAndReport } from '@/lib/utils/checkAndReport';

type RuleModule = TSESLint.RuleModule<'incorrectOrder', []>;

const rule: RuleModule = {
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
    return {
      JSXAttribute(node: TSESTree.JSXAttribute) {
        if (
          node.name.name !== 'sx' ||
          !node.value ||
          node.value.type !== 'JSXExpressionContainer' ||
          node.value.expression.type !== 'ObjectExpression'
        ) {
          return;
        }

        checkAndReport(context as any, node.value.expression, getOrder);
      },

      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        if (
          node.id.type === 'Identifier' &&
          isStyleObjectName(node.id.name) &&
          node.init &&
          node.init.type === 'ObjectExpression'
        ) {
          checkAndReport(context as any, node.init, getOrder);
        }
      },

      ExportNamedDeclaration(node: any) {
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
              checkAndReport(context as any, decl.init, getOrder);
            }
          }
        }
      },

      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'createStyles' &&
          node.arguments.length &&
          node.arguments[0].type === 'ObjectExpression'
        ) {
          checkAndReport(context as any, node.arguments[0], getOrder);
        }
      },
    };
  },
};

export default rule;
