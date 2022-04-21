import { normalizeUpdateUnitValue } from "./ObjectUpdater";
import { flattenHierarchy } from "../utils/Flatten";
import clonedeep from 'lodash.clonedeep';
import { deepSet } from "../utils/DeepOperation";
export function generateObject(template, skip = 0, sizeMap = {}, variablesMap = {}) {
    let updateUnits = flattenHierarchy(template);
    const result = {};
    updateUnits = _replaceSizeVariables(updateUnits, sizeMap);
    const updateFns = updateUnits.map((x) => {
        return normalizeUpdateUnitValue(x, variablesMap);
    });
    for (let updateFn of updateFns) {
        deepSet(result, updateFn.path, updateFn.generatorFactory(skip));
    }
    return result;
}
export function generateArray(template, arraySize = 2, skip = 0, sizeMap = {}, variables = {}) {
    const generateTemplate = {
        [`root[+${arraySize}]`]: template
    };
    const rawResult = generateObject(generateTemplate, skip, sizeMap, variables);
    return rawResult["root"];
}
function _replaceSizeVariables(updateUnits, size) {
    if (Object.keys(size).length === 0) {
        return updateUnits;
    }
    const _updateUnits = clonedeep(updateUnits);
    for (let unit of _updateUnits) {
        for (let variableName of Object.keys(size)) {
            const variableValue = size[variableName];
            unit.path = unit.path.replace(`[+${variableName}]`, `[+${variableValue}]`);
        }
    }
    return _updateUnits;
}
//# sourceMappingURL=ObjectGenerator.js.map