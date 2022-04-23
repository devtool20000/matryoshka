"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeUpdateUnitValue = exports.Update = exports.Move = exports.Rename = exports.Remove = exports.Add = exports.updateObject = exports.RenameUpdater = exports.MoveUpdater = exports.RemoveUpdater = exports.UpdateUpdater = exports.AddUpdater = void 0;
const MockGenerator_1 = require("./MockGenerator");
const DeepOperation_1 = require("../utils/DeepOperation");
const Flatten_1 = require("../utils/Flatten");
class GeneralUpdater {
    constructor(meta) {
        this.updateUnits = [];
        if (meta) {
            this.updateUnits = (0, Flatten_1.flattenHierarchy)(meta);
        }
    }
    updateObject(obj, skip = 0) {
        throw new Error("unimplemented");
    }
}
class AddUpdater extends GeneralUpdater {
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
            (0, DeepOperation_1.deepSet)(obj, updateFn.path, updateFn.generatorFactory(skip));
        }
    }
}
exports.AddUpdater = AddUpdater;
// TODO: make updateUpdater simple for now, just allow user to update the value according to current value. (This can't track fields accurately)
class UpdateUpdater extends GeneralUpdater {
    updateObject(obj, skip = 0) {
        for (let updateFn of this.updateUnits) {
            const oldValue = (0, DeepOperation_1.deepGet)(obj, updateFn.path);
            if (typeof updateFn.value === "function") {
                const fn = updateFn.value;
                if (Array.isArray(oldValue)) {
                    (0, DeepOperation_1.deepSet)(obj, updateFn.path, (0, MockGenerator_1.constantValues)(...oldValue.map(x => fn(x)))(0));
                }
                else {
                    (0, DeepOperation_1.deepSet)(obj, updateFn.path, fn(oldValue));
                }
            }
            else {
                if (Array.isArray(oldValue)) {
                    (0, DeepOperation_1.deepSet)(obj, updateFn.path, (0, MockGenerator_1.constantValues)(updateFn.value)(0));
                }
                else {
                    (0, DeepOperation_1.deepSet)(obj, updateFn.path, updateFn.value);
                }
            }
        }
    }
}
exports.UpdateUpdater = UpdateUpdater;
class RemoveUpdater extends GeneralUpdater {
    updateObject(obj, skip = 0) {
        for (let updateFn of this.updateUnits) {
            if (updateFn.value) {
                (0, DeepOperation_1.deepSet)(obj, updateFn.path, undefined);
            }
        }
    }
}
exports.RemoveUpdater = RemoveUpdater;
class MoveUpdater extends GeneralUpdater {
    updateObject(obj, skip = 0) {
        for (let updateFn of this.updateUnits) {
            if (typeof updateFn.value === "string") {
                const newPath = updateFn.value;
                let existingValues = (0, DeepOperation_1.deepGet)(obj, updateFn.path);
                existingValues = Array.isArray(existingValues) ? existingValues : [existingValues];
                (0, DeepOperation_1.deepSet)(obj, newPath, ((0, MockGenerator_1.constantValues)(...existingValues))(0));
                (0, DeepOperation_1.deepSet)(obj, updateFn.path, undefined);
            }
        }
    }
}
exports.MoveUpdater = MoveUpdater;
class RenameUpdater extends GeneralUpdater {
    updateObject(obj, skip = 0) {
        for (let updateFn of this.updateUnits) {
            if (typeof updateFn.value === "string") {
                const newField = updateFn.value;
                const existingPath = updateFn.path;
                const index = existingPath.lastIndexOf(".");
                const newPath = existingPath.substring(0, index) + "." + newField;
                let existingValues = (0, DeepOperation_1.deepGet)(obj, updateFn.path);
                if (!Array.isArray(existingValues)) {
                    existingValues = [existingValues];
                }
                (0, DeepOperation_1.deepSet)(obj, newPath, (0, MockGenerator_1.constantValues)(...existingValues)(0));
                (0, DeepOperation_1.deepSet)(obj, updateFn.path, undefined);
            }
        }
    }
}
exports.RenameUpdater = RenameUpdater;
function updateObject(...objs) {
    let obj = objs[0];
    let skip = 0;
    let updates = objs.slice(1);
    if (typeof objs[1] === "number") {
        skip = objs[1];
        updates = objs.slice(2);
    }
    for (let updateFn of updates) {
        obj = updateFn(obj, skip);
    }
    return obj;
}
exports.updateObject = updateObject;
function Add(jsonTemplate, value) {
    let template = jsonTemplate;
    if (typeof jsonTemplate === "string") {
        template = {
            [jsonTemplate]: value
        };
    }
    return (obj, skip) => {
        if (!skip) {
            skip = 0;
        }
        new AddUpdater(template).updateObject(obj, skip);
        return obj;
    };
}
exports.Add = Add;
function Remove(...jsonTemplate) {
    let template = jsonTemplate;
    if (Array.isArray(jsonTemplate) && typeof jsonTemplate[0] === "string") {
        template = {};
        for (let fieldToRemove of jsonTemplate) {
            template[fieldToRemove] = true;
        }
    }
    else {
        template = template[0];
    }
    return (obj, skip) => {
        if (!skip) {
            skip = 0;
        }
        new RemoveUpdater(template).updateObject(obj, skip);
        return obj;
    };
}
exports.Remove = Remove;
function Rename(jsonTemplate, value) {
    let template = jsonTemplate;
    if (typeof jsonTemplate === "string") {
        template = {
            [jsonTemplate]: value
        };
    }
    return (obj, skip) => {
        if (!skip) {
            skip = 0;
        }
        new RenameUpdater(template).updateObject(obj, skip);
        return obj;
    };
}
exports.Rename = Rename;
function Move(jsonTemplate, value) {
    let template = jsonTemplate;
    if (typeof jsonTemplate === "string") {
        template = {
            [jsonTemplate]: value
        };
    }
    return (obj, skip) => {
        if (!skip) {
            skip = 0;
        }
        new MoveUpdater(template).updateObject(obj, skip);
        return obj;
    };
}
exports.Move = Move;
function Update(jsonTemplate, value) {
    let template = jsonTemplate;
    if (typeof jsonTemplate === "string") {
        template = {
            [jsonTemplate]: value
        };
    }
    return (obj, skip) => {
        if (!skip) {
            skip = 0;
        }
        new UpdateUpdater(template).updateObject(obj, skip);
        return obj;
    };
}
exports.Update = Update;
function normalizeUpdateUnitValue(updateUnit, variables = {}) {
    // TODO: this is a ugly fix which avoid issue in generate template
    // we use this to detect const value with variable
    if (typeof updateUnit.value === "string" && (0, MockGenerator_1.hasVariable)(updateUnit.value)) {
        const value = updateUnit.value;
        updateUnit.value = (0, MockGenerator_1.values)(value);
    }
    if (typeof updateUnit.value === "function") {
        // VariableGeneratorFactory
        if (updateUnit.value.$type === MockGenerator_1.GeneratorType.variableGenerator) {
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
                generatorFactory: (0, MockGenerator_1.constantValues)(updateUnit.value)
            };
        }
    }
    // primitive values
    else {
        return {
            path: updateUnit.path,
            generatorFactory: (0, MockGenerator_1.values)(updateUnit.value)
        };
    }
    return updateUnit; // we will never reach here
}
exports.normalizeUpdateUnitValue = normalizeUpdateUnitValue;
//# sourceMappingURL=ObjectUpdater.js.map