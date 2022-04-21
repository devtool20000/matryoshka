import express, {NextFunction} from "express";
import {AxiosResponse, AxiosResponseHeaders} from "axios";
import {ConditionMatcher} from "./ConditionMatcher";
import clonedeep from 'lodash.clonedeep';


export class Endpoint implements MiddlewareFactory {

  private requestRewriters:EndpointMiddleware[] = []
  private responseRewriter:EndpointMiddleware[] = []

  private newPath?:string
  private newMethod?:HttpMethod

  public isNewEndpoint:boolean = false
  private isRemove:boolean = false
  public notFoundResponseData:ResponseData = {}
  public newEndpointResponseData:ResponseData = {
    status:200,
    data:DEFAULT_200_BODY,
    headers:DEFAULT_RESPONSE_HEADERS
  }

  private isAfterProxy:boolean = false

  private _upStream:string = DEFAULT_UPSTREAM

  constructor(public path:string, public method:HttpMethod | null) {

  }

  request(...rewriters:Rewriter[]): Endpoint{
    this.requestRewriters.push({
      condition:ALWAYS_TRUE,
      rewriter: _mergeSequentialRewriter(rewriters)
    })
    return this
  }

  forUpStream(upStream:string) : Endpoint {
    this._upStream = upStream
    return this
  }

  from(upStream:string) : Endpoint{
    return this.forUpStream(upStream)
  }

  proxy():Endpoint {
    this.isAfterProxy = true
    return this
  }

  newEndpoint(responseData:ResponseData | null = null):Endpoint{
    this.isNewEndpoint = true
    this.isAfterProxy = true
    if(responseData){
      Object.assign(this.newEndpointResponseData,responseData)
    }
    return this
  }

  response(...middleware:Rewriter[]): Endpoint{
    this.responseRewriter.push({
      condition:ALWAYS_TRUE,
      rewriter: _mergeSequentialRewriter(middleware)
    })
    return this
  }

  requestWhen(condition:RewriteCondition, middleware:Rewriter): Endpoint {
    this.requestRewriters.push({
      condition:this._buildRewriteCondition(condition),
      rewriter: middleware
    })
    return this
  }

  responseWhen(condition:RewriteCondition, middleware:Rewriter): Endpoint {
    this.responseRewriter.push({
      condition:this._buildRewriteCondition(condition),
      rewriter: middleware
    })
    return this
  }

  when(condition:RewriteCondition, ...rewriters: Rewriter[]): Endpoint {
    if(this.isAfterProxy){
      this.responseWhen(condition, _mergeSequentialRewriter(rewriters))
      return this
    }
    else {
      this.requestWhen(condition, _mergeSequentialRewriter(rewriters))
      return this
    }
  }

  private _buildRewriteCondition(condition:RewriteCondition): RewriteConditionFn{
    if(typeof condition === "function"){
      return condition
    }
    else {
      return condition.evaluate.bind(condition)
    }
  }

  moveTo(newPath:string, method:HttpMethod | undefined = undefined): Endpoint {
    this.newPath = newPath
    this.newMethod = method
    return this
  }

  remove(responseData:ResponseData | null = null) : Endpoint {
    this.isRemove = true

    if(responseData){
      this.notFoundResponseData = clonedeep(responseData)
    }

    if(!this.notFoundResponseData.status){
      this.notFoundResponseData.status = 404
    }
    if(!this.notFoundResponseData.data){
      this.notFoundResponseData.data = DEFAULT_404_BODY
    }
    return this
  }

  renameTo(newPath:string, method:HttpMethod | undefined = undefined, responseData:ResponseData | null = null): Endpoint{
    this.moveTo(newPath,method)
    this.remove(responseData)
    return this
  }

