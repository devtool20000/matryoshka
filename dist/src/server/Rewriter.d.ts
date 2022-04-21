import { JsonTemplate, ObjectUpdate } from "../mock/ObjectUpdater";
import { ProxyRequest, ProxyResponse, Rewriter } from "./Endpoint";
export declare function RewriteResponse(updates: ObjectUpdate): Rewriter;
export declare function OverrideResponse(obj: CreateResponse | any): Rewriter;
export declare function RewriteResponseHeader(updates: ObjectUpdate): Rewriter;
export declare function OverrideStatus(statusCode: number): Rewriter;
export declare function RewriteBody(updates: ObjectUpdate): Rewriter;
export declare function RewriteQuery(updates: ObjectUpdate): Rewriter;
export declare function RewriteHeader(updates: ObjectUpdate): Rewriter;
export declare function ExtractResponse(selector: string | Converter | JsonTemplate): Rewriter;
export declare function From(selector: string, ...converters: Converter[]): Converter;
export declare const OriginalResponse: (obj: any) => any;
export declare function extractObject(obj: any, selector: string | Converter | JsonTemplate): any;
export declare const Break: Rewriter;
export declare type CreateResponse = (req: ProxyRequest, res: ProxyResponse) => (Promise<any> | any);
export declare type Converter = (value: any) => any;
