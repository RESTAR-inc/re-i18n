export function sortKeyset(target) {
    const keys = Object.keys(target);
    keys.sort();
    const result = {};
    for (const key of keys) {
        result[key] = target[key];
    }
    return result;
}
const strReplacements = {
    "\\\\": "\\",
    "\\n": "\n",
    "\\t": "\t",
    "\\r": "\r",
};
export function normalizeKey(key) {
    return key.replace(/\\(\\|n|t|r|")/g, (replace) => strReplacements[replace]);
}
//# sourceMappingURL=common.js.map