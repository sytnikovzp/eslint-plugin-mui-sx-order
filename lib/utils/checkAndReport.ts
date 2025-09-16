import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { sortProperties } from './propertyUtils';

function checkAndReport(
  context: TSESLint.RuleContext<'incorrectOrder', []>,
  node: TSESTree.ObjectExpression,
  getOrder: (key: string) => number
): void {
  const props: TSESTree.ObjectLiteralElement[] = node.properties;
  if (!Array.isArray(props)) return;

  const sorted = sortProperties(props, getOrder);
  const isSorted = props.every((prop, i) => prop === sorted[i]);

  if (!isSorted) {
    const [start, end] = node.range ?? [0, 0];

    context.report({
      node,
      messageId: 'incorrectOrder',
      fix(fixer) {
        const sortedText = sorted
          .map((prop) => {
            const tokens = context
              .getSourceCode()
              .getTokens(prop, { includeComments: true });
            return tokens.map((t) => t.value).join('');
          })
          .join(', ');

        return fixer.replaceTextRange([start + 1, end - 1], ` ${sortedText} `);
      },
    });
  }

  for (const prop of props) {
    if (prop.type === 'Property') {
      if (prop.value.type === 'ObjectExpression') {
        checkAndReport(context, prop.value, getOrder);
      } else if (prop.value.type === 'ArrayExpression') {
        for (const elem of prop.value.elements) {
          if (elem?.type === 'ObjectExpression') {
            checkAndReport(context, elem, getOrder);
          }
        }
      }
    }
  }
}

export { checkAndReport };
