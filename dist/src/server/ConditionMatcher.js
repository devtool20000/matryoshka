"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = exports.not = exports.StructureConditionMatcher = exports.StatusCodeConditionMatcher = exports.OrConditionMatcher = exports.AndConditionMatcher = exports.NotConditionMatcher = exports.ConditionMatcher = void 0;
const Flatten_1 = require("../utils/Flatten");
const DeepOperation_1 = require("../utils/DeepOperation");
class ConditionMatcher {
    constructor(condition = undefined) {
        this.condition = condition;
    }
    and(conditionMatcher) {
        return new AndConditionMatcher(this, conditionMatcher);
    }
    or(conditionMatcher) {
        return new OrConditionMatcher(this, conditionMatcher);
    }
    evaluate(req, res) {
        if (this.condition) {
            return this.condition(req, res);
        }
        throw new Error("not implement");
    }
}
exports.ConditionMatcher = ConditionMatcher;
class NotConditionMatcher extends ConditionMatcher {
    constructor(conditionalMatcher) {
        super();
        this.conditionalMatcher = conditionalMatcher;
    }
    evaluate(req, res) {
        return !this.conditionalMatcher.evaluate(req, res);
    }
}
exports.NotConditionMatcher = NotConditionMatcher;
class AndConditionMatcher extends ConditionMatcher {
    constructor(left, right) {
        super();
        this.left = left;
        this.right = right;
    }
    evaluate(req, res) {
        return this.left.evaluate(req, res) && this.right.evaluate(req, res);
    }
}
exports.AndConditionMatcher = AndConditionMatcher;
class OrConditionMatcher extends ConditionMatcher {
    constructor(left, right) {
        super();
        this.left = left;
        this.right = right;
    }
    evaluate(req, res) {
        return this.left.evaluate(req, res) || this.right.evaluate(req, res);
    }
}
exports.OrConditionMatcher = OrConditionMatcher;
class StatusCodeConditionMatcher extends ConditionMatcher {
    constructor(predicate) {
        super();
        this.predicate = predicate;
    }
    evaluate(req, res) {
        return this.predicate(res.response.status);
    }
}
exports.StatusCodeConditionMatcher = StatusCodeConditionMatcher;
class StructureConditionMatcher extends ConditionMatcher {
    constructor(obj, validateMeta, equalFn = (value) => (x) => x === value) {
        super();
        this.obj = obj;
        this.validateMeta = validateMeta;
        this.equalFn = equalFn;
        this.validateUnits = [];
        this._flattenValidateMeta();
    }
    _flattenValidateMeta() {
        this.validateUnits = (0, Flatten_1.flattenHierarchy)(this.validateMeta);
        for (let validateUnit of this.validateUnits) {
            if (!(typeof validateUnit.value === "function")) {
                const value = validateUnit.value;
                validateUnit.value = this.equalFn(value);
            }
        }
    }
    evaluate(req, res) {
        for (let validateUnit of this.validateUnits) {
            if (!validateUnit.value((0, DeepOperation_1.deepGet)(this.obj(req, res), validateUnit.path))) {
                return false;
            }
        }
        return true;
    }
}
exports.StructureConditionMatcher = StructureConditionMatcher;
function not(conditionMatcher) {
    return new NotConditionMatcher(conditionMatcher);
}
exports.not = not;
function Status(code) {
    let predicate = code;
    if (typeof code === "number") {
        predicate = (_code) => _code === code;
    }
    return new StatusCodeConditionMatcher(predicate);
}
exports.Status = Status;
//# sourceMappingURL=ConditionMatcher.js.map