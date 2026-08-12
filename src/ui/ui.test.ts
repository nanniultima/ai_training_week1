import { describe, expect, it } from "vitest";

import { initializeUi } from "./ui.js";

describe("initializeUi", () => {
  it("luo muotoiluja tukevan editorin", () => {
    const root = { innerHTML: "" } as unknown as HTMLElement;

    initializeUi(root);

    expect(root.innerHTML).toContain('contenteditable="true"');
    expect(root.innerHTML).toContain('aria-multiline="true"');
  });

  it("hylkää puuttuvan juurielementin", () => {
    expect(() => initializeUi(null)).toThrow(
      "Käyttöliittymän juurielementtiä ei löytynyt",
    );
  });
});
