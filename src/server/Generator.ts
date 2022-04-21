import {generateArray, generateObject} from "../mock/ObjectGenerator";
import {JsonTemplate} from "../mock/ObjectUpdater";

export function Template(template:JsonTemplate){
  return generateObject(template)
}

export function TemplateArray(template:JsonTemplate, count:number = 2){
  return generateArray(template,count)
}
