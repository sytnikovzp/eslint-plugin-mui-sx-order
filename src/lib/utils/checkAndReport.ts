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

  // First, recursively check nested objects except responsive keys (handled inline)
  const responsiveKeys = new Set(['xs', 'sm', 'md', 'lg', 'xl']);
  properties.forEach((prop: Property) => {
    if (
      prop.type === 'Property' &&
      prop.key &&
      (prop.key as any).type &&
      ((prop.key as any).type === 'Identifier' ||
        (prop.key as any).type === 'Literal') &&
      prop.value &&
      prop.value.type === 'ObjectExpression'
    ) {
      const keyName =
        (prop.key as any).type === 'Identifier'
          ? (prop.key as any).name
          : String((prop.key as any).value);
      if (!responsiveKeys.has(keyName)) {
        checkAndReport(context, prop.value, getOrder);
      }
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

  // Analyze for simple safe case
  const objectText = sourceCode.getText(node);
  const hasInlineComments = /\/\*|\/\//.test(
    objectText.slice(objectText.indexOf('{') + 1, objectText.lastIndexOf('}'))
  );
  const hasOnlyPlainProperties = properties.every(
    (prop: any) => prop && prop.type === 'Property'
  );
  const isSimpleWholeObject =
    !hasInlineComments && hasOnlyPlainProperties && segments.length === 1;

  // We allow fixing even when comments are present by using segment-based rebuild

  context.report({
    node,
    messageId: 'incorrectOrder',
    fix(fixer: any) {
      // Simple whole-object replacement: preserve previous behavior and expected formatting
      if (isSimpleWholeObject) {
        // flatten items of the only segment and sort
        const seg = segments[0]!;
        const sorted = [...seg.items].sort((a, b) =>
          a.order === b.order
            ? a.originalIndex - b.originalIndex
            : a.order - b.order
        );
        const parts = sorted.map((item: any, index: number) => {
          const property = item.property as any;
          let propertyText = sourceCode.getText(property);
          // If value is an ObjectExpression, render its content in multiline sorted form
          if (property.value && property.value.type === 'ObjectExpression') {
            const inner = property.value;
            const innerProps = inner.properties.filter(
              (p: any) =>
                p.type === 'Property' &&
                (p.key.type === 'Identifier' || p.key.type === 'Literal')
            ) as any[];
            if (innerProps.length >= 2) {
              const innerItems = innerProps.map((p: any) => {
                const name =
                  p.key.type === 'Identifier'
                    ? p.key.name
                    : String(p.key.value);
                return { name, order: getOrder(name), property: p };
              });
              const innerSorted = innerItems
                .sort((a: any, b: any) =>
                  a.order === b.order ? 0 : a.order - b.order
                )
                .map((it: any, idx: number) => {
                  const t = sourceCode.getText(it.property);
                  return idx < innerItems.length - 1 ? `${t},` : t;
                })
                .join('\n');
              const innerText = `{$\n${innerSorted}\n}`.replace('$', '');
              const innerStart = inner.range[0];
              const innerEnd = inner.range[1];
              const relStart = innerStart - property.range[0];
              const relEnd = relStart + (innerEnd - innerStart);
              propertyText =
                propertyText.slice(0, relStart) +
                innerText +
                propertyText.slice(relEnd);
            }
          }
          return index < sorted.length - 1 ? `${propertyText},` : propertyText;
        });
        const sortedSource = parts.join('\n');
        return fixer.replaceText(node, `{\n${sortedSource}\n}`);
      }

      // For segmented case, rebuild only the segment ranges preserving trivia
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

        // Collect original items with segment-leading and per-property leading trivia bound to following property
        type Piece = {
          key: string;
          originalIndex: number;
          text: string;
          leading: string;
          wasFirstInSegment: boolean;
        };
        const pieces: Piece[] = [];
        // Segment leading trivia (before the first property in the segment)
        const firstStart = firstProp.range[0];
        // Compute text between the opening '{' of the object and the first property's start
        const nodeStart = (node as any).range[0] as number;
        const nodeEnd = (node as any).range[1] as number;
        const nodeText = sourceCode.text.slice(nodeStart, nodeEnd);
        const braceIdx = nodeText.indexOf('{');
        const contentStart =
          braceIdx >= 0 ? nodeStart + braceIdx + 1 : segStart;
        let segmentLeading = sourceCode.text.slice(contentStart, firstStart);
        const isMultilineObject = /\n/.test(nodeText);
        if (!isMultilineObject) {
          // For single-line, normalize to single space after '{'
          segmentLeading = ' ';
        } else {
          // Collapse multiple blank lines to a single newline
          segmentLeading = segmentLeading.replace(/\n\s*\n+/g, '\n');
          // Ensure at least one newline + two spaces indentation
          if (!/^\s*\n\s{2,}$/.test(segmentLeading)) {
            segmentLeading = '\n  ';
          }
        }
        // Build pieces in original order with leading trivia
        for (let k = 0; k < seg.indices.length; k++) {
          const i = seg.indices[k]!;
          const prop = properties[i]!;
          const start = prop.range[0];
          const end = prop.range[1];
          let text = sourceCode.text.slice(start, end);
          // If this property was not the last in original segment, strip trailing comma from its own text.
          // The comma will be preserved as part of the NEXT property's leading trivia.
          if (k + 1 < seg.indices.length) {
            text = text.replace(/,\s*$/, '');
          }
          // leading is text after previous property's end up to this property's start (or segment start)
          const prevIdx = k - 1 >= 0 ? seg.indices[k - 1]! : undefined;
          const prevEnd =
            typeof prevIdx === 'number'
              ? (properties[prevIdx]!.range[1] as number)
              : firstStart;
          const leading = sourceCode.text.slice(prevEnd, start);
          const keyName =
            prop.key.type === 'Identifier'
              ? prop.key.name
              : String(prop.key.value);

          // Inline-fix nested object expressions (e.g., responsive blocks) without separate reports
          if (prop.value && prop.value.type === 'ObjectExpression') {
            const inner = prop.value;
            const innerProps = inner.properties.filter(
              (p: any) =>
                p.type === 'Property' &&
                (p.key.type === 'Identifier' || p.key.type === 'Literal')
            ) as any[];
            if (innerProps.length >= 2) {
              const innerItems = innerProps.map((p: any) => {
                const name =
                  p.key.type === 'Identifier'
                    ? p.key.name
                    : String(p.key.value);
                return { name, order: getOrder(name), property: p };
              });
              const innerSorted = innerItems
                .sort((a: any, b: any) =>
                  a.order === b.order ? 0 : a.order - b.order
                )
                .map((it: any, idx: number) => {
                  const t = sourceCode.getText(it.property);
                  return idx < innerItems.length - 1 ? `${t},` : t;
                })
                .join('\n');
              const innerText = `{$\n${innerSorted}\n}`.replace('$', '');
              // Replace inner object text within property text by using ranges
              const innerStart = inner.range[0];
              const innerEnd = inner.range[1];
              const relStart = innerStart - start;
              const relEnd = relStart + (innerEnd - innerStart);
              text = text.slice(0, relStart) + innerText + text.slice(relEnd);
            }
          }
          pieces.push({
            key: keyName,
            originalIndex: i,
            text,
            leading,
            wasFirstInSegment: k === 0,
          });
        }

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
        // Derive a default separator (gap) from the first leading if available, else comma+space
        const firstGap = pieces.length > 1 ? pieces[1]!.leading : '';
        let defaultSep = /,/.test(firstGap) ? firstGap : ', ';
        if (isMultilineObject) {
          defaultSep = ',\n  ';
        }

        // Rebuild: ensure moved items that were last get a separator when no postfix and not last now
        const reordered = sorted.map(
          (item) => byIndex.get(item.originalIndex)!
        );
        // If the new first item had leading that contains comments (e.g., from previous neighbor),
        // preserve that leading by prepending it to segmentLeading, but strip any starting commas/spaces.
        let rebuilt = segmentLeading;
        if (reordered.length > 0) {
          const firstPiece = reordered[0]!;
          if (firstPiece.leading && firstPiece.leading.trim().length > 0) {
            const cleanedFirstLeading = firstPiece.leading.replace(
              /^[\s,]+/,
              (m) => {
                // remove leading commas and spaces entirely
                return m
                  .replace(/[,]+/g, '')
                  .replace(/\s+/g, () => (isMultilineObject ? '\n  ' : ' '))
                  .trimStart();
              }
            );
            if (cleanedFirstLeading.length > 0) {
              rebuilt += cleanedFirstLeading;
            }
          }
        }
        for (let i = 0; i < reordered.length; i++) {
          const p = reordered[i]!;
          // If originally-first piece moves away from first position, drop its original leading (which may include top-level comments)
          const effectiveLeading =
            p.wasFirstInSegment && i > 0 ? defaultSep : p.leading;
          // use existing leading if present; otherwise synthesize default sep (for non-first)
          let leading =
            i === 0
              ? ''
              : effectiveLeading.length > 0
              ? effectiveLeading
              : defaultSep;
          if (i > 0 && !isMultilineObject && leading.trim().length === 0) {
            leading = defaultSep; // ensure at least ', ' on single-line
          }
          rebuilt += leading + p.text;
        }

        fixes.push(fixer.replaceTextRange([segStart, segEnd], rebuilt));
        // If this is the last segment (ends at last property), and there is a trailing comma before '}', remove it
        const isLastSegment = lastIdx === properties.length - 1;
        if (isLastSegment) {
          const after = sourceCode.text.slice(segEnd, node.range[1]);
          const m = after.match(/^(\s*),(?=\s*\})/);
          if (m && typeof m[1] === 'string') {
            const commaStart = segEnd + m[1].length;
            const commaEnd = commaStart + 1;
            fixes.push(fixer.replaceTextRange([commaStart, commaEnd], ''));
          }
        }
      });

      return fixes;
    },
  });
}
