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

      <div class="transpose-controls" aria-label="Transponoinnin asetukset">
        <label for="transpose-step">Askel</label>
        <input id="transpose-step" type="number" min="-12" max="12" value="0" />
        <button type="button" disabled>Transponoi</button>
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
}
