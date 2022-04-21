import express, {NextFunction, response} from 'express';
import cors, {CorsOptionsDelegate} from 'cors';

import axios, {AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse, Method} from 'axios';
import * as bodyParser from 'body-parser';
import {
  HttpMethod,
  MiddlewareFactory,
  ProxyRequest,
  ProxyResponse,
  ResponseData,
  Endpoint,
  DEFAULT_UPSTREAM,
  createDefaultProxyResponse
} from "./Endpoint";



export interface ServerOptions extends UpstreamServerOptions{
  upstreamUrl?: string,
  port?: number,
  cors?:cors.CorsOptions | CorsOptionsDelegate,
  apiSpec?: string // can be file or url
  default?:ServerDefaultOptions
  upstreams?:Record<string,UpstreamServerOptions>
}

export interface UpstreamServerOptions {
  upstreamUrl?: string,
  // default?:ServerDefaultOptions
}

export interface ServerDefaultOptions {
  notFoundResponseData?:ResponseData
  newEndpointResponseData?:ResponseData
}


export class ProxyServer {

  private endpoints:MiddlewareFactory[] = []

  constructor(public config: ServerOptions) {
    if(!config.upstreams){
      config.upstreams = {}
    }
    config.upstreams[DEFAULT_UPSTREAM] = config
    this._validateConfig()
  }

  private _validateConfig(){
    // make sure all proxies has non-empty proxyUrl
    for(let proxyName of Object.keys(this.config.upstreams!)){
      if(!this.config.upstreams![proxyName].upstreamUrl && proxyName !== DEFAULT_UPSTREAM){
        throw new Error(`proxy ${proxyName} has empty proxyUrl`)
      }
      const proxyUrl = this.config.upstreams![proxyName].upstreamUrl

      if(proxyUrl && proxyUrl.startsWith("localhost")){
        const completeProxyUrl = `http://${proxyUrl}`
        this.config.upstreams![proxyName].upstreamUrl = completeProxyUrl
        if(proxyName === DEFAULT_UPSTREAM){
          this.config.upstreamUrl = completeProxyUrl
        }
      }
    }


  }

  addEndPoint(path:string,method:HttpMethod | null, defaultResponseData:ResponseData | null = null):Endpoint {
    return this.updateEndPoint(path,method).newEndpoint(defaultResponseData ?? this.config.default?.newEndpointResponseData)
  }

  updateEndPoint(path: string, method:HttpMethod | null = null): Endpoint {
    const endpoint = new Endpoint(path,method)

    // add global removeResponseData
    if(this.config.default?.notFoundResponseData){
      endpoint.notFoundResponseData = Object.assign({},this.config.default.notFoundResponseData)
    }
    this.endpoints.push(endpoint)
    return endpoint
  }

  proxy(path: string, method:HttpMethod | null = null): Endpoint {
    return this.updateEndPoint(path,method)
  }

  remove(path:string, method:HttpMethod | null = null) {
    this.updateEndPoint(path,method).remove()
  }


  async serve() {
    const app: express.Express = express()
    app.use(cors(this.config.cors))
    app.use(bodyParser.json({
      limit:"100mb" //TODO: move this to config in the future
    }))

    // create proxy
    this.createRequestMiddlewares(app)
    this.createProxyMiddleware(app)
    this.createResponseMiddlewares(app)
    this.createFinalResponse(app)

    // start proxy server
    const port = this.config.port ?? 8080
    this.startProxyServer(app,port)

  }

  private startProxyServer(app:express.Application, port:number){
    console.log(`local proxy server running on http://localhost:${port}`);
    console.log(`to create a public url for the server , you can install localtunnel (https://github.com/localtunnel/localtunnel#globally) \nthen run: lt -p ${port}\nThis will print the public url`);
    app.listen(port)
  }

  private createRequestMiddlewares(app:express.Application){
    for(let endpoint of this.endpoints){
      endpoint.addRequestMiddlewareTo(app)
    }
  }

  private createResponseMiddlewares(app:express.Application){
    for(let endpoint of this.endpoints){
      endpoint.addResponseMiddlewareTo(app)
    }
  }

  private createProxyMiddleware(app:express.Application){
    function copyExpressResponse(axiosResponse:AxiosResponse, expressResponse:ProxyResponse, next:NextFunction){

      // // TODO: currently remove access control allow origin from upstream response so we can workaround web access issue
      // // however, this prevent user to customize the cross origin behavior, so change this part in the future
      // if(axiosResponse.headers["access-control-allow-origin"]){
      //   axiosResponse.headers["access-control-allow-origin"] = "*"
      // }

      // TODO: add http log here
      expressResponse.response = axiosResponse
      next()

    }

    app.use(async (req:ProxyRequest, res,next) => {
      // remove some headers which block the request
      const headers = req.headers

      // ignore headers from original request so it won't block the request
      _ignoreHeaders(headers,["host","user-agent","content-length"])

      if(req.isEarlyReturn){
        // call early return
        (res as ProxyResponse).response = req.earlyReturnResponse ?? createDefaultProxyResponse() as any
        next()
      }
      else {
        // call upstream server

        const upStream = req.upStream ?? DEFAULT_UPSTREAM
        const upStreamBaseUrl = this.config.upstreams![upStream].upstreamUrl
        if(!upStreamBaseUrl){
          throw new Error(`upStream: ${upStream} is has empty BaseUrl`)
        }

        const config:AxiosRequestConfig = {
          url:`${upStreamBaseUrl}${(req.rewritePath ? _reWritePathForUpstream(req.rewriteParams!,req.rewritePath, req.originPath!,req.path) : req.path)}`,
          headers: headers as AxiosRequestHeaders,
          method: (req.rewriteMethod ?? req.method).toLowerCase() as Method,
          params:req.query,
          data:req.body,
        }
        try {
          const response = await axios.request(config)
          copyExpressResponse(response,res as ProxyResponse,next)

        }
        catch (e) {
          const response = (e as any).response
          if(response){
            copyExpressResponse(response as any,res as ProxyResponse,next)
          }
          else {
            res.status(500).json({
              isProxy:true,
              error:e
            })
          }
        }

      }



    })
  }

  private createFinalResponse(app:express.Application){
    app.use((req,res)=>{
      const data = (res as ProxyResponse).response
      res.status(data.status).set(data.headers).send(data.data)
    })
  }
}


function _ignoreHeaders(headers:any, ignoredHeaders:string[]){
  for(let header of ignoredHeaders){
    if(headers[header]){
      delete headers[header]
    }
  }
}

function _reWritePathForUpstream(params:Record<string, string>, rewritePath:string, originPath:string, realpath:string) : string{

  let finalRewritePath = rewritePath
  let finalOriginPath = originPath
  for(let name of Object.keys(params)){
    const paramValue = params[name]
    finalRewritePath = finalRewritePath.replace(":"+name,paramValue)
    finalOriginPath = finalOriginPath.replace(":"+name,paramValue)
  }

  return finalRewritePath + realpath.substring(finalOriginPath.length)
}


