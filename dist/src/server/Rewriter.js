var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { updateObject } from "../mock/ObjectUpdater";
export function RewriteResponse(updates) {
    return (req, res) => {
        updateObject(res.response.data, updates);
    };
}
export function OverrideResponse(obj) {
    return (req, res) => __awaiter(this, void 0, void 0, function* () {
        const result = typeof obj === "function" ? yield obj(req, res) : obj;
        res.response.data = result;
    });
}
export function RewriteResponseHeader(updates) {
    return (req, res) => {
        updateObject(res.response.headers, updates);
    };
}
export function OverrideStatus(statusCode) {
    return (req, res) => {
        res.response.status = statusCode;
    };
}
export function RewriteBody(updates) {
    return (req, res) => {
        updateObject(req.body, updates);
    };
}
export function RewriteQuery(updates) {
    return (req, res) => {
        updateObject(req.query, updates);
    };
}
export function RewriteHeader(updates) {
    const lowerKeyedUpdates = {};
    for (let key of Object.keys(updates)) {
        lowerKeyedUpdates[key] = lowerKey(updates[key], key === "rename");
    }
    return (req, res) => {
        updateObject(req.headers, lowerKeyedUpdates);
    };
}
function lowerKey(obj, isLowerValue = false) {
    const result = {};
    for (let key of Object.keys(obj)) {
        let value = obj[key];
        if (isLowerValue) {
            value = value.toLowerCase();
        }
        result[key.toLowerCase()] = value;
    }
    return result;
}
//# sourceMappingURL=Rewriter.js.map