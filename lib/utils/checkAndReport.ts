import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { sortProperties } from './propertyUtils';

function checkAndReport(
  context: TSESLint.RuleContext<'incorrectOrder', []>,
  node: TSESTree.ObjectExpression,
  getOrder: (key: string) => number
): void {
  const props: TSESTree.ObjectLiteralElement[] = node.properties;
  if (!Array.isArray(props)) return;

  const sortableProps = props.filter(prop => {
    if (prop.type !== 'Property') return false;
    const key = prop.key;
    if (key.type === 'Identifier') return !key.name.startsWith('&');
    if (key.type === 'Literal') return !String(key.value).startsWith('&');
    return true;
  });

  if (sortableProps.length === 0) return;

  const sorted = sortProperties(sortableProps, getOrder);
  const isSorted = sortableProps.every((prop, i) => prop === sorted[i]);

  if (!isSorted) {
    const [start, end] = node.range ?? [0, 0];

    context.report({
      node,
      messageId: 'incorrectOrder',
      fix(fixer) {
        const sourceCode = context.getSourceCode();
        
        const propMap = new Map();
        props.forEach((prop, index) => {
          if (prop.type === 'Property') {
            const key = prop.key;
            let keyName = '';
            if (key.type === 'Identifier') keyName = key.name;
            else if (key.type === 'Literal') keyName = String(key.value);
            
            if (!keyName.startsWith('&')) {
              propMap.set(keyName, { prop, originalIndex: index });
            }
          }
        });

        const result = [...props];
        let sortedIndex = 0;
        
        for (let i = 0; i < result.length; i++) {
          const prop = result[i];
          if (prop.type === 'Property') {
            const key = prop.key;
            let keyName = '';
            if (key.type === 'Identifier') keyName = key.name;
            else if (key.type === 'Literal') keyName = String(key.value);
            
            if (!keyName.startsWith('&')) {
              const sortedProp = sorted[sortedIndex];
              result[i] = sortedProp;
              sortedIndex++;
            }
          }
        }

        const parent = node.parent;
        const isInArray = parent?.type === 'ArrayExpression';
        
        if (isInArray) {
          const sortedText = result
            .map((prop) => sourceCode.getText(prop))
            .join(', ');
          return fixer.replaceTextRange([start + 1, end - 1], ` ${sortedText} `);
        } else {
          const sortedText = result
            .map((prop) => sourceCode.getText(prop))
            .join(',\n          ');
          return fixer.replaceTextRange([start + 1, end - 1], `\n          ${sortedText},\n        `);
        }
      },
    });
  }

  for (const prop of props) {
    if (prop.type === 'Property') {
      const key = prop.key;
      let isPseudoSelector = false;
      if (key.type === 'Identifier') isPseudoSelector = key.name.startsWith('&');
      else if (key.type === 'Literal') isPseudoSelector = String(key.value).startsWith('&');
      
      if (!isPseudoSelector) {
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
}

export { checkAndReport };
