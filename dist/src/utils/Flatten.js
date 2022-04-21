export function flattenHierarchy(meta) {
    const result = [];
    _recursiveFlattenHierarchy(meta, "", result);
    return result;
}
export function _recursiveFlattenHierarchy(meta, root, result) {
    for (let key of Object.keys(meta)) {
        const path = root.length > 0 ? `${root}.${key}` : key;
        if (typeof meta[key] === "object" && !Array.isArray(meta[key])) {
            _recursiveFlattenHierarchy(meta[key], path, result);
        }
        else {
            result.push({
                path,
                value: meta[key]
            });
        }
    }
}
//# sourceMappingURL=Flatten.js.map