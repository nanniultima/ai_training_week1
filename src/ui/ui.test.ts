// @vitest-environment happy-dom

import { describe, expect, it, vi } from 'vitest';
// @ts-expect-error Test-only Node builtin is intentionally outside browser tsconfig types.
import { readFileSync } from 'node:fs';

import { initializeUi } from './ui.js';
const styles = readFileSync('style.css', 'utf8');

function amendmentsUi() {
  const root = document.createElement('div');
  initializeUi(root);
  root.querySelector<HTMLInputElement>('input[name=key-mode][value=major]')!.click();
  const source = root.querySelector<HTMLSelectElement>('#source-key')!;
  source.value = 'C';
  source.dispatchEvent(new Event('change'));
  const step = root.querySelector<HTMLInputElement>('#transpose-step')!;
  step.value = '2';
  step.dispatchEvent(new Event('input'));
  const input = root.querySelector<HTMLElement>('#music-input')!;
  input.innerHTML = '<div>C |G |</div>';
  return { root, step, input, button: root.querySelector<HTMLButtonElement>('.transpose-actions button')! };
}

describe('initializeUi', () => {
  it.each(['-12', '12', '19', '1.5'])('Settings AC16–AC18 / Result AC37: näyttää virheellisen askelmäärän virheen (%s)', value => {
    const { root, input, step, button } = amendmentsUi();
    button.click();
    expect(root.querySelector('#music-result')!.textContent).toBe('D |A |');
    const before = input.innerHTML;
    root.querySelector('#result-warnings')!.textContent = 'vanha varoitus';
    root.querySelector('#copy-status')!.textContent = 'Tulos kopioitu';
    step.value = value;
    step.dispatchEvent(new Event('input'));
    button.click();
    const error = root.querySelector<HTMLElement>('#transposition-error')!;
    expect(error.textContent).toBe('Askelmäärän pitää olla kokonaisluku väliltä -11–11');
    expect(error.hidden).toBe(false);
    expect(error.getAttribute('role')).toBe('alert');
    expect(root.querySelector('#music-result')!.innerHTML).toBe('');
    expect(root.querySelector('#result-warnings')!.textContent).toBe('');
    expect(root.querySelector('#copy-status')!.textContent).toBe('');
    expect(root.querySelector<HTMLElement>('#input-editor-pane')!.hidden).toBe(false);
    expect(root.querySelector<HTMLElement>('#transposition-result')!.hidden).toBe(true);
    expect(root.querySelector<HTMLButtonElement>('#show-result')!.disabled).toBe(true);
    expect(root.querySelector<HTMLButtonElement>('#copy-result')!.disabled).toBe(true);
    expect(input.innerHTML).toBe(before);
    step.value = '2';
    step.dispatchEvent(new Event('input'));
    button.click();
    expect(error.hidden).toBe(true);
    expect(root.querySelector('#music-result')!.textContent).toBe('D |A |');
  });
  it('Editor lines AC6: näyttää varoituksessa numeropalstan rivin', () => {
    const { root, input, button } = amendmentsUi();
    input.innerHTML = '<div>C |</div><div>Cfoo |</div>';
    const before = input.innerHTML;
    input.dispatchEvent(new Event('input'));
    expect(root.querySelector('#line-number-gutter')!.textContent).toBe('1\n2');
    button.click();
    const warnings = [...root.querySelectorAll('#result-warnings p')];
    expect(warnings).toHaveLength(1);
    expect(warnings[0]!.textContent?.startsWith('Rivi 2, kohta 1: epäilyttävä sointu "Cfoo"')).toBe(true);
    expect(input.innerHTML).toBe(before);
  });
  it.each([
    ['', '1'], ['<div><br></div>', '1'], ['<div><br></div><div><br></div>', '1\n2'],
  ])('Editor lines AC4: numeroi tyhjän editorin (%s)', (html, expected) => {
    const { root, input } = amendmentsUi();
    input.innerHTML = html;
    input.dispatchEvent(new Event('input'));
    expect(root.querySelector('#line-number-gutter')!.textContent).toBe(expected);
    expect(root.querySelector<HTMLElement>('#transposition-error')!.hidden).toBe(true);
  });
  it('Editor lines AC3: normalisoi sisäkkäiset lohkot', () => {
    const { root, input } = amendmentsUi();
    input.innerHTML = '<div><p>C |G |</p></div><div>onpa</div>';
    input.dispatchEvent(new Event('input'));
    expect(root.querySelector('#line-number-gutter')!.textContent).toBe('1\n2');
  });
  it.each([
    ['<div>C |G |<br>onpa</div>', '1\n2'],
    ['<div>C |G |</div><div><br></div><div>onpa</div>', '1\n2\n3'],
  ])('Editor lines AC2: numeroi br-erottimen ja tyhjän rivin (%s)', (html, expected) => {
    const { root, input } = amendmentsUi();
    input.innerHTML = html;
    input.dispatchEvent(new Event('input'));
    expect(root.querySelector('#line-number-gutter')!.textContent).toBe(expected);
  });
  it('Editor lines AC1: numeroi HTML-lohkorivit muuttamatta editoria', () => {
    const { root, input } = amendmentsUi();
    input.innerHTML = '<div>C |G |</div><div>onpa</div>';
    const before = input.innerHTML;
    input.dispatchEvent(new Event('input'));
    expect(root.querySelector('#line-number-gutter')!.textContent).toBe('1\n2');
    expect(input.innerHTML).toBe(before);
  });
  it('Amendments AC10: hyväksyy eksplisiittisen nollan', () => {
    const { root, step, input, button } = amendmentsUi();
    input.innerHTML = '<div>H |G |</div>';
    step.value = '0';
    step.dispatchEvent(new Event('input'));
    button.click();
    expect(root.querySelector('#music-result')!.textContent).toBe('B |G |');
    expect(root.querySelector<HTMLElement>('#transposition-error')!.hidden).toBe(true);
    expect(root.querySelector<HTMLButtonElement>('#show-result')!.disabled).toBe(false);
    expect(root.querySelector<HTMLButtonElement>('#copy-result')!.disabled).toBe(false);
    expect(root.querySelector('#target-key-preview')!.textContent).toBe('Kohdesävellaji: C-duuri');
  });
  it('Amendments AC9: näyttää tyhjän askelkentän virheen', () => {
    const { root, step, button } = amendmentsUi();
    button.click();
    expect(root.querySelector('#music-result')!.textContent).toBe('D |A |');
    root.querySelector('#result-warnings')!.textContent = 'vanha varoitus';
    step.value = '';
    step.dispatchEvent(new Event('input'));
    button.click();
    const error = root.querySelector<HTMLElement>('#transposition-error')!;
    expect(error.textContent).toBe('Anna puolisävelaskelten määrä');
    expect(error.hidden).toBe(false);
    expect(error.getAttribute('role')).toBe('alert');
    expect(root.querySelector('#music-result')!.innerHTML).toBe('');
    expect(root.querySelector('#result-warnings')!.textContent).toBe('');
    expect(root.querySelector('#show-input')!.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector<HTMLElement>('#transposition-result')!.hidden).toBe(true);
    expect(root.querySelector<HTMLButtonElement>('#show-result')!.disabled).toBe(true);
    expect(root.querySelector<HTMLButtonElement>('#copy-result')!.disabled).toBe(true);
  });
  it('Amendments AC8: piilottaa esikatselun tyhjällä askelkentällä', () => {
    const { root, step, input } = amendmentsUi();
    expect(root.querySelector<HTMLElement>('#target-key-preview')!.textContent).toBe('Kohdesävellaji: D-duuri');
    const before = input.innerHTML;
    step.value = '';
    step.dispatchEvent(new Event('input'));
    expect(root.querySelector<HTMLElement>('#target-key-preview')!.hidden).toBe(true);
    expect(root.querySelector<HTMLElement>('#enharmonic-choice')!.hidden).toBe(true);
    expect(input.innerHTML).toBe(before);
  });
  it('AC31: alustaa aktiivisen syötenäkymän ja käytöstä poistetun tulosvalinnan', () => {
    const root = document.createElement('div');
    initializeUi(root);
    const inputPane = root.querySelector<HTMLElement>('#input-editor-pane');
    const area = root.querySelector<HTMLElement>('#transposition-result');
    const inputView = root.querySelector<HTMLButtonElement>('#show-input');
    const resultView = root.querySelector<HTMLButtonElement>('#show-result');
    const copy = root.querySelector<HTMLButtonElement>('#copy-result');
    const output = root.querySelector<HTMLElement>('#music-result');
    expect(inputPane?.hidden).toBe(false);
    expect(area?.hidden).toBe(true);
    expect(inputView?.getAttribute('aria-pressed')).toBe('true');
    expect(resultView?.getAttribute('aria-pressed')).toBe('false');
    expect(resultView?.disabled).toBe(true);
    expect(copy?.disabled).toBe(true);
    expect(output?.innerHTML).toBe('');
  });
  it('AC32: luo vain luku -rikastekstikentän', () => {
    const root = document.createElement('div');
    initializeUi(root);
    const output = root.querySelector<HTMLElement>('#music-result');
    expect(output?.getAttribute('contenteditable')).toBe('false');
    expect(output?.getAttribute('role')).toBe('textbox');
    expect(output?.getAttribute('aria-readonly')).toBe('true');
    expect(output?.getAttribute('aria-label')).toBe('Transponoitu tulos');
  });
  it('AC33: vaihtaa syöte- ja tulospaneelin välillä', () => {
    const root = document.createElement('div');
    initializeUi(root);
    const inputPane = root.querySelector<HTMLElement>('#input-editor-pane');
    const resultPane = root.querySelector<HTMLElement>('#transposition-result');
    const inputView = root.querySelector<HTMLButtonElement>('#show-input');
    const resultView = root.querySelector<HTMLButtonElement>('#show-result');
    resultView?.removeAttribute('disabled');
    resultView?.click();
    expect(inputPane?.hidden).toBe(true);
    expect(resultPane?.hidden).toBe(false);
    expect(inputView?.getAttribute('aria-pressed')).toBe('false');
    expect(resultView?.getAttribute('aria-pressed')).toBe('true');
    inputView?.click();
    expect(inputPane?.hidden).toBe(false);
    expect(resultPane?.hidden).toBe(true);
    expect(inputView?.getAttribute('aria-pressed')).toBe('true');
    expect(resultView?.getAttribute('aria-pressed')).toBe('false');
  });
  it('AC34: käyttää yhtä täysleveää paneelisaraketta ja 80rem sivua', () => {
    expect(styles).toMatch(/main\s*\{[^}]*width:\s*min\(80rem,\s*calc\(100% - 2rem\)\)/s);
    expect(styles).toMatch(/\.editor-result-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
    expect(styles).not.toMatch(/grid-template-columns:\s*repeat\(2/);
  });
  it('AC35: vaihtaa onnistumisessa automaattisesti tulosnäkymään', () => {
    const root = document.createElement('div');
    initializeUi(root);
    root.querySelector<HTMLInputElement>('input[name=key-mode][value=major]')?.click();
    const source = root.querySelector<HTMLSelectElement>('#source-key');
    const step = root.querySelector<HTMLInputElement>('#transpose-step');
    const input = root.querySelector<HTMLElement>('#music-input');
    if (source) source.value = 'C';
    if (step) step.value = '2';
    if (input) input.innerHTML = '<div>C |G |</div>';
    root.querySelector<HTMLButtonElement>('.transpose-actions button')?.click();
    expect(root.querySelector<HTMLElement>('#input-editor-pane')?.hidden).toBe(true);
    expect(root.querySelector<HTMLElement>('#transposition-result')?.hidden).toBe(false);
    expect(root.querySelector<HTMLElement>('#music-result')?.textContent).toBe('D |A |');
    expect(root.querySelector<HTMLButtonElement>('#show-result')?.disabled).toBe(false);
    expect(root.querySelector<HTMLButtonElement>('#show-result')?.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector<HTMLButtonElement>('#copy-result')?.disabled).toBe(false);
  });
  it('AC36: korvaa vanhan tuloksen ja varoitukset', () => {
    const root = document.createElement('div');
    initializeUi(root);
    const output = root.querySelector<HTMLElement>('#music-result');
    const warnings = root.querySelector<HTMLElement>('#result-warnings');
    if (output) output.textContent = 'C |G |';
    if (warnings) warnings.textContent = 'vanha varoitus';
    root.querySelector<HTMLInputElement>('input[name=key-mode][value=major]')?.click();
    const source = root.querySelector<HTMLSelectElement>('#source-key');
    const step = root.querySelector<HTMLInputElement>('#transpose-step');
    const input = root.querySelector<HTMLElement>('#music-input');
    if (source) source.value = 'C';
    if (step) step.value = '2';
    if (input) input.innerHTML = '<div>C |G |</div>';
    root.querySelector<HTMLButtonElement>('.transpose-actions button')?.click();
    expect(output?.textContent).toBe('D |A |');
    expect(output?.textContent).not.toContain('C |G |');
    expect(warnings?.textContent).not.toContain('vanha varoitus');
  });
  it('AC37: tyhjentää tuloksen ja palauttaa syötenäkymän käsittelyvirheessä', () => {
    const root = document.createElement('div');
    initializeUi(root);
    const area = root.querySelector<HTMLElement>('#transposition-result');
    const output = root.querySelector<HTMLElement>('#music-result');
    const warnings = root.querySelector<HTMLElement>('#result-warnings');
    const copy = root.querySelector<HTMLButtonElement>('#copy-result');
    const status = root.querySelector<HTMLElement>('#copy-status');
    const inputPane = root.querySelector<HTMLElement>('#input-editor-pane');
    const resultView = root.querySelector<HTMLButtonElement>('#show-result');
    if (area) area.hidden = false;
    if (output) output.textContent = 'vanha';
    if (warnings) warnings.textContent = 'varoitus';
    if (copy) copy.disabled = false;
    if (status) status.textContent = 'Tulos kopioitu';
    root.querySelector<HTMLInputElement>('input[name=key-mode][value=major]')?.click();
    root.querySelector<HTMLButtonElement>('.transpose-actions button')?.click();
    expect(area?.hidden).toBe(true);
    expect(inputPane?.hidden).toBe(false);
    expect(output?.innerHTML).toBe('');
    expect(warnings?.textContent).toBe('');
    expect(status?.textContent).toBe('');
    expect(copy?.disabled).toBe(true);
    expect(resultView?.disabled).toBe(true);
    expect(root.querySelector<HTMLElement>('#transposition-error')?.textContent).toBe('Valitse lähtösävellaji');
  });
  it('AC38: estää ajon avoimessa enharmonisessa valinnassa', () => {
    const root = document.createElement('div');
    initializeUi(root);
    root.querySelector<HTMLInputElement>('input[name=key-mode][value=major]')?.click();
    const source = root.querySelector<HTMLSelectElement>('#source-key');
    const step = root.querySelector<HTMLInputElement>('#transpose-step');
    const input = root.querySelector<HTMLElement>('#music-input');
    if (source) source.value = 'C';
    if (step) step.value = '1';
    if (input) input.innerHTML = '<div>C |G |</div>';
    root.querySelector<HTMLButtonElement>('.transpose-actions button')?.click();
    expect(root.querySelector<HTMLElement>('#transposition-error')?.textContent).toBe(
      'Valitse kohdesävellajin kirjoitusasu',
    );
    expect(root.querySelector<HTMLElement>('#transposition-result')?.hidden).toBe(true);
  });
  it('AC39: näyttää onnistumistilan vasta write-promisen ratkettua', async () => {
    vi.stubGlobal('ClipboardItem', class { constructor(_data: Record<string, Blob>) {} });
    let resolveWrite: (() => void) | undefined;
    const write = vi.fn(() => new Promise<void>((resolve) => {
      resolveWrite = resolve;
    }));
    Object.defineProperty(navigator, 'clipboard', { value: { write }, configurable: true });
    const root = document.createElement('div');
    initializeUi(root);
    root.querySelector<HTMLInputElement>('input[name=key-mode][value=major]')?.click();
    const source = root.querySelector<HTMLSelectElement>('#source-key');
    const input = root.querySelector<HTMLElement>('#music-input');
    if (source) source.value = 'C';
    if (input) input.innerHTML = '<div>C |G |</div>';
    root.querySelector<HTMLButtonElement>('.transpose-actions button')?.click();
    root.querySelector<HTMLButtonElement>('#copy-result')?.click();
    await Promise.resolve();
    const status = root.querySelector<HTMLElement>('#copy-status');
    expect(status?.textContent).toBe('');
    expect(status?.hasAttribute('role')).toBe(false);
    resolveWrite?.();
    await vi.waitFor(() => expect(status?.textContent).toBe('Tulos kopioitu'));
    expect(status?.textContent).toBe('Tulos kopioitu');
    expect(status?.getAttribute('role')).toBe('status');
  });
  it('AC40: säilyttää tuloksen kopiointivirheessä', async () => {
    vi.stubGlobal('ClipboardItem', class { constructor(_data: Record<string, Blob>) {} });
    Object.defineProperty(navigator, 'clipboard', {
      value: { write: vi.fn().mockRejectedValue(new Error('denied')) }, configurable: true,
    });
    const root = document.createElement('div');
    initializeUi(root);
    root.querySelector<HTMLInputElement>('input[name=key-mode][value=major]')?.click();
    const source = root.querySelector<HTMLSelectElement>('#source-key');
    const input = root.querySelector<HTMLElement>('#music-input');
    if (source) source.value = 'C';
    if (input) input.innerHTML = '<div>C |G |</div>';
    root.querySelector<HTMLButtonElement>('.transpose-actions button')?.click();
    root.querySelector<HTMLButtonElement>('#copy-result')?.click();
    await vi.waitFor(() => expect(root.querySelector<HTMLElement>('#copy-status')?.textContent).toBe('Tuloksen kopiointi epäonnistui'));
    expect(root.querySelector<HTMLElement>('#music-result')?.textContent).toBe('C |G |');
    expect(root.querySelector<HTMLButtonElement>('#copy-result')?.disabled).toBe(false);
    expect(root.querySelector<HTMLElement>('#copy-status')?.getAttribute('role')).toBe('alert');
  });
  it('AC41: tyhjentää kopiointitilan uudessa yrityksessä', () => {
    const root = document.createElement('div');
    initializeUi(root);
    const status = root.querySelector<HTMLElement>('#copy-status');
    if (status) status.textContent = 'Tulos kopioitu';
    root.querySelector<HTMLButtonElement>('.transpose-actions button')?.click();
    expect(status?.textContent).toBe('');
  });
  it('AC42: tarjoaa vain kopioinnin ilman latausta tai palstaa', () => {
    const root = document.createElement('div');
    initializeUi(root);
    const area = root.querySelector<HTMLElement>('#transposition-result');
    expect(area?.querySelectorAll('button')).toHaveLength(1);
    expect(area?.querySelector('button')?.textContent).toBe('Kopioi tulos');
    expect(area?.querySelector('[download]')).toBeNull();
    expect(area?.querySelector('.line-number-gutter')).toBeNull();
  });
  it('AC43: poistaa keskeneräisyystekstit', () => {
    const root = document.createElement('div');
    initializeUi(root);
    expect(root.textContent).not.toContain('Luonnos');
    expect(root.textContent).not.toContain('Toiminto tulossa');
  });
  it('AC44: välittää valitun enharmonisen kirjoitusasun transponointiin', () => {
    const root = document.createElement('div');
    initializeUi(root);
    root.querySelector<HTMLInputElement>('input[name=key-mode][value=major]')?.click();
    const source = root.querySelector<HTMLSelectElement>('#source-key');
    const step = root.querySelector<HTMLInputElement>('#transpose-step');
    const input = root.querySelector<HTMLElement>('#music-input');
    if (source) source.value = 'C';
    if (step) {
      step.value = '1';
      step.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (input) input.innerHTML = '<div>C |G |</div>';
    root.querySelector<HTMLInputElement>('input[name=enharmonic-choice][value=Db]')?.click();
    root.querySelector<HTMLButtonElement>('.transpose-actions button')?.click();
    expect(root.querySelector<HTMLElement>('#transposition-error')?.hidden).toBe(true);
    expect(root.querySelector<HTMLElement>('#music-result')?.textContent).toBe('Db |Ab |');
    expect(root.querySelector<HTMLElement>('#transposition-result')?.hidden).toBe(false);
  });
  it('luo muotoiluja tukevan editorin', () => {
    const root = { innerHTML: '' } as unknown as HTMLElement;

    initializeUi(root);

    expect(root.innerHTML).toContain('contenteditable=\u0022true\u0022');
    expect(root.innerHTML).toContain('aria-multiline=\u0022true\u0022');
  });

  it('luo transponointiasetusten käyttöliittymärungon', () => {
    const root = { innerHTML: '' } as unknown as HTMLElement;

    initializeUi(root);

    expect(root.innerHTML).toContain('name=\u0022key-mode\u0022 value=\u0022major\u0022');
    expect(root.innerHTML).toContain('name=\u0022key-mode\u0022 value=\u0022minor\u0022');
    expect(root.innerHTML).toContain('id=\u0022source-key\u0022 disabled');
    expect(root.innerHTML).toContain('min=\u0022-11\u0022 max=\u002211\u0022 value=\u00220\u0022');
    expect(root.innerHTML).toContain(
      'id=\u0022enharmonic-choice\u0022 class=\u0022enharmonic-choice\u0022 hidden',
    );
    expect(root.innerHTML).toContain('Valitse ensin duuri tai molli');
  });

  it('AC1 näyttää duurivalinnan jälkeen täsmälleen 15 duurisävellajia sävelkorkeusjärjestyksessä', () => {
    const root = document.createElement('div');
    initializeUi(root);

    const majorChoice = root.querySelector<HTMLInputElement>(
      'input[name=key-mode][value=major]',
    );
    const sourceKey = root.querySelector<HTMLSelectElement>('#source-key');

    expect(majorChoice).not.toBeNull();
    expect(sourceKey).not.toBeNull();

    majorChoice?.click();

    expect(
      Array.from(sourceKey?.options ?? [], (option) => option.value),
    ).toEqual([
      'C',
      'C#',
      'Db',
      'D',
      'Eb',
      'E',
      'F',
      'F#',
      'Gb',
      'G',
      'Ab',
      'A',
      'Bb',
      'B',
      'Cb',
    ]);
  });

  it('AC2 näyttää mollivalinnan jälkeen täsmälleen 15 mollisävellajia sävelkorkeusjärjestyksessä', () => {
    const root = document.createElement('div');
    initializeUi(root);

    const minorChoice = root.querySelector<HTMLInputElement>(
      'input[name=key-mode][value=minor]',
    );
    const sourceKey = root.querySelector<HTMLSelectElement>('#source-key');

    expect(minorChoice).not.toBeNull();
    expect(sourceKey).not.toBeNull();

    minorChoice?.click();

    expect(
      Array.from(sourceKey?.options ?? [], (option) => option.value),
    ).toEqual([
      'C',
      'C#',
      'D',
      'D#',
      'Eb',
      'E',
      'F',
      'F#',
      'G',
      'G#',
      'Ab',
      'A',
      'A#',
      'Bb',
      'B',
    ]);
  });

  it('AC3 tyhjentää lähtösävellajin ja näyttää mollilistan vaihdettaessa duurista molliin', () => {
    const root = document.createElement('div');
    initializeUi(root);

    const majorChoice = root.querySelector<HTMLInputElement>(
      'input[name=key-mode][value=major]',
    );
    const minorChoice = root.querySelector<HTMLInputElement>(
      'input[name=key-mode][value=minor]',
    );
    const sourceKey = root.querySelector<HTMLSelectElement>('#source-key');

    majorChoice?.click();
    if (sourceKey !== null) {
      sourceKey.value = 'C';
    }
    minorChoice?.click();

    expect(sourceKey?.value).toBe('');
    expect(
      Array.from(sourceKey?.options ?? [], (option) => option.value),
    ).toEqual([
      'C',
      'C#',
      'D',
      'D#',
      'Eb',
      'E',
      'F',
      'F#',
      'G',
      'G#',
      'Ab',
      'A',
      'A#',
      'Bb',
      'B',
    ]);
  });

  it('AC10 vahvistaa D-flat-duurin ja sulkee enharmonisen valinnan', () => {
    const root = document.createElement('div');
    initializeUi(root);

    root.querySelector<HTMLInputElement>(
      'input[name=key-mode][value=major]',
    )?.click();
    const sourceKey = root.querySelector<HTMLSelectElement>('#source-key');
    const stepInput = root.querySelector<HTMLInputElement>('#transpose-step');

    if (sourceKey !== null) {
      sourceKey.value = 'C';
      sourceKey.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (stepInput !== null) {
      stepInput.value = '1';
      stepInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    const flatChoice = root.querySelector<HTMLInputElement>(
      'input[name=enharmonic-choice][value=Db]',
    );
    expect(flatChoice).not.toBeNull();
    flatChoice?.click();

    expect(root.textContent).toContain('Kohdesävellaji: Db-duuri');
    expect(
      root.querySelector<HTMLElement>('#enharmonic-choice')?.hidden,
    ).toBe(true);
  });

  it('AC19 näyttää virheen, kun lähtötoonika puuttuu', () => {
    const root = document.createElement('div');
    initializeUi(root);

    root.querySelector<HTMLInputElement>(
      'input[name=key-mode][value=major]',
    )?.click();
    const stepInput = root.querySelector<HTMLInputElement>('#transpose-step');
    if (stepInput !== null) {
      stepInput.value = '1';
    }
    root.querySelector<HTMLButtonElement>('.transpose-actions button')?.click();

    const errorMessage = root.querySelector<HTMLElement>(
      '#transposition-error',
    );
    expect(errorMessage?.textContent).toBe('Valitse lähtösävellaji');
  });

  it('AC20 näyttää virheen, kun duuri- tai mollivalinta puuttuu', () => {
    const root = document.createElement('div');
    initializeUi(root);

    root.querySelector<HTMLButtonElement>('.transpose-actions button')?.click();

    expect(root.textContent).toContain('Valitse duuri tai molli');
  });

  it('AC6 laskee ja näyttää C-duuri +2 -kohteen automaattisesti', () => {
    const root = document.createElement('div');
    initializeUi(root);

    const majorChoice = root.querySelector<HTMLInputElement>(
      'input[name=key-mode][value=major]',
    );
    const sourceKey = root.querySelector<HTMLSelectElement>('#source-key');
    const stepInput = root.querySelector<HTMLInputElement>('#transpose-step');

    expect(majorChoice).not.toBeNull();
    expect(sourceKey).not.toBeNull();
    expect(stepInput).not.toBeNull();

    majorChoice?.click();
    if (stepInput !== null) {
      stepInput.value = '2';
      stepInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (sourceKey !== null) {
      sourceKey.value = 'C';
      sourceKey.dispatchEvent(new Event('change', { bubbles: true }));
    }

    expect(root.textContent).toContain('Kohdesävellaji: D-duuri');
    expect(
      root.querySelector<HTMLElement>('#enharmonic-choice')?.hidden,
    ).toBe(true);
  });

  it('AC23 näyttää yksiselitteisen kohdesävellajin automaattisesti', () => {
    const root = document.createElement('div');
    initializeUi(root);

    const stepInput = root.querySelector<HTMLInputElement>('#transpose-step');
    if (stepInput !== null) {
      stepInput.value = '2';
      stepInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    root.querySelector<HTMLInputElement>(
      'input[name=key-mode][value=major]',
    )?.click();
    const sourceKey = root.querySelector<HTMLSelectElement>('#source-key');
    if (sourceKey !== null) {
      sourceKey.value = 'C';
      sourceKey.dispatchEvent(new Event('change', { bubbles: true }));
    }

    expect(root.textContent).toContain('Kohdesävellaji: D-duuri');
  });

  it('AC24 näyttää enharmoniset vaihtoehdot automaattisesti', () => {
    const root = document.createElement('div');
    initializeUi(root);

    root.querySelector<HTMLInputElement>(
      'input[name=key-mode][value=major]',
    )?.click();
    const sourceKey = root.querySelector<HTMLSelectElement>('#source-key');
    const stepInput = root.querySelector<HTMLInputElement>('#transpose-step');
    if (sourceKey !== null) {
      sourceKey.value = 'C';
      sourceKey.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (stepInput !== null) {
      stepInput.value = '1';
      stepInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    const enharmonicChoice = root.querySelector<HTMLElement>(
      '#enharmonic-choice',
    );
    expect(enharmonicChoice?.hidden).toBe(false);
    expect(enharmonicChoice?.textContent).toContain('C#-duuri');
    expect(enharmonicChoice?.textContent).toContain('Db-duuri');
    expect(root.textContent).not.toContain('Kohdesävellaji:');
  });

  it('AC25 piilottaa kohteen keskeneräisessä ja virheellisessä tilassa', () => {
    const initialRoot = document.createElement('div');
    initializeUi(initialRoot);
    const initialMusic =
      initialRoot.querySelector<HTMLElement>('#music-input')?.innerHTML;

    expect(
      initialRoot.querySelector<HTMLElement>('#target-key-preview')?.hidden,
      'alkutila ilman moodia',
    ).toBe(true);
    expect(
      initialRoot.querySelector<HTMLElement>('#enharmonic-choice')?.hidden,
      'alkutila ilman moodia',
    ).toBe(true);
    expect(
      initialRoot.querySelector<HTMLElement>('#music-input')?.innerHTML,
      'alkutila ilman moodia',
    ).toBe(initialMusic);

    const invalidCases: ReadonlyArray<{
      readonly name: string;
      readonly invalidate: (root: HTMLDivElement) => void;
      readonly clearsSourceTonic?: boolean;
    }> = [
      {
        name: 'vaihto duurista molliin',
        invalidate: (root) => {
          root.querySelector<HTMLInputElement>(
            'input[name=key-mode][value=minor]',
          )?.click();
        },
        clearsSourceTonic: true,
      },
      ...['-12', '12', '1.5'].map((value) => ({
        name: `virheellinen askel ${value}`,
        invalidate: (root: HTMLDivElement) => {
          const stepInput = root.querySelector<HTMLInputElement>(
            '#transpose-step',
          );
          if (stepInput !== null) {
            stepInput.value = value;
            stepInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        },
      })),
    ];

    for (const invalidCase of invalidCases) {
      const root = document.createElement('div');
      initializeUi(root);
      root.querySelector<HTMLInputElement>(
        'input[name=key-mode][value=major]',
      )?.click();
      const sourceKey = root.querySelector<HTMLSelectElement>('#source-key');
      const stepInput = root.querySelector<HTMLInputElement>('#transpose-step');
      const musicInput = root.querySelector<HTMLElement>('#music-input');
      if (sourceKey !== null) {
        sourceKey.value = 'C';
        sourceKey.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (stepInput !== null) {
        stepInput.value = '2';
        stepInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const originalMusic = musicInput?.innerHTML;

      expect(
        root.textContent,
        `${invalidCase.name}: kelvollinen lähtötila`,
      ).toContain('Kohdesävellaji: D-duuri');

      invalidCase.invalidate(root);

      if (invalidCase.clearsSourceTonic === true) {
        expect(sourceKey?.value, invalidCase.name).toBe('');
      }
      expect(
        root.querySelector<HTMLElement>('#target-key-preview')?.hidden,
        invalidCase.name,
      ).toBe(true);
      expect(
        root.querySelector<HTMLElement>('#enharmonic-choice')?.hidden,
        invalidCase.name,
      ).toBe(true);
      expect(musicInput?.innerHTML, invalidCase.name).toBe(originalMusic);
    }
  });

  it('hylkää puuttuvan juurielementin', () => {
    expect(() => initializeUi(null)).toThrow(
      'Käyttöliittymän juurielementtiä ei löytynyt',
    );
  });

  it('AC22 liittää palstan editorin ulkopuolelle', () => {
    const root = document.createElement('div');
    initializeUi(root);

    const editor = root.querySelector<HTMLElement>('#music-input');
    const gutter = root.querySelector<HTMLElement>('#line-number-gutter');

    expect(editor).not.toBeNull();
    expect(gutter).not.toBeNull();
    expect(gutter?.parentElement).toBe(editor?.parentElement);
    expect(gutter?.hasAttribute('contenteditable')).toBe(false);
    expect(editor?.contains(gutter ?? null)).toBe(false);
  });

  it('AC23 synkronoi pystysuuntaisen vierityksen', () => {
    const root = document.createElement('div');
    initializeUi(root);
    const editor = root.querySelector<HTMLElement>('#music-input');
    const gutter = root.querySelector<HTMLElement>('#line-number-gutter');

    if (editor !== null) editor.scrollTop = 120;
    editor?.dispatchEvent(new Event('scroll'));

    expect(gutter?.scrollTop).toBe(120);
  });

  it('AC24 pitää numerot poissa editorin sisällöstä', () => {
    const root = document.createElement('div');
    initializeUi(root);
    const editor = root.querySelector<HTMLElement>('#music-input');
    const gutter = root.querySelector<HTMLElement>('#line-number-gutter');

    if (editor !== null) editor.textContent = "C |G |\nonpa";
    editor?.dispatchEvent(new Event('input'));

    expect(gutter?.textContent).toBe("1\n2");
    expect(editor?.textContent).toBe("C |G |\nonpa");
  });

  it('AC48: sijoittaa asetukset aktiivisen paneelin vasemmalle puolelle', () => {
    const root = document.createElement('div');
    initializeUi(root);
    const layout = root.querySelector<HTMLElement>('.workspace-layout');
    const settings = layout?.querySelector<HTMLElement>('.transposition-panel');
    const content = layout?.querySelector<HTMLElement>('.workspace-content');

    expect(layout).not.toBeNull();
    expect(settings).not.toBeNull();
    expect(content).not.toBeNull();
    expect(settings?.nextElementSibling).toBe(content);
    expect(content?.querySelector('.view-switcher')).not.toBeNull();
    expect(content?.querySelector('#input-editor-pane')).not.toBeNull();
    expect(content?.querySelector('#transposition-result')).not.toBeNull();
    expect(styles).toMatch(
      /\.workspace-layout\s*\{[^}]*grid-template-columns:\s*minmax\(18rem,\s*0\.75fr\)\s+minmax\(0,\s*2fr\)/s,
    );
  });

  it('AC49: pinoaa asetukset mobiilissa aktiivisen paneelin edelle', () => {
    expect(styles).toMatch(
      /@media\s*\(max-width:\s*64rem\)[\s\S]*?\.workspace-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/,
    );
  });
});
