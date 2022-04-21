import {
  GenerateValueFactory,
  GeneratorFactory,
  constantValues,
  GeneratorType,
  VariableGeneratorFactory, values, hasVariable
} from "./MockGenerator";
import {deepGet, deepSet} from "../utils/DeepOperation";
import {flattenHierarchy} from "../utils/Flatten";

export interface ObjectUpdate {
  move?: JsonTemplate, // for absolute
  rename?: JsonTemplate, // for local
  remove?: JsonTemplate
  add?: JsonTemplate
  update?: JsonTemplate
}


export type UpdatePrimitiveValue = boolean | null | string | number
export type UpdateFunction = (current: any) => any
export type UpdateMetaValue =
  UpdatePrimitiveValue
  | UpdatePrimitiveValue[]
  | GenerateValueFactory<any>
  | VariableGeneratorFactory<any>
  | GeneratorFactory<any>
  | UpdateFunction

export interface UpdateUnit {
  path: string
  value: UpdateMetaValue
}

export interface JsonTemplate {
  [key: string]: UpdateMetaValue | JsonTemplate
}




class GeneralUpdater {
  updateUnits: UpdateUnit[] = []

  constructor(meta: JsonTemplate | undefined) {
    if(meta){
      this.updateUnits = flattenHierarchy(meta)
    }

  }

  updateObject(obj: any, skip: number = 0) {
    throw new Error("unimplemented")
  }

}

export class AddUpdater extends GeneralUpdater {
  updateFns: { path: string, generatorFactory: GeneratorFactory<any> }[] = []

  constructor(meta: JsonTemplate | undefined) {
    super(meta);
    for (let updateUnit of this.updateUnits) {
      // TODO: currently we use function parameter count to distinguish GenerateValueFactory and GeneratorFactory, better to use other method so when we add new elements, it won't break
      this.updateFns.push(normalizeUpdateUnitValue(updateUnit))
    }
  }

  updateObject(obj: any, skip: number = 0) {
    for (let updateFn of this.updateFns) {
      deepSet(obj, updateFn.path, updateFn.generatorFactory(skip))
    }
  }
}

// TODO: make updateUpdater simple for now, just allow user to update the value according to current value. (This can't track fields accurately)
export class UpdateUpdater extends GeneralUpdater {
  updateObject(obj: any,skip:number = 0) {
    for (let updateFn of this.updateUnits) {
      const oldValue = deepGet(obj, updateFn.path)
      if(typeof updateFn.value === "function"){
        const fn = updateFn.value as UpdateFunction

        if (Array.isArray(oldValue)) {
          deepSet(obj, updateFn.path, constantValues(...oldValue.map(x=>fn(x)))(0))
        } else {
          deepSet(obj, updateFn.path, fn(oldValue))
        }
      }
    else {
        if (Array.isArray(oldValue)) {
          deepSet(obj, updateFn.path, constantValues(updateFn.value)(0))
        } else {
          deepSet(obj, updateFn.path, updateFn.value)
        }
      }


    }
  }
}

export class RemoveUpdater extends GeneralUpdater {
  updateObject(obj: any, skip: number = 0) {
    for (let updateFn of this.updateUnits) {
      if(updateFn.value){
        deepSet(obj,updateFn.path,undefined)
      }
    }
  }
}

export class MoveUpdater extends GeneralUpdater {
  updateObject(obj: any, skip: number = 0) {
    for (let updateFn of this.updateUnits) {
      if(typeof updateFn.value === "string"){
        const newPath = updateFn.value
        const existingValues = deepGet(obj,updateFn.path)
        deepSet(obj,newPath,(constantValues(...existingValues))(0))
        deepSet(obj,updateFn.path,undefined)
      }
    }
  }
}

export class RenameUpdater extends GeneralUpdater {
  updateObject(obj: any, skip: number = 0) {
    for (let updateFn of this.updateUnits) {
      if(typeof updateFn.value === "string"){
        const newField = updateFn.value
        const existingPath = updateFn.path
        const index = existingPath.lastIndexOf(".")
        const newPath = existingPath.substring(0,index) + "." + newField
        let existingValues = deepGet(obj,updateFn.path)
        if(!Array.isArray(existingValues)){
          existingValues = [existingValues]
        }
        deepSet(obj,newPath,constantValues(...existingValues)(0))
        deepSet(obj,updateFn.path,undefined)
      }
    }
  }
}

export function updateObject(obj:any,toUpdate:ObjectUpdate,skip:number = 0){
  new RenameUpdater(toUpdate.rename).updateObject(obj,skip)
  new MoveUpdater(toUpdate.move).updateObject(obj,skip)
  new RemoveUpdater(toUpdate.remove).updateObject(obj,skip)
  new AddUpdater(toUpdate.add).updateObject(obj,skip)
  new UpdateUpdater(toUpdate.update).updateObject(obj,skip)
}

export function normalizeUpdateUnitValue(updateUnit:UpdateUnit, variables:Record<string, any> = {}): { path: string, generatorFactory: GeneratorFactory<any> }{
  // TODO: this is a ugly fix which avoid issue in generate template
  // we use this to detect const value with variable
  if(typeof updateUnit.value === "string" && hasVariable(updateUnit.value)){
    const value = updateUnit.value
    updateUnit.value = values(value)
  }

  if (typeof updateUnit.value === "function") {
    // VariableGeneratorFactory
    if((updateUnit.value as any).$type === GeneratorType.variableGenerator){
      return {
        path: updateUnit.path,
          generatorFactory: updateUnit.value(variables) as GeneratorFactory<any>
      }
    }
    // GeneratorFactory
    else if (updateUnit.value.length === 1) {
      return {
        path: updateUnit.path,
        generatorFactory: updateUnit.value as GeneratorFactory<any>
      }
    }
    // GenerateValueFactory
    else if (updateUnit.value.length === 0) {
      return {
        path: updateUnit.path,
        generatorFactory: constantValues(updateUnit.value)
      }
    }
  }
  // primitive values
  else {
    return {
      path: updateUnit.path,
      generatorFactory: values(updateUnit.value) as GeneratorFactory<any>
    }
  }

  return updateUnit as any // we will never reach here
}
