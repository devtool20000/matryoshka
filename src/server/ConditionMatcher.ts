import {ProxyRequest, ProxyResponse} from "./Endpoint";
import {flattenHierarchy} from "../utils/Flatten";
import {deepGet} from "../utils/DeepOperation";

export class ConditionMatcher {

  constructor(private condition: ((req:ProxyRequest,res:ProxyResponse)=>boolean) | undefined = undefined) {
  }

  and(conditionMatcher:ConditionMatcher) : ConditionMatcher{
    return new AndConditionMatcher(this,conditionMatcher)
  }

  or(conditionMatcher:ConditionMatcher) :ConditionMatcher {
    return new OrConditionMatcher(this,conditionMatcher)
  }

  evaluate(req:ProxyRequest,res:ProxyResponse): boolean {
    if(this.condition){
      return this.condition(req,res)
    }
    throw new Error("not implement")
  }
}

export class NotConditionMatcher extends ConditionMatcher{
  constructor(private conditionalMatcher:ConditionMatcher) {
    super();
  }
  evaluate(req: ProxyRequest, res: ProxyResponse): boolean {
    return !this.conditionalMatcher.evaluate(req, res)
  }
}

export class AndConditionMatcher extends ConditionMatcher {
  constructor(private left:ConditionMatcher, private right:ConditionMatcher) {
    super();
  }

  evaluate(req: ProxyRequest, res: ProxyResponse): boolean {
    return this.left.evaluate(req,res) && this.right.evaluate(req,res)
  }
}

export class OrConditionMatcher extends ConditionMatcher {
  constructor(private left:ConditionMatcher, private right:ConditionMatcher) {
    super();
  }

  evaluate(req: ProxyRequest, res: ProxyResponse): boolean {
    return this.left.evaluate(req,res) || this.right.evaluate(req,res)
  }
}

export class StatusCodeConditionMatcher extends ConditionMatcher {
  constructor(private predicate:(status:number)=>boolean) {
    super();
  }

  evaluate(req: ProxyRequest, res: ProxyResponse): boolean {
    return this.predicate(res.response.status)
  }
}

export class StructureConditionMatcher extends ConditionMatcher {
  validateUnits:ValidateUnit[] = []
  constructor(
    private obj:(req:ProxyRequest, res:ProxyResponse)=>any,
    private validateMeta:ValidateMeta,
    private equalFn = (value:any)=>(x:any)=>x === value
  ) {
    super();
    this._flattenValidateMeta()
  }

  private _flattenValidateMeta(){
    this.validateUnits = flattenHierarchy<ValidateMetaValue>(this.validateMeta)
    for(let validateUnit of this.validateUnits){
      if(!(typeof validateUnit.value === "function")){
        const value = validateUnit.value
        validateUnit.value = this.equalFn(value)
      }
    }
  }

  evaluate(req: ProxyRequest, res: ProxyResponse): boolean {
    for(let validateUnit of this.validateUnits){
      if(!validateUnit.value(deepGet(this.obj(req,res),validateUnit.path))){
        return false
      }
    }
    return true
  }
}

export function not(conditionMatcher:ConditionMatcher) : ConditionMatcher{
  return new NotConditionMatcher(conditionMatcher)
}

export function Status(code:number | ((status:number)=>boolean)):ConditionMatcher{
  let predicate:any = code
  if(typeof code === "number"){
    predicate = (_code:number)=> _code === code
  }
  return new StatusCodeConditionMatcher(predicate)
}

export type VailidPrimitiveValue = boolean | null | string | number
export type ValidFunction = (current: any) => boolean
export type ValidateMetaValue =
  VailidPrimitiveValue
  | ValidFunction
  | any

export interface ValidateUnit {
  path: string
  value: ValidateMetaValue
}

export interface ValidateMeta {
  [key: string]: ValidateMetaValue | ValidateMeta
}

