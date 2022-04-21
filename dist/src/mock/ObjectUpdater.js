import { constantValues, GeneratorType, values, hasVariable } from "./MockGenerator";
import { deepGet, deepSet } from "../utils/DeepOperation";
import { flattenHierarchy } from "../utils/Flatten";
class GeneralUpdater {
    constructor(meta) {
        this.updateUnits = [];
        if (meta) {
            this.updateUnits = flattenHierarchy(meta);
        }
    }
    updateObject(obj, skip = 0) {
        throw new Error("unimplemented");
    }
}
export class AddUpdater extends GeneralUpdater {
    constructor(meta) {
        super(meta);
        this.updateFns = [];
        for (let updateUnit of this.updateUnits) {
            // TODO: currently we use function parameter count to distinguish GenerateValueFactory and GeneratorFactory, better to use other method so when we add new elements, it won't break
            this.updateFns.push(normalizeUpdateUnitValue(updateUnit));
        }
    }
    updateObject(obj, skip = 0) {
        for (let updateFn of this.updateFns) {
            deepSet(obj, updateFn.path, updateFn.generatorFactory(skip));
        }
    }
}
// TODO: make updateUpdater simple for now, just allow user to update the value according to current value. (This can't track fields accurately)
export class UpdateUpdater extends GeneralUpdater {
    updateObject(obj, skip = 0) {
        for (let updateFn of this.updateUnits) {
            const oldValue = deepGet(obj, updateFn.path);
            if (typeof updateFn.value === "function") {
                const fn = updateFn.value;
                if (Array.isArray(oldValue)) {
                    deepSet(obj, updateFn.path, constantValues(...oldValue.map(x => fn(x)))(0));
                }
                else {
                    deepSet(obj, updateFn.path, fn(oldValue));
                }
            }
            else {
                if (Array.isArray(oldValue)) {
                    deepSet(obj, updateFn.path, constantValues(updateFn.value)(0));
                }
                else {
                    deepSet(obj, updateFn.path, updateFn.value);
                }
            }
        }
    }
}
export class RemoveUpdater extends GeneralUpdater {
    updateObject(obj, skip = 0) {
        for (let updateFn of this.updateUnits) {
            if (updateFn.value) {
                deepSet(obj, updateFn.path, undefined);
            }
        }
    }
}
export class MoveUpdater extends GeneralUpdater {
    updateObject(obj, skip = 0) {
        for (let updateFn of this.updateUnits) {
            if (typeof updateFn.value === "string") {
                const newPath = updateFn.value;
                const existingValues = deepGet(obj, updateFn.path);
                deepSet(obj, newPath, (constantValues(...existingValues))(0));
                deepSet(obj, updateFn.path, undefined);
            }
        }
    }
}
export class RenameUpdater extends GeneralUpdater {
    updateObject(obj, skip = 0) {
        for (let updateFn of this.updateUnits) {
            if (typeof updateFn.value === "string") {
                const newField = updateFn.value;
                const existingPath = updateFn.path;
                const index = existingPath.lastIndexOf(".");
                const newPath = existingPath.substring(0, index) + "." + newField;
                let existingValues = deepGet(obj, updateFn.path);
                if (!Array.isArray(existingValues)) {
                    existingValues = [existingValues];
                }
                deepSet(obj, newPath, constantValues(...existingValues)(0));
                deepSet(obj, updateFn.path, undefined);
            }
        }
    }
}
export function updateObject(obj, toUpdate, skip = 0) {
    new RenameUpdater(toUpdate.rename).updateObject(obj, skip);
    new MoveUpdater(toUpdate.move).updateObject(obj, skip);
    new RemoveUpdater(toUpdate.remove).updateObject(obj, skip);
    new AddUpdater(toUpdate.add).updateObject(obj, skip);
    new UpdateUpdater(toUpdate.update).updateObject(obj, skip);
}
export function normalizeUpdateUnitValue(updateUnit, variables = {}) {
    // TODO: this is a ugly fix which avoid issue in generate template
    // we use this to detect const value with variable
    if (typeof updateUnit.value === "string" && hasVariable(updateUnit.value)) {
        const value = updateUnit.value;
        updateUnit.value = values(value);
    }
    if (typeof updateUnit.value === "function") {
        // VariableGeneratorFactory
        if (updateUnit.value.$type === GeneratorType.variableGenerator) {
            return {
                path: updateUnit.path,
                generatorFactory: updateUnit.value(variables)
            };
        }
        // GeneratorFactory
        else if (updateUnit.value.length === 1) {
            return {
                path: updateUnit.path,
                generatorFactory: updateUnit.value
            };
        }
        // GenerateValueFactory
        else if (updateUnit.value.length === 0) {
            return {
                path: updateUnit.path,
                generatorFactory: constantValues(updateUnit.value)
            };
        }
    }
    // primitive values
    else {
        return {
            path: updateUnit.path,
            generatorFactory: values(updateUnit.value)
        };
    }
    return updateUnit; // we will never reach here
}
//# sourceMappingURL=ObjectUpdater.js.map