"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Break = exports.extractObject = exports.OriginalResponse = exports.From = exports.ExtractResponse = exports.RewriteHeader = exports.RewriteQuery = exports.RewriteBody = exports.OverrideStatus = exports.RewriteResponseHeader = exports.OverrideResponse = exports.RewriteResponse = void 0;
const ObjectUpdater_1 = require("../mock/ObjectUpdater");
const DeepOperation_1 = require("../utils/DeepOperation");
const Flatten_1 = require("../utils/Flatten");
function RewriteResponse(updates) {
    return (req, res) => {
        (0, ObjectUpdater_1.updateObject)(res.response.data, updates);
    };
}
exports.RewriteResponse = RewriteResponse;
function OverrideResponse(obj) {
    return (req, res) => __awaiter(this, void 0, void 0, function* () {
        const result = typeof obj === "function" ? yield obj(req, res) : obj;
        res.response.data = result;
    });
}
exports.OverrideResponse = OverrideResponse;
function RewriteResponseHeader(updates) {
    return (req, res) => {
        (0, ObjectUpdater_1.updateObject)(res.response.headers, updates);
    };
}
exports.RewriteResponseHeader = RewriteResponseHeader;
function OverrideStatus(statusCode) {
    return (req, res) => {
        res.response.status = statusCode;
    };
}
exports.OverrideStatus = OverrideStatus;
function RewriteBody(updates) {
    return (req, res) => {
        (0, ObjectUpdater_1.updateObject)(req.body, updates);
    };
}
exports.RewriteBody = RewriteBody;
function RewriteQuery(updates) {
    return (req, res) => {
        (0, ObjectUpdater_1.updateObject)(req.query, updates);
    };
}
exports.RewriteQuery = RewriteQuery;
function RewriteHeader(updates) {
    const lowerKeyedUpdates = {};
    for (let key of Object.keys(updates)) {
        lowerKeyedUpdates[key] = lowerKey(updates[key], key === "rename");
    }
    return (req, res) => {
        (0, ObjectUpdater_1.updateObject)(req.headers, lowerKeyedUpdates);
    };
}
exports.RewriteHeader = RewriteHeader;
function ExtractResponse(selector) {
    return (req, res) => {
        res.response.data = extractObject(res.response.data, selector);
    };
}
exports.ExtractResponse = ExtractResponse;
function From(selector, ...converters) {
    return (obj) => {
        let value = (0, DeepOperation_1.deepGet)(obj, selector);
        for (let convertor of converters) {
            value = convertor(value);
        }
        return value;
    };
}
exports.From = From;
const OriginalResponse = (obj) => obj;
exports.OriginalResponse = OriginalResponse;
function extractObject(obj, selector) {
    if (typeof selector === "function") {
        return selector(obj);
    }
    else if (typeof selector === "string") {
        return (0, DeepOperation_1.deepGet)(obj, selector);
    }
    else {
        const extractFns = (0, Flatten_1.flattenHierarchy)(selector);
        const target = {};
        for (let extract of extractFns) {
            if (typeof extract.value === "string") {
                (0, DeepOperation_1.deepSet)(target, extract.path, (0, DeepOperation_1.deepGet)(obj, extract.value));
            }
            else {
                (0, DeepOperation_1.deepSet)(target, extract.path, extract.value(obj));
            }
        }
        return target;
    }
}
exports.extractObject = extractObject;
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
const Break = (req, res, next) => {
    next();
};
exports.Break = Break;
//# sourceMappingURL=Rewriter.js.map