  addRequestMiddlewareTo(app:express.Application){

    const path = this.path.startsWith("/") ? this.path : `/${this.path}`
    const guardPath = this.newPath ?? this.path
    const _guardPath = guardPath.startsWith("/") ? guardPath : `/${guardPath}`

    // middle to add meta data on request for following middlewares
    app.use(_guardPath,(req:ProxyRequest,res,next)=>{
      // for new Endpoint, we add a middleware to mark this request is new and don't need to call upstream server
      if(this.isNewEndpoint){
        req.earlyReturnResponse = clonedeep(this.newEndpointResponseData)
        req.isEarlyReturn = true // Early return marks the req to return without call proxy

      }
      req.upStream = this._upStream
      next()
    })


    // add remove endpoint middleware
    if(this.isRemove){
      // const path = this.path.startsWith("/") ? this.path : `/${this.path}`


      app.use(path,(req,res,next)=>{

        if(this.method && req.method !== this.method){
          return next()
        }

        if(this.notFoundResponseData?.headers){
          res.set(this.notFoundResponseData.headers)
        }
        return res.status(this.notFoundResponseData?.status!).json(this.notFoundResponseData?.data)
      })
    }



    // add moveTo


    const _middleware = async (req: ProxyRequest, res: ProxyResponse, next: NextFunction) => {
      const guardMethod = this.newMethod ?? this.method

      // skip to next earlier when the method is matched
      if (guardMethod && req.method !== guardMethod) {
        return next()
      }

      // convert new path to old path
      if(this.newMethod && this.method){
        req.rewriteMethod = this.method
      }

      if(this.newPath){
        req.rewritePath = this.path.startsWith("/") ? this.path : `/${this.path}`
        req.originPath = this.newPath.startsWith("/") ? this.newPath : `/${this.newPath}`
        req.rewriteParams = req.params
      }

      // activate response according to conditional data
      for(let rewriteUnit of this.requestRewriters){
        if (await rewriteUnit.condition(req, res)) {
          await rewriteUnit.rewriter(req, res)
        }
      }
      return next()
    }

    app.use(_guardPath, _middleware as any)

  }

  addResponseMiddlewareTo(app:express.Application){

    const guardPath = this.newPath ?? this.path

    const _middleware = async (req: ProxyRequest, res: ProxyResponse, next: NextFunction) => {

      for(let rewriteUnit of this.responseRewriter){
        if (!(await rewriteUnit.condition(req, res))) {
          continue
        }
        await rewriteUnit.rewriter(req, res)
      }
      next()
    }
    const path = guardPath.startsWith("/") ? guardPath : `/${guardPath}`
    app.use(path, _middleware as any)


  }

  apply(plugin:Plugin<Endpoint>):Endpoint{
    plugin(this)
    return this
  }
}

function _mergeSequentialRewriter(rewriters:Rewriter[]):Rewriter{
  return async (req,res)=>{
    for(let rewriter of rewriters){
      await rewriter(req,res)
    }
  }
}


const DEFAULT_404_BODY = {
  isProxy:true,
  error:"Method Not Found"
}

const DEFAULT_200_BODY = {
  isProxy:true,
  message:"implement a default return value"
}

const DEFAULT_RESPONSE_HEADERS = {
  "content-type":"application/json"
}

export function createDefaultProxyResponse(){
  return {
    status:200,
    data:Object.assign(DEFAULT_200_BODY),
    headers: Object.assign(DEFAULT_RESPONSE_HEADERS)
  }
}



const ALWAYS_TRUE = (req: express.Request, res:ProxyResponse, next:NextFunction)=> true

export type Rewriter = (req:express.Request, res:ProxyResponse)=> (Promise<void> | void)
export type RewriteCondition = RewriteConditionFn | ConditionMatcher
export type RewriteConditionFn = (req:ProxyRequest, res:ProxyResponse)=>(Promise<boolean> | boolean)
export type Plugin<T> = (host:T) =>void



export interface MiddlewareFactory {
  addRequestMiddlewareTo(app:express.Application): void
  addResponseMiddlewareTo(app:express.Application): void
}

export interface ProxyResponse extends express.Response{
  response:{
    data: any;
    status: number;
    headers: AxiosResponseHeaders;
  }
}

export interface ProxyRequest extends express.Request{
  rewritePath?:string
  originPath?:string
  rewriteParams?:Record<string, string>
  rewriteMethod?:HttpMethod
  isEarlyReturn?:boolean
  earlyReturnResponse?:ResponseData
  upStream?:string
}

interface EndpointMiddleware {
  condition:Function
  rewriter:Rewriter
}

export interface ResponseData {
  status?:number
  data?:any
  headers?:Record<string, any>
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "CONNECT" | "OPTIONS" | "TRACE"
export const DEFAULT_UPSTREAM = "default"
