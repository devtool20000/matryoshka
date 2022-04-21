import {ConditionMatcher, StructureConditionMatcher, ValidateMeta} from "./ConditionMatcher";

// Request header
export function Header(validate:ValidateMeta):ConditionMatcher;
export function Header(name:string,value:any):ConditionMatcher;
export function Header(name:unknown,value?:any):ConditionMatcher {
  if(typeof name === "string"){
    name = {
      [name.toLowerCase()]:value
    }
  }
  const config = name as ValidateMeta
  for(let key of Object.keys(config)){
    const value = config[key]
    delete config[key]
    config[key.toLowerCase()] = value
  }

  return new StructureConditionMatcher((req,res)=>req.headers,name as ValidateMeta)
}

// Request Query
export function Query(validate:ValidateMeta):ConditionMatcher;
export function Query(name:string,value:any):ConditionMatcher;
export function Query(name:unknown,value?:any):ConditionMatcher {
  if(typeof name === "string"){
    name = {
      [name]:value
    }
  }
  const config = name as ValidateMeta

  return new StructureConditionMatcher((req,res)=>req.query,name as ValidateMeta,(value:any)=>(x:any)=>String(value)===x)
}

// Request Body
export function Body(validate:ValidateMeta):ConditionMatcher;
export function Body(name:string,value:any):ConditionMatcher;
export function Body(name:unknown,value?:any):ConditionMatcher {
  if(typeof name === "string"){
    name = {
      [name]:value
    }
  }
  const config = name as ValidateMeta

  return new StructureConditionMatcher((req,res)=>req.body,name as ValidateMeta)
}


// Response header
export function ResponseHeader(validate:ValidateMeta):ConditionMatcher;
export function ResponseHeader(name:string,value:any):ConditionMatcher;
export function ResponseHeader(name:unknown,value?:any):ConditionMatcher {
  if(typeof name === "string"){
    name = {
      [name.toLowerCase()]:value
    }
  }
  const config = name as ValidateMeta
  for(let key of Object.keys(config)){
    const value = config[key]
    delete config[key]
    config[key.toLowerCase()] = value
  }

  return new StructureConditionMatcher((req,res)=>{
    return res.response.headers
  },name as ValidateMeta)
}

// Request Body
export function Response(validate:ValidateMeta):ConditionMatcher;
export function Response(name:string,value:any):ConditionMatcher;
export function Response(name:unknown,value?:any):ConditionMatcher {
  if(typeof name === "string"){
    name = {
      [name]:value
    }
  }
  const config = name as ValidateMeta

  return new StructureConditionMatcher((req,res)=>res.response.data,name as ValidateMeta)
}


export const NotExist = (x:any)=>!x
export const Exist = (x:any)=>x

export function LessThan(value:any){
  return (x:any)=>x<value
}

export function LessEqual(value:any){
  return (x:any)=>x<=value
}

export function LargeEqual(value:any){
  return (x:any)=>x>=value
}

export function LargeThan(value:any){
  return (x:any)=>x>value
}
