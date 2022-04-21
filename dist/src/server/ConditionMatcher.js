import { flattenHierarchy } from "../utils/Flatten";
import { deepGet } from "../utils/DeepOperation";
export class ConditionMatcher {
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
export class NotConditionMatcher extends ConditionMatcher {
    constructor(conditionalMatcher) {
        super();
        this.conditionalMatcher = conditionalMatcher;
    }
    evaluate(req, res) {
        return !this.conditionalMatcher.evaluate(req, res);
    }
}
export class AndConditionMatcher extends ConditionMatcher {
    constructor(left, right) {
        super();
        this.left = left;
        this.right = right;
    }
    evaluate(req, res) {
        return this.left.evaluate(req, res) && this.right.evaluate(req, res);
    }
}
export class OrConditionMatcher extends ConditionMatcher {
    constructor(left, right) {
        super();
        this.left = left;
        this.right = right;
    }
    evaluate(req, res) {
        return this.left.evaluate(req, res) || this.right.evaluate(req, res);
    }
}
export class StatusCodeConditionMatcher extends ConditionMatcher {
    constructor(predicate) {
        super();
        this.predicate = predicate;
    }
    evaluate(req, res) {
        return this.predicate(res.response.status);
    }
}
export class StructureConditionMatcher extends ConditionMatcher {
    constructor(obj, validateMeta, equalFn = (value) => (x) => x === value) {
        super();
        this.obj = obj;
        this.validateMeta = validateMeta;
        this.equalFn = equalFn;
        this.validateUnits = [];
        this._flattenValidateMeta();
    }
    _flattenValidateMeta() {
        this.validateUnits = flattenHierarchy(this.validateMeta);
        for (let validateUnit of this.validateUnits) {
            if (!(typeof validateUnit.value === "function")) {
                const value = validateUnit.value;
                validateUnit.value = this.equalFn(value);
            }
        }
    }
    evaluate(req, res) {
        for (let validateUnit of this.validateUnits) {
            if (!validateUnit.value(deepGet(this.obj(req, res), validateUnit.path))) {
                return false;
            }
        }
        return true;
    }
}
export function not(conditionMatcher) {
    return new NotConditionMatcher(conditionMatcher);
}
export function Status(code) {
    let predicate = code;
    if (typeof code === "number") {
        predicate = (_code) => _code === code;
    }
    return new StatusCodeConditionMatcher(predicate);
}
//# sourceMappingURL=ConditionMatcher.js.map