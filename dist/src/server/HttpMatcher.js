"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LargeThan = exports.LargeEqual = exports.LessEqual = exports.LessThan = exports.Exist = exports.NotExist = exports.Response = exports.ResponseHeader = exports.Body = exports.Query = exports.Header = void 0;
const ConditionMatcher_1 = require("./ConditionMatcher");
function Header(name, value) {
    if (typeof name === "string") {
        name = {
            [name.toLowerCase()]: value
        };
    }
    const config = name;
    for (let key of Object.keys(config)) {
        const value = config[key];
        delete config[key];
        config[key.toLowerCase()] = value;
    }
    return new ConditionMatcher_1.StructureConditionMatcher((req, res) => req.headers, name);
}
exports.Header = Header;
function Query(name, value) {
    if (typeof name === "string") {
        name = {
            [name]: value
        };
    }
    const config = name;
    return new ConditionMatcher_1.StructureConditionMatcher((req, res) => req.query, name, (value) => (x) => String(value) === x);
}
exports.Query = Query;
function Body(name, value) {
    if (typeof name === "string") {
        name = {
            [name]: value
        };
    }
    const config = name;
    return new ConditionMatcher_1.StructureConditionMatcher((req, res) => req.body, name);
}
exports.Body = Body;
function ResponseHeader(name, value) {
    if (typeof name === "string") {
        name = {
            [name.toLowerCase()]: value
        };
    }
    const config = name;
    for (let key of Object.keys(config)) {
        const value = config[key];
        delete config[key];
        config[key.toLowerCase()] = value;
    }
    return new ConditionMatcher_1.StructureConditionMatcher((req, res) => {
        return res.response.headers;
    }, name);
}
exports.ResponseHeader = ResponseHeader;
function Response(name, value) {
    if (typeof name === "string") {
        name = {
            [name]: value
        };
    }
    const config = name;
    return new ConditionMatcher_1.StructureConditionMatcher((req, res) => res.response.data, name);
}
exports.Response = Response;
const NotExist = (x) => !x;
exports.NotExist = NotExist;
const Exist = (x) => x;
exports.Exist = Exist;
function LessThan(value) {
    return (x) => x < value;
}
exports.LessThan = LessThan;
function LessEqual(value) {
    return (x) => x <= value;
}
exports.LessEqual = LessEqual;
function LargeEqual(value) {
    return (x) => x >= value;
}
exports.LargeEqual = LargeEqual;
function LargeThan(value) {
    return (x) => x > value;
}
exports.LargeThan = LargeThan;
//# sourceMappingURL=HttpMatcher.js.map