export function isStyleObjectName(name: string): boolean {
  const stylePatterns = [
    /^styles?$/i,
    /^style$/i,
    /Style$/,
    /Styles$/,
    /styles/i, // Matches "styles" anywhere in the name
    /^sx$/i,
    /^theme$/i,
    /^classes?$/i,
    /^css$/i,
  ];

  return stylePatterns.some((pattern) => pattern.test(name));
}
