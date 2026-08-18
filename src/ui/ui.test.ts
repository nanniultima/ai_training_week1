// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest';

import { initializeUi } from './ui.js';

describe('initializeUi', () => {
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

  it('AC24 näyttää yksiselitteisen kohdesävellajin automaattisesti', () => {
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

  it('AC25 näyttää enharmoniset vaihtoehdot automaattisesti', () => {
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

  it('AC26 piilottaa kohteen keskeneräisessä ja virheellisessä tilassa', () => {
    const invalidCases: ReadonlyArray<{
      readonly name: string;
      readonly invalidate: (root: HTMLDivElement) => void;
    }> = [
      {
        name: 'puuttuva moodi',
        invalidate: (root) => {
          const major = root.querySelector<HTMLInputElement>(
            'input[name=key-mode][value=major]',
          );
          if (major !== null) {
            major.checked = false;
            major.dispatchEvent(new Event('change', { bubbles: true }));
          }
        },
      },
      {
        name: 'puuttuva toonika',
        invalidate: (root) => {
          const sourceKey = root.querySelector<HTMLSelectElement>('#source-key');
          if (sourceKey !== null) {
            sourceKey.selectedIndex = -1;
            sourceKey.dispatchEvent(new Event('change', { bubbles: true }));
          }
        },
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
});
