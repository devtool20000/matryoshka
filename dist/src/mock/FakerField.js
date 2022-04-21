"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeExpr = exports.Fake = exports.setGlobalSeed = void 0;
const faker_1 = require("@faker-js/faker");
const DeepOperation_1 = require("../utils/DeepOperation");
let globalFakerSeed = 123;
function setGlobalSeed(value) {
    globalFakerSeed = value;
}
exports.setGlobalSeed = setGlobalSeed;
function Fake(path, options = null) {
    return () => {
        var _a;
        const fakerInstance = new faker_1.Faker({ locales: faker_1.faker.locales });
        const fakerFunction = (0, DeepOperation_1.deepGet)(fakerInstance, path);
        if (typeof fakerFunction !== "function") {
            throw new Error(`can't find ${path} from faker`);
        }
        fakerInstance.seed((_a = options === null || options === void 0 ? void 0 : options.seed) !== null && _a !== void 0 ? _a : globalFakerSeed);
        if (options === null || options === void 0 ? void 0 : options.locale) {
            fakerInstance.locale = options.locale;
        }
        return () => {
            var _a;
            return fakerFunction.apply(null, ((_a = options === null || options === void 0 ? void 0 : options.options) !== null && _a !== void 0 ? _a : []));
        };
    };
}
exports.Fake = Fake;
function FakeExpr(expr, options = null) {
    return () => {
        var _a;
        const fakerInstance = new faker_1.Faker({ locales: faker_1.faker.locales });
        const fakerFunction = fakerInstance.fake;
        fakerInstance.seed((_a = options === null || options === void 0 ? void 0 : options.seed) !== null && _a !== void 0 ? _a : globalFakerSeed);
        if (options === null || options === void 0 ? void 0 : options.locale) {
            fakerInstance.locale = options.locale;
        }
        return () => {
            return fakerFunction.call(null, expr);
        };
    };
}
exports.FakeExpr = FakeExpr;
//# sourceMappingURL=FakerField.js.map