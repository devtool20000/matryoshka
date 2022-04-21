import clonedeep from 'lodash.clonedeep';
import {JsonTemplate} from "./ObjectUpdater";
import {generateObject} from "./ObjectGenerator";


export class MockGenerator<T> {

  private values: T[] = []
  public generatorFactory: GeneratorFactory<T>
  private generateValueFactory: GenerateValueFactory<T> | null

  constructor(values: T[] = [], generateValueFactory: GenerateValueFactory<T> | null = null) {
    this.values = values
    this.generateValueFactory = generateValueFactory

    if (!generateValueFactory && values.length == 0) {
      throw new Error(`both generatorFactory and values are empty. Can't generate any values`)
    }
    if (!generateValueFactory) {
      this.generatorFactory = this.createLoopValuesGeneratorFactory()
    }
    else {
      this.generatorFactory = this.createFirstValuesWithFollowingGeneratorFactory()
    }
  }

  private createFirstValuesWithFollowingGeneratorFactory():GeneratorFactory<T>{
    const values = this.values
    const generateValueFactory = this.generateValueFactory!
    return function (skip) {
      let counter = 0
      let generateValueFn = generateValueFactory()
      function* generator() {
        for (let value of values) {
          if (counter >= skip) {
            yield value
          }
          counter++
        }

        while (true) {
          let value = generateValueFn()
          if (counter >= skip) {
            yield value
          }
          counter++
        }
      }
      return generator()
    }
  }

  private createLoopValuesGeneratorFactory():GeneratorFactory<T>{
    let values: T[] = this.values

    return function (skip) {
      let counter = 0
      function* generator() {
        while (true) {
          for (let value of values) {
            if (counter >= skip) {
              yield value
            }
            counter++
          }
        }
      }
      return generator()
    }
  }
}

export function constantValues<T>(...values:(T | GenerateValueFactory<T>)[]): (GeneratorFactory<T>){
  if(values.length === 0){
    throw new Error(`values can't be empty array`)
  }
  const generator = values[values.length - 1]

  if(typeof generator === "function"){
    const hardCodeValues = values.splice(0,values.length-1)
    return new MockGenerator(hardCodeValues,generator as any).generatorFactory as any
  }
  else {
    return new MockGenerator(values,null).generatorFactory as any
  }
}

export function values<T>(...values:(T | GenerateValueFactory<T>)[]): (GeneratorFactory<T> | VariableGeneratorFactory<T>){
  if(values.length === 0){
    throw new Error(`values can't be empty array`)
  }
  const generator = values[values.length - 1]

  const hardCodeValues = typeof generator === "function" ? values.splice(0,values.length-1) : values

  if(hardCodeValues.length > 0 && typeof hardCodeValues[0] === "string"){
    for(let hardCodeValue of (hardCodeValues as any)){
      if(hasVariable(hardCodeValue)){

        // return replace variable values
        const variableGeneratorFactory = (variables:Record<string, any>)=>{
          const replacedHardCodeValues = clonedeep(hardCodeValues) as any
          for(let variableName of Object.keys(variables)){
            const variableValue = variables[variableName]
            for (let i = 0; i < replacedHardCodeValues.length; i++) {
              const value = replacedHardCodeValues[i]
              replacedHardCodeValues[i] = value.replace(`{{${variableName}}}`,variableValue)
            }
          }
          if(typeof generator === "function"){
            return new MockGenerator(replacedHardCodeValues,generator as any).generatorFactory as any
          }
          else {
            return new MockGenerator(replacedHardCodeValues,null).generatorFactory as any
          }
        }
        variableGeneratorFactory.$type = GeneratorType.variableGenerator
        return variableGeneratorFactory
      }
    }
  }

  if(typeof generator === "function"){
    return new MockGenerator(hardCodeValues,generator as any).generatorFactory as any
  }
  else {
    return new MockGenerator(hardCodeValues,null).generatorFactory as any
  }

}

// TODO: currently use this temp implementation but can have performance issue when loading more data since we always need to reset and then use skip to load next value
export function FakeObject(template:JsonTemplate) : GenerateValueFactory<any> {
  return ()=> {
    let cursor = 0
    return ()=> {
      const value =  generateObject(template,cursor)
      cursor++
      return value
    }
  }
}



export type GeneratorFactory<T> = (skip: number) => Generator<T, any, boolean>
export type VariableGeneratorFactory<T> = (variables:Record<string, any>)=>(skip: number) => Generator<T, any, boolean>
export type GenerateValueFactory<T> = ()=>()=>T
export const GeneratorType = {
  variableGenerator:"variable-generator"
}

export function hasVariable(text:string) :boolean {
  return text.indexOf("{{") !== -1 && text.indexOf("}}") !== -1
}



