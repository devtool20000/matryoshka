import cors, { CorsOptionsDelegate } from 'cors';
import { HttpMethod, ResponseData, Endpoint } from "./Endpoint";
export interface ServerOptions extends UpstreamServerOptions {
    proxyUrl?: string;
    port?: number;
    cors?: cors.CorsOptions | CorsOptionsDelegate;
    apiSpec?: string;
    default?: ServerDefaultOptions;
    proxies?: Record<string, UpstreamServerOptions>;
}
export interface UpstreamServerOptions {
    proxyUrl?: string;
}
export interface ServerDefaultOptions {
    notFoundResponseData?: ResponseData;
    newEndpointResponseData?: ResponseData;
}
export declare class ProxyServer {
    config: ServerOptions;
    private endpoints;
    constructor(config: ServerOptions);
    private _validateConfig;
    addEndPoint(path: string, method: HttpMethod | null, defaultResponseData?: ResponseData | null): Endpoint;
    updateEndPoint(path: string, method?: HttpMethod | null): Endpoint;
    proxy(path: string, method?: HttpMethod | null): Endpoint;
    remove(path: string, method?: HttpMethod | null): void;
    serve(): Promise<void>;
    private startProxyServer;
    private createRequestMiddlewares;
    private createResponseMiddlewares;
    private createProxyMiddleware;
    private createFinalResponse;
}
