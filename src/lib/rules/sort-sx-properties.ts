import {
  RuleModule,
  RuleListener,
  RuleContext,
  JSXAttribute,
  VariableDeclarator,
  ExportNamedDeclaration,
  CallExpression,
} from '../types';
import { getOrder } from '../utils/preferredOrder';
import { isStyleObjectName } from '../utils/propertyUtils';
import { checkAndReport } from '../utils/checkAndReport';

const rule: RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Sort MUI sx properties or style objects according to best practice',
      recommended: false,
    },
    fixable: 'code',
    schema: [],
    messages: {
      incorrectOrder: 'Properties in sx/style should be sorted by priority.',
    },
  },

  create(context: RuleContext): RuleListener {
    // Collect local identifiers for createStyles imported from MUI packages
    const muiCreateStylesNames = new Set<string>();
    try {
      const ast: any = (context.getSourceCode() as any).ast;
      if (ast && Array.isArray(ast.body)) {
        for (const node of ast.body) {
          if (
            node.type === 'ImportDeclaration' &&
            node.source &&
            typeof node.source.value === 'string'
          ) {
            const src: string = node.source.value;
            if (/^@mui\//.test(src)) {
              for (const spec of node.specifiers || []) {
                if (
                  spec.type === 'ImportSpecifier' &&
                  spec.imported &&
                  spec.imported.name === 'createStyles'
                ) {
                  muiCreateStylesNames.add(spec.local?.name || 'createStyles');
                }
              }
            }
          }
        }
      }
    } catch {}

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
        if (
          node.parent &&
          node.parent.type === 'VariableDeclaration' &&
          node.parent.parent &&
          node.parent.parent.type === 'ExportNamedDeclaration'
        ) {
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
          muiCreateStylesNames.has(node.callee.name) &&
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
