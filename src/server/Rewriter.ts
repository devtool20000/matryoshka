import {ObjectUpdate, updateObject} from "../mock/ObjectUpdater";
import {ProxyRequest, ProxyResponse, Rewriter} from "./Endpoint";


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


export type CreateResponse = (req:ProxyRequest,res:ProxyResponse)=>(Promise<any> | any)
