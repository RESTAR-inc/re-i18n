export function sortKeyset(target) {
    const keys = Object.keys(target);
    keys.sort();
    const result = {};
    for (const key of keys) {
        result[key] = target[key];
    }
    return result;
}
//# sourceMappingURL=common.js.map