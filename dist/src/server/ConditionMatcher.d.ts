import { ProxyRequest, ProxyResponse } from "./Endpoint";
export declare class ConditionMatcher {
    private condition;
    constructor(condition?: ((req: ProxyRequest, res: ProxyResponse) => boolean) | undefined);
    and(conditionMatcher: ConditionMatcher): ConditionMatcher;
    or(conditionMatcher: ConditionMatcher): ConditionMatcher;
    evaluate(req: ProxyRequest, res: ProxyResponse): boolean;
}
export declare class NotConditionMatcher extends ConditionMatcher {
    private conditionalMatcher;
    constructor(conditionalMatcher: ConditionMatcher);
    evaluate(req: ProxyRequest, res: ProxyResponse): boolean;
}
export declare class AndConditionMatcher extends ConditionMatcher {
    private left;
    private right;
    constructor(left: ConditionMatcher, right: ConditionMatcher);
    evaluate(req: ProxyRequest, res: ProxyResponse): boolean;
}
export declare class OrConditionMatcher extends ConditionMatcher {
    private left;
    private right;
    constructor(left: ConditionMatcher, right: ConditionMatcher);
    evaluate(req: ProxyRequest, res: ProxyResponse): boolean;
}
export declare class StatusCodeConditionMatcher extends ConditionMatcher {
    private predicate;
    constructor(predicate: (status: number) => boolean);
    evaluate(req: ProxyRequest, res: ProxyResponse): boolean;
}
export declare class StructureConditionMatcher extends ConditionMatcher {
    private obj;
    private validateMeta;
    private equalFn;
    validateUnits: ValidateUnit[];
    constructor(obj: (req: ProxyRequest, res: ProxyResponse) => any, validateMeta: ValidateMeta, equalFn?: (value: any) => (x: any) => boolean);
    private _flattenValidateMeta;
    evaluate(req: ProxyRequest, res: ProxyResponse): boolean;
}
export declare function not(conditionMatcher: ConditionMatcher): ConditionMatcher;
export declare function Status(code: number | ((status: number) => boolean)): ConditionMatcher;
export declare type VailidPrimitiveValue = boolean | null | string | number;
export declare type ValidFunction = (current: any) => boolean;
export declare type ValidateMetaValue = VailidPrimitiveValue | ValidFunction | any;
export interface ValidateUnit {
    path: string;
    value: ValidateMetaValue;
}
export interface ValidateMeta {
    [key: string]: ValidateMetaValue | ValidateMeta;
}
