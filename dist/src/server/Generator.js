"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateArray = exports.Template = void 0;
const ObjectGenerator_1 = require("../mock/ObjectGenerator");
function Template(template) {
    return (0, ObjectGenerator_1.generateObject)(template);
}
exports.Template = Template;
function TemplateArray(template, count = 2) {
    return (0, ObjectGenerator_1.generateArray)(template, count);
}
exports.TemplateArray = TemplateArray;
//# sourceMappingURL=Generator.js.map