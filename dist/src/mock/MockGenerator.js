"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasVariable = exports.GeneratorType = exports.values = exports.constantValues = exports.MockGenerator = void 0;
const lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
class MockGenerator {
    constructor(values = [], generateValueFactory = null) {
        this.values = [];
        this.values = values;
        this.generateValueFactory = generateValueFactory;
        if (!generateValueFactory && values.length == 0) {
            throw new Error(`both generatorFactory and values are empty. Can't generate any values`);
        }
        if (!generateValueFactory) {
            this.generatorFactory = this.createLoopValuesGeneratorFactory();
        }
        else {
            this.generatorFactory = this.createFirstValuesWithFollowingGeneratorFactory();
        }
    }
    createFirstValuesWithFollowingGeneratorFactory() {
        const values = this.values;
        const generateValueFactory = this.generateValueFactory;
        return function (skip) {
            let counter = 0;
            let generateValueFn = generateValueFactory();
            function* generator() {
                for (let value of values) {
                    if (counter >= skip) {
                        yield value;
                    }
                    counter++;
                }
                while (true) {
                    let value = generateValueFn();
                    if (counter >= skip) {
                        yield value;
                    }
                    counter++;
                }
            }
            return generator();
        };
    }
    createLoopValuesGeneratorFactory() {
        let values = this.values;
        return function (skip) {
            let counter = 0;
            function* generator() {
                while (true) {
                    for (let value of values) {
                        if (counter >= skip) {
                            yield value;
                        }
                        counter++;
                    }
                }
            }
            return generator();
        };
    }
}
exports.MockGenerator = MockGenerator;
function constantValues(...values) {
    if (values.length === 0) {
        throw new Error(`values can't be empty array`);
    }
    const generator = values[values.length - 1];
    if (typeof generator === "function") {
        const hardCodeValues = values.splice(0, values.length - 1);
        return new MockGenerator(hardCodeValues, generator).generatorFactory;
    }
    else {
        return new MockGenerator(values, null).generatorFactory;
    }
}
exports.constantValues = constantValues;
function values(...values) {
    if (values.length === 0) {
        throw new Error(`values can't be empty array`);
    }
    const generator = values[values.length - 1];
    const hardCodeValues = typeof generator === "function" ? values.splice(0, values.length - 1) : values;
    if (hardCodeValues.length > 0 && typeof hardCodeValues[0] === "string") {
        for (let hardCodeValue of hardCodeValues) {
            if (hasVariable(hardCodeValue)) {
                // return replace variable values
                const variableGeneratorFactory = (variables) => {
                    const replacedHardCodeValues = (0, lodash_clonedeep_1.default)(hardCodeValues);
                    for (let variableName of Object.keys(variables)) {
                        const variableValue = variables[variableName];
                        for (let i = 0; i < replacedHardCodeValues.length; i++) {
                            const value = replacedHardCodeValues[i];
                            replacedHardCodeValues[i] = value.replace(`{{${variableName}}}`, variableValue);
                        }
                    }
                    if (typeof generator === "function") {
                        return new MockGenerator(replacedHardCodeValues, generator).generatorFactory;
                    }
                    else {
                        return new MockGenerator(replacedHardCodeValues, null).generatorFactory;
                    }
                };
                variableGeneratorFactory.$type = exports.GeneratorType.variableGenerator;
                return variableGeneratorFactory;
            }
        }
    }
    if (typeof generator === "function") {
        return new MockGenerator(hardCodeValues, generator).generatorFactory;
    }
    else {
        return new MockGenerator(hardCodeValues, null).generatorFactory;
    }
}
exports.values = values;
exports.GeneratorType = {
    variableGenerator: "variable-generator"
};
function hasVariable(text) {
    return text.indexOf("{{") !== -1 && text.indexOf("}}") !== -1;
}
exports.hasVariable = hasVariable;
//# sourceMappingURL=MockGenerator.js.map