import { getAvailableTonics } from '../logic/transpositionSettings.js';

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
        <span class="status-badge">Luonnos</span>
      </div>

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

      <p class="editor-help">
        Voit käyttää editorissa esimerkiksi näppäinyhdistelmiä
        <kbd>Ctrl</kbd> + <kbd>B</kbd> ja <kbd>Ctrl</kbd> + <kbd>I</kbd>.
      </p>

      <section class="transposition-panel" aria-labelledby="transposition-title">
        <div class="panel-heading">
          <div>
            <p class="step-label">Transponoinnin asetukset</p>
            <h3 id="transposition-title">Valitse lähtösävellaji</h3>
          </div>
          <p class="coming-soon">Toiminto tulossa</p>
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
          <p>Vahvistamisen jälkeen mahdollinen lisävalinta avautuu tähän.</p>
          <button type="button" disabled>Transponoi</button>
        </div>
      </section>
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

  majorChoice?.addEventListener('click', () => {
    if (sourceKey === null) {
      return;
    }

    const options = getAvailableTonics('major').map((tonic) => {
      const option = document.createElement('option');
      option.value = tonic;
      option.textContent = tonic;
      return option;
    });

    sourceKey.replaceChildren(...options);
    sourceKey.disabled = false;
  });

  minorChoice?.addEventListener('click', () => {
    if (sourceKey === null) {
      return;
    }

    const options = getAvailableTonics('minor').map((tonic) => {
      const option = document.createElement('option');
      option.value = tonic;
      option.textContent = tonic;
      return option;
    });

    sourceKey.replaceChildren(...options);
    sourceKey.selectedIndex = -1;
    sourceKey.disabled = false;
  });
}
