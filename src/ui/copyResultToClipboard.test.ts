// @vitest-environment happy-dom

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

  it('Google Docs AC1: vakauttaa vain kohdistusvälit HTML-kopioon', async () => {
    class FakeClipboardItem { constructor(readonly data: Record<string, Blob>) {} }
    vi.stubGlobal('ClipboardItem', FakeClipboardItem);
    const write = vi.fn().mockResolvedValue(undefined);
    const aligned: TranspositionPresentation = {
      html: '<div><span>        |G  |</span><span>Muistan kaikki</span></div>',
      plainText: '        |G  |Muistan kaikki', warnings: [],
    };
    await copyResultToClipboard(aligned, { write });
    const item = write.mock.calls[0]?.[0][0] as FakeClipboardItem;
    const html = await item.data['text/html']!.text();
    const template = document.createElement('template');
    template.innerHTML = html;
    expect([...template.content.querySelectorAll('span')].map((span) => span.textContent)).toEqual([
      `${'\u00a0'.repeat(8)}|G${'\u00a0'.repeat(2)}|`,
      'Muistan kaikki',
    ]);
  });

  it.each([
    [' |G ', '\u00a0|G\u00a0'],
    ['   ', '\u00a0\u00a0\u00a0'],
    ['Muistan kaikki', 'Muistan kaikki'],
    ['Muistan  kaikki   nyt', 'Muistan\u00a0\u00a0kaikki\u00a0\u00a0\u00a0nyt'],
    ['\u00a0 |G  | ', '\u00a0 |G\u00a0\u00a0|\u00a0'],
  ])('Google Docs AC1: kattaa tekstisolmun välirajan (%s)', async (source, expected) => {
    class FakeClipboardItem { constructor(readonly data: Record<string, Blob>) {} }
    vi.stubGlobal('ClipboardItem', FakeClipboardItem);
    const write = vi.fn().mockResolvedValue(undefined);
    await copyResultToClipboard({ html: `<div><span>${source}</span></div>`, plainText: source, warnings: [] }, { write });
    const item = write.mock.calls[0]?.[0][0] as FakeClipboardItem;
    const template = document.createElement('template');
    template.innerHTML = await item.data['text/html']!.text();
    expect(template.content.querySelector('span')?.textContent).toBe(expected);
    expect(write).toHaveBeenCalledTimes(1);
  });

  it('Google Docs AC2: säilyttää plain textin ja presentationin', async () => {
    class FakeClipboardItem { constructor(readonly data: Record<string, Blob>) {} }
    vi.stubGlobal('ClipboardItem', FakeClipboardItem);
    const write = vi.fn().mockResolvedValue(undefined);
    const aligned: TranspositionPresentation = {
      html: '<div><span>  |G  |</span></div>',
      plainText: '  |G  |\nMuistan kaikki', warnings: [],
    };
    const before = structuredClone(aligned);
    await copyResultToClipboard(aligned, { write });
    const item = write.mock.calls[0]?.[0][0] as FakeClipboardItem;
    await expect(item.data['text/plain']!.text()).resolves.toBe('  |G  |\nMuistan kaikki');
    expect(item.data['text/plain']!.type).toBe('text/plain');
    const template = document.createElement('template');
    template.innerHTML = await item.data['text/html']!.text();
    expect(template.content.querySelector('span')?.textContent).toBe('\u00a0\u00a0|G\u00a0\u00a0|');
    expect(aligned).toEqual(before);
  });

  it('Google Docs AC3: säilyttää HTML-kopion muotoiluelementit', async () => {
    class FakeClipboardItem { constructor(readonly data: Record<string, Blob>) {} }
    vi.stubGlobal('ClipboardItem', FakeClipboardItem);
    const write = vi.fn().mockResolvedValue(undefined);
    await copyResultToClipboard({
      html: '<div><strong><span>  C</span></strong><em><span>teksti</span></em></div>',
      plainText: '  Cteksti', warnings: [],
    }, { write });
    const item = write.mock.calls[0]?.[0][0] as FakeClipboardItem;
    const html = await item.data['text/html']!.text();
    expect(html).toContain('<strong>');
    expect(html).toContain('<em>');
    const template = document.createElement('template');
    template.innerHTML = html;
    expect([...template.content.querySelectorAll('*')].map(element => element.tagName))
      .toEqual(['DIV', 'STRONG', 'SPAN', 'EM', 'SPAN']);
    expect([...template.content.querySelector('div')!.children].map(element => element.tagName))
      .toEqual(['STRONG', 'EM']);
    expect(template.content.querySelector('strong > span')?.textContent).toBe('\u00a0\u00a0C');
    expect(template.content.querySelector('em > span')?.textContent).toBe('teksti');
    expect([...template.content.querySelectorAll('*')].every(element => element.attributes.length === 0)).toBe(true);
  });
});
