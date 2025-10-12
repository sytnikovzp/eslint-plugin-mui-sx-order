import {
  RuleContext,
  ObjectExpression,
  GetOrderFunction,
  Property,
} from '../types';

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
    if (
      prop.type === 'Property' &&
      prop.value &&
      prop.value.type === 'ObjectExpression'
    ) {
      checkAndReport(context, prop.value, getOrder);
    }
  });

  // Get property names and their order indices
  const makeOrderItem = (prop: any, index: number) => {
    const keyName =
      prop.key.type === 'Identifier' ? prop.key.name : String(prop.key.value);
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
    if (
      prop.type === 'Property' &&
      (prop.key.type === 'Identifier' || prop.key.type === 'Literal')
    ) {
      currentItems.push(makeOrderItem(prop, index));
      currentIndices.push(index);
    } else {
      if (currentItems.length) {
        const segIdx =
          segments.push({ items: currentItems, indices: currentIndices }) - 1;
        currentIndices.forEach((i) => (indexToSegment[i] = segIdx));
      }
      currentItems = [];
      currentIndices = [];
    }
  });
  if (currentItems.length) {
    const segIdx =
      segments.push({ items: currentItems, indices: currentIndices }) - 1;
    currentIndices.forEach((i) => (indexToSegment[i] = segIdx));
  }

  // Check sortedness per segment
  const allSegmentsSorted = segments.every((seg) =>
    seg.items.every((item: any, idx: number) =>
      idx === 0 ? true : item.order >= seg.items[idx - 1]!.order
    )
  );

  if (allSegmentsSorted) {
    return;
  }

  // (no global sorted list; sorting will be applied per segment only)

  const sourceCode = context.getSourceCode();

  // We will preserve comments/format by doing range-based replacements per segment
  const safeToFix = true;

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
      // For each segment, rebuild only the segment range preserving all trivia
      const fixes: any[] = [];
      segments.forEach((seg) => {
        if (seg.items.length < 2) return; // nothing to reorder

        // Determine segment bounds
        const firstIdx = seg.indices[0]!;
        const lastIdx = seg.indices[seg.indices.length - 1]!;
        const firstProp = properties[firstIdx]!;
        const lastProp = properties[lastIdx]!;
        const segStart: number = firstProp.range[0];
        const segEnd: number = lastProp.range[1];

        // Collect original items with their leading trivia (prefix)
        type Piece = {
          key: string;
          originalIndex: number;
          prefix: string;
          text: string;
        };
        const pieces: Piece[] = [];
        let cursor = segStart;
        seg.indices.forEach((i) => {
          const prop = properties[i]!;
          const start = prop.range[0];
          const end = prop.range[1];
          const prefix = sourceCode.text.slice(cursor, start);
          const text = sourceCode.text.slice(start, end);
          const keyName =
            prop.key.type === 'Identifier'
              ? prop.key.name
              : String(prop.key.value);
          pieces.push({ key: keyName, originalIndex: i, prefix, text });
          cursor = end;
        });

        // Compute sorted order for this segment
        const sorted = [...seg.items].sort((a, b) =>
          a.order === b.order
            ? a.originalIndex - b.originalIndex
            : a.order - b.order
        );

        // Map from originalIndex to piece
        const byIndex = new Map<number, Piece>(
          pieces.map((p) => [p.originalIndex, p])
        );

        // Rebuild segment content: keep prefixes bound to the property that follows
        const rebuilt = sorted
          .map((item) => byIndex.get(item.originalIndex)!)
          .map((p) => p.prefix + p.text)
          .join('');

        fixes.push(fixer.replaceTextRange([segStart, segEnd], rebuilt));
      });

      return fixes;
    },
  });
}
