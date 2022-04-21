import { Faker, faker } from '@faker-js/faker';
import { deepGet } from "../utils/DeepOperation";
let globalFakerSeed = 123;
export function setGlobalSeed(value) {
    globalFakerSeed = value;
}
export function Fake(path, options = null) {
    return () => {
        var _a;
        const fakerInstance = new Faker({ locales: faker.locales });
        const fakerFunction = deepGet(fakerInstance, path);
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
export function FakeExpr(expr, options = null) {
    return () => {
        var _a;
        const fakerInstance = new Faker({ locales: faker.locales });
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
//# sourceMappingURL=FakerField.js.map