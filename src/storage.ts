import type { MusicRecord } from "./types.js";

export interface MusicStorage {
  save(record: MusicRecord): void;
  findById(id: string): MusicRecord | undefined;
  getAll(): readonly MusicRecord[];
}

/** Muistinvaraisen tallennuksen myöhemmin toteutettava rajapinta. */
export class InMemoryMusicStorage implements MusicStorage {
  public save(_record: MusicRecord): void {
    throw new Error("not implemented");
  }

  public findById(_id: string): MusicRecord | undefined {
    throw new Error("not implemented");
  }

  public getAll(): readonly MusicRecord[] {
    throw new Error("not implemented");
  }
}
