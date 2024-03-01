import type { I18nRawDataKeysGroup } from "../types.js";

export function getNoteKey(lang: string, fileName: string, key: string) {
  return `${lang}:${fileName}:${key}`;
}

export function getNotesHash(data: I18nRawDataKeysGroup) {
  const notes: Record<string, string> = {};

  for (const keyset of Object.values(data)) {
    for (const [key, rawKeyData] of Object.entries(keyset)) {
      for (const [fileName, fileData] of Object.entries(rawKeyData.files)) {
        if (!fileData.notes) {
          continue;
        }

        for (const [lang, note] of Object.entries(fileData.notes)) {
          const hashKey = getNoteKey(lang, fileName, key);
          notes[hashKey] = note;
        }
      }
    }
  }

  return notes;
}
