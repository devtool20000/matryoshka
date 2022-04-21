import { generateArray, generateObject } from "../mock/ObjectGenerator";
export function Template(template) {
    return generateObject(template);
}
export function TemplateArray(template, count = 2) {
    return generateArray(template, count);
}
//# sourceMappingURL=Generator.js.map