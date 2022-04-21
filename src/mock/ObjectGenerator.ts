import {normalizeUpdateUnitValue, JsonTemplate, UpdateMetaValue, updateObject, UpdateUnit} from "./ObjectUpdater";
import {flattenHierarchy} from "../utils/Flatten";
import clonedeep from 'lodash/clonedeep';
import {deepSet} from "../utils/DeepOperation";



export function generateObject(template:JsonTemplate, skip:number = 0, sizeMap:Record<string, number> = {}, variablesMap:Record<string, any>={}): any{
  let updateUnits = flattenHierarchy<UpdateUnit>(template)
  const result = {}
  updateUnits = _replaceSizeVariables(updateUnits,sizeMap)
  const updateFns = updateUnits.map((x)=>{
    return normalizeUpdateUnitValue(x,variablesMap)
  })
  for (let updateFn of updateFns) {
    deepSet(result, updateFn.path, updateFn.generatorFactory(skip))
  }
  return result
}

export function generateArray(template:JsonTemplate, arraySize:number=2, skip:number = 0, sizeMap:Record<string, number> = {}, variables:Record<string, any>={}):any {

  const generateTemplate = {
    [`root[+${arraySize}]`]:template
  }
  const rawResult = generateObject(generateTemplate,skip,sizeMap,variables)
  return rawResult["root"]
}


function _replaceSizeVariables(updateUnits:UpdateUnit[],size:Record<string, number>): UpdateUnit[]{
  if(Object.keys(size).length === 0){
    return updateUnits
  }
  const _updateUnits = clonedeep(updateUnits)
  for(let unit of _updateUnits){
    for(let variableName of Object.keys(size)){
      const variableValue = size[variableName]
      unit.path = unit.path.replace(`[+${variableName}]`,`[+${variableValue}]`)
    }
  }
  return _updateUnits
}
