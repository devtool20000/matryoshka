"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateArray = exports.generateObject = void 0;
const ObjectUpdater_1 = require("./ObjectUpdater");
const Flatten_1 = require("../utils/Flatten");
const lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
const DeepOperation_1 = require("../utils/DeepOperation");
function generateObject(template, skip = 0, sizeMap = {}, variablesMap = {}) {
    let updateUnits = (0, Flatten_1.flattenHierarchy)(template);
    const result = {};
    updateUnits = _replaceSizeVariables(updateUnits, sizeMap);
    const updateFns = updateUnits.map((x) => {
        return (0, ObjectUpdater_1.normalizeUpdateUnitValue)(x, variablesMap);
    });
    for (let updateFn of updateFns) {
        (0, DeepOperation_1.deepSet)(result, updateFn.path, updateFn.generatorFactory(skip));
    }
    return result;
}
exports.generateObject = generateObject;
function generateArray(template, arraySize = 2, skip = 0, sizeMap = {}, variables = {}) {
    const generateTemplate = {
        [`root[+${arraySize}]`]: template
    };
    const rawResult = generateObject(generateTemplate, skip, sizeMap, variables);
    return rawResult["root"];
}
exports.generateArray = generateArray;
function _replaceSizeVariables(updateUnits, size) {
    if (Object.keys(size).length === 0) {
        return updateUnits;
    }
    const _updateUnits = (0, lodash_clonedeep_1.default)(updateUnits);
    for (let unit of _updateUnits) {
        for (let variableName of Object.keys(size)) {
            const variableValue = size[variableName];
            unit.path = unit.path.replace(`[+${variableName}]`, `[+${variableValue}]`);
        }
    }
    return _updateUnits;
}
//# sourceMappingURL=ObjectGenerator.js.map