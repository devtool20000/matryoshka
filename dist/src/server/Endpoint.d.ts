import express from "express";
import { AxiosResponseHeaders } from "axios";
import { ConditionMatcher } from "./ConditionMatcher";
export declare class Endpoint implements MiddlewareFactory {
    path: string;
    method: HttpMethod | null;
    private requestRewriters;
    private responseRewriter;
    private newPath?;
    private newMethod?;
    isNewEndpoint: boolean;
    private isRemove;
    notFoundResponseData: ResponseData;
    newEndpointResponseData: ResponseData;
    private isAfterProxy;
    private _upStream;
    constructor(path: string, method: HttpMethod | null);
    request(...rewriters: Rewriter[]): Endpoint;
    forUpStream(upStream: string): Endpoint;
    from(upStream: string): Endpoint;
    proxy(): Endpoint;
    newEndpoint(responseData?: ResponseData | null): Endpoint;
    response(...middleware: Rewriter[]): Endpoint;
    requestWhen(condition: RewriteCondition, middleware: Rewriter): Endpoint;
    responseWhen(condition: RewriteCondition, middleware: Rewriter): Endpoint;
    when(condition: RewriteCondition, ...rewriters: Rewriter[]): Endpoint;
    private _buildRewriteCondition;
    moveTo(newPath: string, method?: HttpMethod | undefined): Endpoint;
    remove(responseData?: ResponseData | null): Endpoint;
    renameTo(newPath: string, method?: HttpMethod | undefined, responseData?: ResponseData | null): Endpoint;
    addRequestMiddlewareTo(app: express.Application): void;
    addResponseMiddlewareTo(app: express.Application): void;
    apply(plugin: Plugin<Endpoint>): Endpoint;
}
export declare function createDefaultProxyResponse(): {
    status: number;
    data: any;
    headers: any;
};
export declare type Rewriter = (req: express.Request, res: ProxyResponse) => (Promise<void> | void);
export declare type RewriteCondition = RewriteConditionFn | ConditionMatcher;
export declare type RewriteConditionFn = (req: ProxyRequest, res: ProxyResponse) => (Promise<boolean> | boolean);
export declare type Plugin<T> = (host: T) => void;
export interface MiddlewareFactory {
    addRequestMiddlewareTo(app: express.Application): void;
    addResponseMiddlewareTo(app: express.Application): void;
}
export interface ProxyResponse extends express.Response {
    response: {
        data: any;
        status: number;
        headers: AxiosResponseHeaders;
    };
}
export interface ProxyRequest extends express.Request {
    rewritePath?: string;
    originPath?: string;
    rewriteParams?: Record<string, string>;
    rewriteMethod?: HttpMethod;
    isEarlyReturn?: boolean;
    earlyReturnResponse?: ResponseData;
    upStream?: string;
}
export interface ResponseData {
    status?: number;
    data?: any;
    headers?: Record<string, any>;
}
export declare type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "CONNECT" | "OPTIONS" | "TRACE";
export declare const DEFAULT_UPSTREAM = "default";
