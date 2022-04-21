"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._recursiveFlattenHierarchy = exports.flattenHierarchy = void 0;
function flattenHierarchy(meta) {
    const result = [];
    _recursiveFlattenHierarchy(meta, "", result);
    return result;
}
exports.flattenHierarchy = flattenHierarchy;
function _recursiveFlattenHierarchy(meta, root, result) {
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
exports._recursiveFlattenHierarchy = _recursiveFlattenHierarchy;
//# sourceMappingURL=Flatten.js.map