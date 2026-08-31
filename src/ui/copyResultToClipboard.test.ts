import { afterEach, describe, expect, it, vi } from 'vitest';

import type { TranspositionPresentation } from '../types.js';
import { copyResultToClipboard } from './copyResultToClipboard.js';

const presentation: TranspositionPresentation = {
  html: '<div><strong>C</strong></div>',
  plainText: 'C',
  warnings: [],
};

afterEach(() => vi.unstubAllGlobals());

describe('copyResultToClipboard', () => {
  it('AC26: kirjoittaa molemmat MIME-muodot kerran', async () => {
    class FakeClipboardItem {
      constructor(readonly data: Record<string, Blob>) {}
    }
    vi.stubGlobal('ClipboardItem', FakeClipboardItem);
    const write = vi.fn().mockResolvedValue(undefined);

    await copyResultToClipboard(presentation, { write });

    expect(write).toHaveBeenCalledTimes(1);
    const item = write.mock.calls[0]?.[0][0] as FakeClipboardItem;
    await expect(item.data['text/html']?.text()).resolves.toBe(presentation.html);
    await expect(item.data['text/plain']?.text()).resolves.toBe('C');
  });

  it('AC27: asettaa Blobien täsmälliset MIME-tyypit', async () => {
    class FakeClipboardItem {
      constructor(readonly data: Record<string, Blob>) {}
    }
    vi.stubGlobal('ClipboardItem', FakeClipboardItem);
    const write = vi.fn().mockResolvedValue(undefined);
    await copyResultToClipboard(presentation, { write });
    const item = write.mock.calls[0]?.[0][0] as FakeClipboardItem;
    expect(item.data['text/html']?.type).toBe('text/html');
    expect(item.data['text/plain']?.type).toBe('text/plain');
  });

  it('AC28: hylkää puuttuvan clipboard.write-tuen', async () => {
    vi.stubGlobal('ClipboardItem', class { constructor(_data: Record<string, Blob>) {} });
    const writeText = vi.fn();
    await expect(
      copyResultToClipboard(presentation, { writeText } as never),
    ).rejects.toThrow('Tuloksen kopiointi epäonnistui');
    expect(writeText).not.toHaveBeenCalled();
  });

  it('AC29: hylkää puuttuvan ClipboardItem-tuen', async () => {
    vi.stubGlobal('ClipboardItem', undefined);
    const write = vi.fn();
    await expect(copyResultToClipboard(presentation, { write })).rejects.toThrow(
      'Tuloksen kopiointi epäonnistui',
    );
    expect(write).not.toHaveBeenCalled();
  });

  it('AC30: normalisoi write-rejectin', async () => {
    vi.stubGlobal('ClipboardItem', class { constructor(_data: Record<string, Blob>) {} });
    const write = vi.fn().mockRejectedValue(new DOMException('Denied', 'NotAllowedError'));
    await expect(copyResultToClipboard(presentation, { write })).rejects.toThrow(
      'Tuloksen kopiointi epäonnistui',
    );
  });
});
