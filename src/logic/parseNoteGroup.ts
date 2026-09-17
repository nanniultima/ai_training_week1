export function parseNoteGroup(group: string): readonly string[] {
  if (group.length === 0) throw new Error('Sävelryhmä ei saa olla tyhjä');
  const notes: string[] = [];
  let index = 0;
  while (index < group.length) {
    const letter = group[index];
    if (letter === undefined || !/[A-GHa-gh]/.test(letter)) {
      throw new Error(`Virheellinen sävelryhmä: ${group}`);
    }
    const normalizedLetter = letter.toUpperCase() === 'H' ? 'B' : letter.toUpperCase();
    const next = group[index + 1];
    const accidental = next === '#' || next === 'b' ? next : '';
    const following = group[index + 2];
    if (
      accidental !== ''
      && (following === '#' || (accidental === 'b' && following === 'b'))
    ) {
      throw new Error(`Virheellinen sävelryhmä: ${group}`);
    }
    notes.push(`${normalizedLetter}${accidental}`);
    index += accidental === '' ? 1 : 2;
  }
  return notes;
}
