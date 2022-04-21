import {JsonTemplate, ObjectUpdate, updateObject} from "../mock/ObjectUpdater";
import {ProxyRequest, ProxyResponse, Rewriter} from "./Endpoint";
import {deepGet, deepSet} from "../utils/DeepOperation";
import {flattenHierarchy} from "../utils/Flatten";


export function RewriteResponse(updates:ObjectUpdate):Rewriter {
  return (req,res) =>{
    updateObject(res.response.data,updates)
  }
}

export function OverrideResponse(obj:CreateResponse | any ):Rewriter {
  return async (req, res)=>{
    const result = typeof obj === "function" ? await obj(req,res) : obj
    res.response.data = result
  }
}

export function RewriteResponseHeader(updates:ObjectUpdate):Rewriter {
  return (req,res) =>{
    updateObject(res.response.headers,updates)
  }
}

export function OverrideStatus(statusCode:number):Rewriter {
  return (req,res) =>{
    res.response.status = statusCode
  }
}

export function RewriteBody(updates:ObjectUpdate):Rewriter {
  return (req,res) =>{
    updateObject(req.body,updates)
  }
}

export function RewriteQuery(updates:ObjectUpdate):Rewriter {
  return (req,res) =>{
    updateObject(req.query,updates)
  }
}

export function RewriteHeader(updates:ObjectUpdate):Rewriter {
  const lowerKeyedUpdates:any = {}
  for(let key of Object.keys(updates)){
    lowerKeyedUpdates[key] = lowerKey((updates as any)[key],key === "rename")
  }

  return (req,res) =>{
    updateObject(req.headers,lowerKeyedUpdates)
  }
}

export function ExtractResponse(selector:string | Converter | JsonTemplate): Rewriter {
  return (req,res)=>{
    res.response.data = extractObject(res.response.data,selector)
  }
}

export function From(selector:string, ...converters:Converter[]) : Converter{
  return (obj:any) =>{
    let value = deepGet(obj,selector)
    for(let convertor of converters){
      value = convertor(value)
    }

    return value
  }
}


export function extractObject(obj:any,selector:string | Converter | JsonTemplate):any {

  if(typeof selector === "function"){
    return selector(obj)
  }
  else if(typeof selector === "string"){
    return deepGet(obj,selector)
  }
  else {
    const extractFns = flattenHierarchy<{path:string,value:(string | ((value:any)=>any))}>(selector)
    const target = {}
    for(let extract of extractFns){
      if(typeof extract.value === "string"){
        deepSet(target,extract.path,deepGet(obj,extract.value))
      }
      else {
        deepSet(target,extract.path,extract.value(obj))
      }
    }

    return target
  }
}

function lowerKey(obj:any,isLowerValue:boolean = false){
  const result:any = {}
  for(let key of Object.keys(obj)){
    let value = obj[key]
    if(isLowerValue){
      value = value.toLowerCase()
    }
    result[key.toLowerCase()] = value
  }
  return result
}


export const Break:Rewriter = (req,res,next)=>{
  next()
}


export type CreateResponse = (req:ProxyRequest,res:ProxyResponse)=>(Promise<any> | any)
export type Converter = (value:any)=>any
