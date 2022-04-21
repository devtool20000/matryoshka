import { JsonTemplate } from "./ObjectUpdater";
export declare class MockGenerator<T> {
    private values;
    generatorFactory: GeneratorFactory<T>;
    private generateValueFactory;
    constructor(values?: T[], generateValueFactory?: GenerateValueFactory<T> | null);
    private createFirstValuesWithFollowingGeneratorFactory;
    private createLoopValuesGeneratorFactory;
}
export declare function constantValues<T>(...values: (T | GenerateValueFactory<T>)[]): (GeneratorFactory<T>);
export declare function values<T>(...values: (T | GenerateValueFactory<T>)[]): (GeneratorFactory<T> | VariableGeneratorFactory<T>);
export declare function FakeObject(template: JsonTemplate): GenerateValueFactory<any>;
export declare type GeneratorFactory<T> = (skip: number) => Generator<T, any, boolean>;
export declare type VariableGeneratorFactory<T> = (variables: Record<string, any>) => (skip: number) => Generator<T, any, boolean>;
export declare type GenerateValueFactory<T> = () => () => T;
export declare const GeneratorType: {
    variableGenerator: string;
};
export declare function hasVariable(text: string): boolean;
