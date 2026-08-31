import type { ClipboardWriteAdapter, TranspositionPresentation } from '../types.js';

export async function copyResultToClipboard(
  presentation: TranspositionPresentation,
  adapter: ClipboardWriteAdapter,
): Promise<void> {
  try {
    if (typeof adapter.write !== 'function') throw new Error('unsupported');
    const item = new ClipboardItem({
      'text/html': new Blob([presentation.html], { type: 'text/html' }),
      'text/plain': new Blob([presentation.plainText], { type: 'text/plain' }),
    });
    await adapter.write([item]);
  } catch {
    throw new Error('Tuloksen kopiointi epäonnistui');
  }
}
