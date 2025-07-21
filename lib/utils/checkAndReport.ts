import type { TSESLint } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { sortProperties } from '@/lib/utils/propertyUtils';

function checkAndReport(
  context: TSESLint.RuleContext<'incorrectOrder', []>,
  node: TSESTree.ObjectExpression,
  getOrder: (key: string) => number
): void {
  const props = node.properties;
  if (!Array.isArray(props)) return;

  const sorted = sortProperties(props, getOrder);
  const isSorted = props.every((prop, i) => prop === sorted[i]);

  if (!isSorted) {
    if (!node.range) {
      context.report({
        node,
        messageId: 'incorrectOrder',
      });
      return;
    }

    const [start, end] = node.range;

    context.report({
      node,
      messageId: 'incorrectOrder',
      fix(fixer) {
        const sourceCode = context.getSourceCode();

        const sortedText = sorted
          .map((prop) => sourceCode.getText(prop))
          .join(', ');

        return fixer.replaceTextRange([start + 1, end - 1], ` ${sortedText} `);
      },
    });
  }

  for (const prop of props) {
    if (prop.type === 'Property' && prop.value.type === 'ObjectExpression') {
      checkAndReport(context, prop.value, getOrder);
    }
  }
}

export { checkAndReport };
