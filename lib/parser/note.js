export function getNoteKey(lang, fileName, key) {
    return `${lang}:${fileName}:${key}`;
}
export function getNotesHash(data) {
    const notes = {};
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
//# sourceMappingURL=note.js.map