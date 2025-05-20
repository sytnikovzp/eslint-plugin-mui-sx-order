const preferredOrder = [
  // Positioning
  'position', 'top', 'right', 'bottom', 'left', 'zIndex',

  // Display & Layout
  'display', 'boxSizing', 'visibility', 'overflow', 'overflowX', 'overflowY',

  // Flexbox
  'flex', 'flexBasis', 'flexDirection', 'flexFlow', 'flexGrow', 'flexShrink', 'flexWrap',
  'justifyContent', 'justifyItems', 'justifySelf',
  'alignContent', 'alignItems', 'alignSelf',
  'order', 'gap', 'rowGap', 'columnGap',

  // Grid
  'grid', 'gridArea', 'gridTemplate', 'gridTemplateAreas',
  'gridTemplateRows', 'gridTemplateColumns',
  'gridRow', 'gridRowStart', 'gridRowEnd',
  'gridColumn', 'gridColumnStart', 'gridColumnEnd',
  'gridAutoFlow', 'gridAutoRows', 'gridAutoColumns',
  'gridGap', 'gridRowGap', 'gridColumnGap',
  'placeItems', 'placeContent', 'placeSelf',

  // Sizing & Box Model
  'width', 'minWidth', 'maxWidth',
  'height', 'minHeight', 'maxHeight', 'aspectRatio',

  // Spacing
  'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my',
  'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py',
  'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',

  // Border
  'border', 'borderWidth', 'borderStyle', 'borderColor',
  'borderTop', 'borderTopWidth', 'borderTopStyle', 'borderTopColor',
  'borderRight', 'borderRightWidth', 'borderRightStyle', 'borderRightColor',
  'borderBottom', 'borderBottomWidth', 'borderBottomStyle', 'borderBottomColor',
  'borderLeft', 'borderLeftWidth', 'borderLeftStyle', 'borderLeftColor',
  'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius',
  'borderBottomLeftRadius', 'borderBottomRightRadius',

  // Background & Effects
  'background', 'backgroundColor', 'bgcolor', 'backgroundImage',
  'backgroundSize', 'backgroundPosition', 'backgroundRepeat', 'backgroundClip',
  'boxShadow', 'filter', 'opacity', 'backdropFilter',

  // Typography
  'font', 'fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'fontVariant',
  'letterSpacing', 'lineHeight', 'color',
  'textAlign', 'textDecoration', 'textTransform', 'textIndent', 'textOverflow',
  'whiteSpace', 'wordBreak', 'overflowWrap',

  // Other visuals
  'objectFit', 'objectPosition', 'content',

  // Transitions & Animations
  'transition', 'transitionDuration', 'transitionTimingFunction',
  'animation', 'transform', 'willChange',

  // Interactions
  'cursor', 'pointerEvents', 'userSelect',

  // Responsive breakpoints
  'xs', 'sm', 'md', 'lg', 'xl'
];

function getOrder(key) {
  const index = preferredOrder.indexOf(key);
  return index !== -1
    ? index
    : preferredOrder.length + (typeof key === 'string' ? key.charCodeAt(0) : 0);
}

module.exports = { preferredOrder, getOrder };
