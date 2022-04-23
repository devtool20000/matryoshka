import { GenerateValueFactory, GeneratorFactory, VariableGeneratorFactory } from "./MockGenerator";
import { RewriteFn } from "../server/Rewriter";
export interface ObjectUpdate {
    move?: JsonTemplate;
    rename?: JsonTemplate;
    remove?: JsonTemplate;
    add?: JsonTemplate;
    update?: JsonTemplate;
}
export declare type UpdatePrimitiveValue = boolean | null | string | number;
export declare type UpdateFunction = (current: any) => any;
export declare type UpdateMetaValue = UpdatePrimitiveValue | UpdatePrimitiveValue[] | GenerateValueFactory<any> | VariableGeneratorFactory<any> | GeneratorFactory<any> | UpdateFunction;
export interface UpdateUnit {
    path: string;
    value: UpdateMetaValue;
}
export interface JsonTemplate {
    [key: string]: UpdateMetaValue | JsonTemplate;
}
declare class GeneralUpdater {
    updateUnits: UpdateUnit[];
    constructor(meta: JsonTemplate | undefined);
    updateObject(obj: any, skip?: number): void;
}
export declare class AddUpdater extends GeneralUpdater {
    updateFns: {
        path: string;
        generatorFactory: GeneratorFactory<any>;
    }[];
    constructor(meta: JsonTemplate | undefined);
    updateObject(obj: any, skip?: number): void;
}
export declare class UpdateUpdater extends GeneralUpdater {
    updateObject(obj: any, skip?: number): void;
}
export declare class RemoveUpdater extends GeneralUpdater {
    updateObject(obj: any, skip?: number): void;
}
export declare class MoveUpdater extends GeneralUpdater {
    updateObject(obj: any, skip?: number): void;
}
export declare class RenameUpdater extends GeneralUpdater {
    updateObject(obj: any, skip?: number): void;
}
export declare function updateObject(obj: any, ...updates: RewriteFn[]): any;
export declare function updateObject(obj: any, skip: number, ...updates: RewriteFn[]): any;
export declare function Add(name: string, value: UpdateMetaValue): RewriteFn;
export declare function Add(jsonTemplate: JsonTemplate): RewriteFn;
export declare function Remove(...names: string[]): RewriteFn;
export declare function Remove(jsonTemplate: JsonTemplate): RewriteFn;
export declare function Rename(name: string, value: string): RewriteFn;
export declare function Rename(jsonTemplate: JsonTemplate): RewriteFn;
export declare function Move(from: string, to: string): RewriteFn;
export declare function Move(jsonTemplate: JsonTemplate): RewriteFn;
export declare function Update(name: string, value: UpdateMetaValue): RewriteFn;
export declare function Update(jsonTemplate: JsonTemplate): RewriteFn;
export declare function normalizeUpdateUnitValue(updateUnit: UpdateUnit, variables?: Record<string, any>): {
    path: string;
    generatorFactory: GeneratorFactory<any>;
};
export {};
