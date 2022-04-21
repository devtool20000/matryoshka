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
exports.RewriteHeader = exports.RewriteQuery = exports.RewriteBody = exports.OverrideStatus = exports.RewriteResponseHeader = exports.OverrideResponse = exports.RewriteResponse = void 0;
const ObjectUpdater_1 = require("../mock/ObjectUpdater");
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