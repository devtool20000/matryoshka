var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as bodyParser from 'body-parser';
import { Endpoint, DEFAULT_UPSTREAM, createDefaultProxyResponse } from "./Endpoint";
import getPort, { portNumbers } from "get-port";
export class ProxyServer {
    constructor(config) {
        this.config = config;
        this.endpoints = [];
        if (!config.upstreams) {
            config.upstreams = {};
        }
        config.upstreams[DEFAULT_UPSTREAM] = config;
        this._validateConfig();
    }
    _validateConfig() {
        // make sure all proxies has non-empty proxyUrl
        for (let proxyName of Object.keys(this.config.upstreams)) {
            if (!this.config.upstreams[proxyName].upstreamUrl && proxyName !== DEFAULT_UPSTREAM) {
                throw new Error(`proxy ${proxyName} has empty proxyUrl`);
            }
            const proxyUrl = this.config.upstreams[proxyName].upstreamUrl;
            if (proxyUrl && proxyUrl.startsWith("localhost")) {
                const completeProxyUrl = `http://${proxyUrl}`;
                this.config.upstreams[proxyName].upstreamUrl = completeProxyUrl;
                if (proxyName === DEFAULT_UPSTREAM) {
                    this.config.upstreamUrl = completeProxyUrl;
                }
            }
        }
    }
    addEndPoint(path, method, defaultResponseData = null) {
        var _a;
        return this.updateEndPoint(path, method).newEndpoint(defaultResponseData !== null && defaultResponseData !== void 0 ? defaultResponseData : (_a = this.config.default) === null || _a === void 0 ? void 0 : _a.newEndpointResponseData);
    }
    updateEndPoint(path, method = null) {
        var _a;
        const endpoint = new Endpoint(path, method);
        // add global removeResponseData
        if ((_a = this.config.default) === null || _a === void 0 ? void 0 : _a.notFoundResponseData) {
            endpoint.notFoundResponseData = Object.assign({}, this.config.default.notFoundResponseData);
        }
        this.endpoints.push(endpoint);
        return endpoint;
    }
    proxy(path, method = null) {
        return this.updateEndPoint(path, method);
    }
    remove(path, method = null) {
        this.updateEndPoint(path, method).remove();
    }
    serve() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const app = express();
            app.use(cors(this.config.cors));
            app.use(bodyParser.json({
                limit: "100mb" //TODO: move this to config in the future
            }));
            // create proxy
            this.createRequestMiddlewares(app);
            this.createProxyMiddleware(app);
            this.createResponseMiddlewares(app);
            this.createFinalResponse(app);
            // start proxy server
            const port = (_a = this.config.port) !== null && _a !== void 0 ? _a : yield getPort({ port: portNumbers(8080, 9999) });
            this.startProxyServer(app, port);
        });
    }
    startProxyServer(app, port) {
        console.log(`local proxy server running on http://localhost:${port}`);
        console.log(`to create a public url for the server , you can install localtunnel (https://github.com/localtunnel/localtunnel#globally) \nthen run: lt -p ${port}\nThis will print the public url`);
        app.listen(port);
    }
    createRequestMiddlewares(app) {
        for (let endpoint of this.endpoints) {
            endpoint.addRequestMiddlewareTo(app);
        }
    }
    createResponseMiddlewares(app) {
        for (let endpoint of this.endpoints) {
            endpoint.addResponseMiddlewareTo(app);
        }
    }
    createProxyMiddleware(app) {
        function copyExpressResponse(axiosResponse, expressResponse, next) {
            // // TODO: currently remove access control allow origin from upstream response so we can workaround web access issue
            // // however, this prevent user to customize the cross origin behavior, so change this part in the future
            // if(axiosResponse.headers["access-control-allow-origin"]){
            //   axiosResponse.headers["access-control-allow-origin"] = "*"
            // }
            // TODO: add http log here
            expressResponse.response = axiosResponse;
            next();
        }
        app.use((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            // remove some headers which block the request
            const headers = req.headers;
            // ignore headers from original request so it won't block the request
            _ignoreHeaders(headers, ["host", "user-agent", "content-length"]);
            if (req.isEarlyReturn) {
                // call early return
                res.response = (_a = req.earlyReturnResponse) !== null && _a !== void 0 ? _a : createDefaultProxyResponse();
                next();
            }
            else {
                // call upstream server
                const upStream = (_b = req.upStream) !== null && _b !== void 0 ? _b : DEFAULT_UPSTREAM;
                const upStreamBaseUrl = this.config.upstreams[upStream].upstreamUrl;
                if (!upStreamBaseUrl) {
                    throw new Error(`upStream: ${upStream} is has empty BaseUrl`);
                }
                const config = {
                    url: `${upStreamBaseUrl}${(req.rewritePath ? _reWritePathForUpstream(req.rewriteParams, req.rewritePath, req.originPath, req.path) : req.path)}`,
                    headers: headers,
                    method: ((_c = req.rewriteMethod) !== null && _c !== void 0 ? _c : req.method).toLowerCase(),
                    params: req.query,
                    data: req.body,
                };
                try {
                    const response = yield axios.request(config);
                    copyExpressResponse(response, res, next);
                }
                catch (e) {
                    const response = e.response;
                    if (response) {
                        copyExpressResponse(response, res, next);
                    }
                    else {
                        res.status(500).json({
                            isProxy: true,
                            error: e
                        });
                    }
                }
            }
        }));
    }
    createFinalResponse(app) {
        app.use((req, res) => {
            const data = res.response;
            res.status(data.status).set(data.headers).send(data.data);
        });
    }
}
function _ignoreHeaders(headers, ignoredHeaders) {
    for (let header of ignoredHeaders) {
        if (headers[header]) {
            delete headers[header];
        }
    }
}
function _reWritePathForUpstream(params, rewritePath, originPath, realpath) {
    let finalRewritePath = rewritePath;
    let finalOriginPath = originPath;
    for (let name of Object.keys(params)) {
        const paramValue = params[name];
        finalRewritePath = finalRewritePath.replace(":" + name, paramValue);
        finalOriginPath = finalOriginPath.replace(":" + name, paramValue);
    }
    return finalRewritePath + realpath.substring(finalOriginPath.length);
}
//# sourceMappingURL=Server.js.map