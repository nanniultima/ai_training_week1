export function renderLineNumbers(content: string): readonly string[] {
  return content.split('\n').map((_, index) => String(index + 1));
}

export function toVisibleLineNumber(index: number): number {
  return index + 1;
}
