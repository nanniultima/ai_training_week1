import { describe, expect, it } from "vitest";

import { initializeUi } from "./ui.js";

describe("initializeUi", () => {
  it("luo muotoiluja tukevan editorin", () => {
    const root = { innerHTML: "" } as unknown as HTMLElement;

    initializeUi(root);

    expect(root.innerHTML).toContain('contenteditable="true"');
    expect(root.innerHTML).toContain('aria-multiline="true"');
  });

  it("luo transponointiasetusten käyttöliittymärungon", () => {
    const root = { innerHTML: "" } as unknown as HTMLElement;

    initializeUi(root);

    expect(root.innerHTML).toContain('name="key-mode" value="major"');
    expect(root.innerHTML).toContain('name="key-mode" value="minor"');
    expect(root.innerHTML).toContain('id="source-key" disabled');
    expect(root.innerHTML).toContain('min="-11" max="11" value="0"');
    expect(root.innerHTML).toContain(
      'id="enharmonic-choice" class="enharmonic-choice" hidden',
    );
    expect(root.innerHTML).toContain("Valitse ensin duuri tai molli");
  });

  it("hylkää puuttuvan juurielementin", () => {
    expect(() => initializeUi(null)).toThrow(
      "Käyttöliittymän juurielementtiä ei löytynyt",
    );
  });
});
