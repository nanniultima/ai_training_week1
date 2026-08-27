export function formattingToRegister(formatting: { readonly bold: boolean; readonly italic: boolean }): 1 | 2 | 3 | 4 {
  if (formatting.bold) return formatting.italic ? 1 : 2;
  return formatting.italic ? 4 : 3;
}
export function registerToFormatting(register: number): { readonly bold: boolean; readonly italic: boolean } {
  if (!Number.isInteger(register) || register < 1 || register > 4) throw new Error('Rekisterin pitää olla kokonaisluku väliltä 1–4');
  return [{ bold: true, italic: true }, { bold: true, italic: false }, { bold: false, italic: false }, { bold: false, italic: true }][register - 1]!;
}
