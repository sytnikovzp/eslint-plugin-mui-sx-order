import { RuleContext, ObjectExpression, GetOrderFunction, Property } from '../types';

/**
 * Checks if properties in an object expression are in the correct order
 * and reports violations with auto-fix capability
 */
export function checkAndReport(
  context: RuleContext,
  node: ObjectExpression,
  getOrder: GetOrderFunction
): void {
  const properties = node.properties;
  
  if (properties.length < 2) {
    return;
  }

  // First, recursively check nested objects
  properties.forEach((prop: Property) => {
    if (prop.type === 'Property' && prop.value && prop.value.type === 'ObjectExpression') {
      checkAndReport(context, prop.value, getOrder);
    }
  });

  // Get property names and their order indices
  const makeOrderItem = (prop: any, index: number) => {
    const keyName = prop.key.type === 'Identifier' ? prop.key.name : String(prop.key.value);
    return {
      name: keyName,
      order: getOrder(keyName),
      originalIndex: index,
      property: prop,
    };
  };

  // Build contiguous Property segments, split by non-Property (e.g., SpreadElement)
  const segments: Array<{ items: Array<any>; indices: number[] }> = [];
  const indexToSegment: number[] = Array(properties.length).fill(-1);
  let currentItems: Array<any> = [];
  let currentIndices: number[] = [];
  properties.forEach((prop: any, index: number) => {
    if (prop.type === 'Property' && (prop.key.type === 'Identifier' || prop.key.type === 'Literal')) {
      currentItems.push(makeOrderItem(prop, index));
      currentIndices.push(index);
    } else {
      if (currentItems.length) {
        const segIdx = segments.push({ items: currentItems, indices: currentIndices }) - 1;
        currentIndices.forEach((i) => (indexToSegment[i] = segIdx));
      }
      currentItems = [];
      currentIndices = [];
    }
  });
  if (currentItems.length) {
    const segIdx = segments.push({ items: currentItems, indices: currentIndices }) - 1;
    currentIndices.forEach((i) => (indexToSegment[i] = segIdx));
  }

  // Check sortedness per segment
  const allSegmentsSorted = segments.every((seg) =>
    seg.items.every((item: any, idx: number) => (idx === 0 ? true : item.order >= seg.items[idx - 1]!.order))
  );

  if (allSegmentsSorted) {
    return;
  }

  // (no global sorted list; sorting will be applied per segment only)

  const sourceCode = context.getSourceCode();

  const objectText = sourceCode.getText(node);
  const hasInlineComments = /\/\*|\/\//.test(
    objectText.slice(objectText.indexOf('{') + 1, objectText.lastIndexOf('}'))
  );

  // Allow spreads; we will sort only within contiguous Property segments
  const safeToFix = !hasInlineComments;

  // Report the violation; provide a fix only if considered safe
  if (!safeToFix) {
    context.report({
      node,
      messageId: 'incorrectOrder',
    });
    return;
  }

  context.report({
    node,
    messageId: 'incorrectOrder',
    fix(fixer: any) {
      // Precompute sorted versions per segment
      const sortedBySegment: Array<Array<any>> = segments.map((seg) => {
        const sorted = [...seg.items].sort((a, b) => (a.order === b.order ? a.originalIndex - b.originalIndex : a.order - b.order));
        return sorted;
      });

      // Build output elements while preserving non-Property nodes
      const outputElements: string[] = [];
      const segmentOffsets: number[] = Array(segments.length).fill(0);
      properties.forEach((prop: any, idx: number) => {
        if (prop.type === 'Property' && (prop.key.type === 'Identifier' || prop.key.type === 'Literal')) {
          const segIdxRaw = indexToSegment[idx];
          const segIdx: number = typeof segIdxRaw === 'number' ? segIdxRaw : -1;
          let text: string;
          if (segIdx >= 0 && segIdx < sortedBySegment.length) {
            const segArr: any[] = sortedBySegment[segIdx] ?? [];
            const offRaw = segmentOffsets[segIdx];
            const off: number = typeof offRaw === 'number' ? offRaw : 0;
            if (off < segArr.length) {
              const nextItem = segArr[off];
              segmentOffsets[segIdx] = off + 1;
              text = sourceCode.getText(nextItem.property);
            } else {
              text = sourceCode.getText(prop);
            }
          } else {
            // Fallback to original property text
            text = sourceCode.getText(prop);
          }
          outputElements.push(text);
        } else {
          // Non-Property element (e.g., SpreadElement) — keep as-is
          const text = sourceCode.getText(prop);
          outputElements.push(text);
        }
      });

      // Join with commas and newlines; last element without trailing comma
      const body = outputElements
        .map((el, i) => (i < outputElements.length - 1 ? `${el},` : el))
        .join('\n');

      return fixer.replaceText(node, `{\n${body}\n}`);
    },
  });
}
