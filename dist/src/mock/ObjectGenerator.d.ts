import { JsonTemplate } from "./ObjectUpdater";
export declare function generateObject(template: JsonTemplate, skip?: number, sizeMap?: Record<string, number>, variablesMap?: Record<string, any>): any;
export declare function generateArray(template: JsonTemplate, arraySize?: number, skip?: number, sizeMap?: Record<string, number>, variables?: Record<string, any>): any;
