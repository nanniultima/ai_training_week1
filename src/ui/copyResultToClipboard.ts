import type { ClipboardWriteAdapter, TranspositionPresentation } from '../types.js';

function stabilizeClipboardHtml(html: string): string {
  const template = document.createElement('template');
  template.innerHTML = html;
  const visit = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent = (node.textContent ?? '').replace(
        /^ +| +$| {2,}/g,
        (spaces) => '\u00a0'.repeat(spaces.length),
      );
      return;
    }
    node.childNodes.forEach(visit);
  };
  template.content.childNodes.forEach(visit);
  return template.innerHTML;
}

export async function copyResultToClipboard(
  presentation: TranspositionPresentation,
  adapter: ClipboardWriteAdapter,
): Promise<void> {
  try {
    if (typeof adapter.write !== 'function') throw new Error('unsupported');
    const item = new ClipboardItem({
      'text/html': new Blob([stabilizeClipboardHtml(presentation.html)], { type: 'text/html' }),
      'text/plain': new Blob([presentation.plainText], { type: 'text/plain' }),
    });
    await adapter.write([item]);
  } catch {
    throw new Error('Tuloksen kopiointi epäonnistui');
  }
}
