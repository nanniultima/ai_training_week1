import {
  getAvailableTonics,
  resolveTranspositionSettings,
} from '../logic/transpositionSettings.js';
import type { KeyMode } from '../types.js';
import type { TranspositionPresentation } from '../types.js';
import { createTranspositionResult } from '../logic/createTranspositionResult.js';
import { renderLineNumbers } from './lineNumbers.js';
import { copyResultToClipboard } from './copyResultToClipboard.js';

function getModeName(mode: KeyMode): 'duuri' | 'molli' {
  return mode === 'major' ? 'duuri' : 'molli';
}

/** Luo sovelluksen ensimmäisen käyttöliittymärungon. */
export function initializeUi(root: HTMLElement | null): void {
  if (root === null) {
    throw new Error("Käyttöliittymän juurielementtiä ei löytynyt");
  }

  root.innerHTML = `
    <header class="page-header">
      <p class="eyebrow">Musiikin työkalut</p>
      <h1>Muuta sävellajia</h1>
      <p class="intro">
        Kirjoita tai liitä sanat, soinnut ja sävelet editoriin.
        Rivinvaihdot sekä lihavointi ja kursivointi säilyvät.
      </p>
    </header>

    <section class="workspace" aria-labelledby="music-editor-title">
      <div class="section-heading">
        <div>
          <h2 id="music-editor-title">Musiikki ja sanat</h2>
          <p>Merkitse musiikkirivien tahdit putkimerkillä |.</p>
        </div>
      </div>

      <div class="workspace-layout">
      <section class="transposition-panel" aria-labelledby="transposition-title">
        <div class="panel-heading">
          <div>
            <p class="step-label">Transponoinnin asetukset</p>
            <h3 id="transposition-title">Valitse lähtösävellaji</h3>
          </div>
        </div>

        <div class="setting-grid">
          <fieldset class="setting-field">
            <legend><span>1</span> Sävellajin laatu</legend>
            <div class="segmented-control">
              <label>
                <input type="radio" name="key-mode" value="major" />
                <span>Duuri</span>
              </label>
              <label>
                <input type="radio" name="key-mode" value="minor" />
                <span>Molli</span>
              </label>
            </div>
          </fieldset>

          <div class="setting-field">
            <label for="source-key"><span>2</span> Lähtösävellaji</label>
            <select id="source-key" disabled>
              <option value="">Valitse ensin duuri tai molli</option>
            </select>
            <small>Lista muodostuu duuri- tai mollivalinnan perusteella.</small>
          </div>

          <div class="setting-field">
            <label for="transpose-step"><span>3</span> Puolisävelaskeleet</label>
            <input id="transpose-step" type="number" min="-11" max="11" value="0" />
            <small>Valitse kokonaisluku väliltä −11–11.</small>
          </div>
        </div>

        <div id="enharmonic-choice" class="enharmonic-choice" hidden>
          <p class="step-label">Valitse kirjoitusasu</p>
          <h3>Kumpaa kohdesävellajia käytetään?</h3>
          <p>Vaihtoehdot näytetään tässä vain silloin, kun molemmat ovat käyttökelpoisia.</p>
        </div>

        <div class="transpose-actions">
          <p id='target-key-preview' aria-live='polite' hidden></p>
          <p>Vahvistamisen jälkeen mahdollinen lisävalinta avautuu tähän.</p>
          <button type="button" disabled>Transponoi</button>
        </div>
      </section>

      <div class="workspace-content">
      <div class="view-switcher" aria-label="Valitse näytettävä näkymä">
        <button id="show-input" type="button" aria-pressed="true">Syöte</button>
        <button id="show-result" type="button" aria-pressed="false" disabled>Tulos</button>
      </div>

      <div class="editor-result-grid">
      <div id="input-editor-pane" class="input-editor-pane">
      <div class="editor-with-line-numbers">
        <div id="line-number-gutter" class="line-number-gutter" aria-hidden="true"></div>
        <div
          id="music-input"
          class="rich-editor"
          contenteditable="true"
          role="textbox"
          aria-label="Tahdistetut soinnut, sävelet ja laulun sanat"
          aria-multiline="true"
          data-placeholder="| C | Am | F | G |&#10;Laulun sanat omalle rivilleen"
          spellcheck="true"
        ></div>
      </div>

      <p class="editor-help">
        Voit käyttää editorissa esimerkiksi näppäinyhdistelmiä
        <kbd>Ctrl</kbd> + <kbd>B</kbd> ja <kbd>Ctrl</kbd> + <kbd>I</kbd>.
      </p>
      </div>

      <section id="transposition-result" hidden>
        <h2>Transponoitu tulos</h2>
        <div
          id="music-result"
          class="rich-editor result-editor"
          contenteditable="false"
          role="textbox"
          aria-readonly="true"
          aria-label="Transponoitu tulos"
        ></div>
        <div id="result-warnings"></div>
        <button id="copy-result" type="button" disabled>Kopioi tulos</button>
        <p id="copy-status" aria-live="polite"></p>
      </section>
      </div>
      </div>
      </div>
    </section>

    <section class="chord-tool" aria-labelledby="chord-tool-title">
      <div>
        <h2 id="chord-tool-title">Soinnun sävelet</h2>
        <p>Syötä myöhemmin sointu nähdäksesi siihen kuuluvat sävelet.</p>
      </div>
      <div class="chord-controls">
        <label class="visually-hidden" for="chord-input">Sointu</label>
        <input id="chord-input" type="text" placeholder="Esim. Cmaj7" disabled />
        <button type="button" disabled>Näytä sävelet</button>
      </div>
    </section>
  `;

  if (typeof root.querySelector !== 'function') {
    return;
  }

  const majorChoice = root.querySelector<HTMLInputElement>(
    'input[name=key-mode][value=major]',
  );
  const minorChoice = root.querySelector<HTMLInputElement>(
    'input[name=key-mode][value=minor]',
  );
  const sourceKey = root.querySelector<HTMLSelectElement>('#source-key');
  const stepInput =
    root.querySelector<HTMLInputElement>('#transpose-step');
  const targetKeyPreview =
    root.querySelector<HTMLElement>('#target-key-preview');
  const enharmonicChoice =
    root.querySelector<HTMLElement>('#enharmonic-choice');
  const transposeActions =
    root.querySelector<HTMLElement>('.transpose-actions');
  const transposeButton =
    root.querySelector<HTMLButtonElement>('.transpose-actions button');
  const musicInput = root.querySelector<HTMLElement>('#music-input');
  const inputPane = root.querySelector<HTMLElement>('#input-editor-pane');
  const resultArea = root.querySelector<HTMLElement>('#transposition-result');
  const inputViewButton = root.querySelector<HTMLButtonElement>('#show-input');
  const resultViewButton = root.querySelector<HTMLButtonElement>('#show-result');
  const musicResult = root.querySelector<HTMLElement>('#music-result');
  const resultWarnings = root.querySelector<HTMLElement>('#result-warnings');
  const copyButton = root.querySelector<HTMLButtonElement>('#copy-result');
  const copyStatus = root.querySelector<HTMLElement>('#copy-status');
  let currentPresentation: TranspositionPresentation | undefined;
  const lineNumberGutter = root.querySelector<HTMLElement>('#line-number-gutter');
  const transpositionError = document.createElement('p');
  transpositionError.id = 'transposition-error';
  transpositionError.setAttribute('role', 'alert');
  transpositionError.hidden = true;
  transposeActions?.prepend(transpositionError);

  musicInput?.addEventListener('scroll', () => {
    if (lineNumberGutter !== null) lineNumberGutter.scrollTop = musicInput.scrollTop;
  });
  musicInput?.addEventListener('input', () => {
    if (lineNumberGutter !== null) {
      lineNumberGutter.textContent = renderLineNumbers(musicInput.textContent ?? '').join('\n');
    }
  });
  if (lineNumberGutter !== null) lineNumberGutter.textContent = '1';

  if (transposeButton !== null) {
    transposeButton.disabled = false;
  }

  const showView = (view: 'input' | 'result'): void => {
    const showInput = view === 'input';
    if (inputPane) inputPane.hidden = !showInput;
    if (resultArea) resultArea.hidden = showInput;
    inputViewButton?.setAttribute('aria-pressed', String(showInput));
    resultViewButton?.setAttribute('aria-pressed', String(!showInput));
  };

  inputViewButton?.addEventListener('click', () => showView('input'));
  resultViewButton?.addEventListener('click', () => showView('result'));

  const clearResult = (): void => {
    currentPresentation = undefined;
    showView('input');
    if (resultViewButton) resultViewButton.disabled = true;
    if (musicResult) musicResult.innerHTML = '';
    if (resultWarnings) resultWarnings.replaceChildren();
    if (copyButton) copyButton.disabled = true;
    if (copyStatus) {
      copyStatus.textContent = '';
      copyStatus.removeAttribute('role');
    }
  };

  const updateTargetKeyPreview = (): void => {
    if (
      sourceKey === null ||
      stepInput === null ||
      targetKeyPreview === null ||
      enharmonicChoice === null
    ) {
      return;
    }

    targetKeyPreview.hidden = true;
    targetKeyPreview.textContent = '';
    enharmonicChoice.hidden = true;
    enharmonicChoice.replaceChildren();

    const mode = root.querySelector<HTMLInputElement>(
      'input[name=key-mode]:checked',
    )?.value;
    const step = Number(stepInput.value);

    if (
      (mode !== 'major' && mode !== 'minor') ||
      sourceKey.value === '' ||
      !Number.isInteger(step) ||
      step < -11 ||
      step > 11
    ) {
      return;
    }

    const result = resolveTranspositionSettings({
      mode,
      sourceTonic: sourceKey.value,
      step,
    });

    if (result.status === 'ready') {
      const modeName = getModeName(result.mode);
      targetKeyPreview.textContent =
        `Kohdesävellaji: ${result.targetTonic}-${modeName}`;
      targetKeyPreview.hidden = false;
      return;
    }

    const modeName = getModeName(result.mode);
    const choices = result.options.map((tonic) => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'enharmonic-choice';
      input.value = tonic;
      label.append(input, `${tonic}-${modeName}`);
      input.addEventListener('click', () => {
        const confirmed = resolveTranspositionSettings({
          mode: result.mode,
          sourceTonic: result.sourceTonic,
          step: result.step,
          targetTonicChoice: tonic,
        });
        if (confirmed.status === 'ready') {
          targetKeyPreview.textContent =
            `Kohdesävellaji: ${confirmed.targetTonic}-${modeName}`;
          targetKeyPreview.hidden = false;
          enharmonicChoice.hidden = true;
        }
      });
      return label;
    });

    enharmonicChoice.replaceChildren(...choices);
    enharmonicChoice.hidden = false;
  };

  const selectMode = (mode: KeyMode): void => {
    if (sourceKey === null) {
      return;
    }

    const options = getAvailableTonics(mode).map((tonic) => {
      const option = document.createElement('option');
      option.value = tonic;
      option.textContent = tonic;
      return option;
    });

    sourceKey.replaceChildren(...options);
    sourceKey.selectedIndex = -1;
    sourceKey.disabled = false;
    updateTargetKeyPreview();
  };

  majorChoice?.addEventListener('click', () => selectMode('major'));
  minorChoice?.addEventListener('click', () => selectMode('minor'));

  sourceKey?.addEventListener('change', updateTargetKeyPreview);
  stepInput?.addEventListener('input', updateTargetKeyPreview);
  transposeButton?.addEventListener('click', () => {
    if (sourceKey === null) {
      return;
    }

    transpositionError.hidden = true;
    transpositionError.textContent = '';
    if (copyStatus) copyStatus.textContent = '';

    const mode = root.querySelector<HTMLInputElement>(
      'input[name=key-mode]:checked',
    )?.value;

    if (mode !== 'major' && mode !== 'minor') {
      clearResult();
      transpositionError.textContent = 'Valitse duuri tai molli';
      transpositionError.hidden = false;
      return;
    }

    if (sourceKey.value === '') {
      clearResult();
      transpositionError.textContent = 'Valitse lähtösävellaji';
      transpositionError.hidden = false;
      return;
    }

    const step = Number(stepInput?.value);
    const targetTonicChoice = root.querySelector<HTMLInputElement>(
      'input[name=enharmonic-choice]:checked',
    )?.value;
    const settings = resolveTranspositionSettings({
      mode,
      sourceTonic: sourceKey.value,
      step,
      ...(targetTonicChoice === undefined ? {} : { targetTonicChoice }),
    });
    if (settings.status !== 'ready') {
      clearResult();
      transpositionError.textContent = 'Valitse kohdesävellajin kirjoitusasu';
      transpositionError.hidden = false;
      return;
    }
    try {
      const presentation: TranspositionPresentation = createTranspositionResult(
        musicInput?.innerHTML ?? '',
        settings,
      );
      currentPresentation = presentation;
      if (musicResult) musicResult.innerHTML = presentation.html;
      if (resultWarnings) resultWarnings.replaceChildren(...presentation.warnings.map((warning) => {
        const item = document.createElement('p');
        item.textContent = warning;
        return item;
      }));
      if (resultViewButton) resultViewButton.disabled = false;
      showView('result');
      if (copyButton) copyButton.disabled = false;
      if (copyStatus) copyStatus.textContent = '';
    } catch (error) {
      clearResult();
      transpositionError.textContent = error instanceof Error ? error.message : String(error);
      transpositionError.hidden = false;
    }
  });

  copyButton?.addEventListener('click', async () => {
    if (!currentPresentation || !copyStatus) return;
    copyStatus.textContent = '';
    copyStatus.removeAttribute('role');
    try {
      await copyResultToClipboard(currentPresentation, {
        write: (items) => navigator.clipboard.write([...items]),
      });
      copyStatus.textContent = 'Tulos kopioitu';
      copyStatus.setAttribute('role', 'status');
    } catch {
      copyStatus.textContent = 'Tuloksen kopiointi epäonnistui';
      copyStatus.setAttribute('role', 'alert');
    }
  });
}
