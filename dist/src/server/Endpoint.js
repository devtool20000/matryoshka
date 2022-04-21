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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_UPSTREAM = exports.createDefaultProxyResponse = exports.Endpoint = void 0;
const lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
class Endpoint {
    constructor(path, method) {
        this.path = path;
        this.method = method;
        this.requestRewriters = [];
        this.responseRewriter = [];
        this.isNewEndpoint = false;
        this.isRemove = false;
        this.notFoundResponseData = {};
        this.newEndpointResponseData = {
            status: 200,
            data: DEFAULT_200_BODY,
            headers: DEFAULT_RESPONSE_HEADERS
        };
        this.isAfterProxy = false;
        this._upStream = exports.DEFAULT_UPSTREAM;
    }
    request(...rewriters) {
        this.requestRewriters.push({
            condition: ALWAYS_TRUE,
            rewriter: _mergeSequentialRewriter(rewriters)
        });
        return this;
    }
    forUpStream(upStream) {
        this._upStream = upStream;
        return this;
    }
    from(upStream) {
        return this.forUpStream(upStream);
    }
    proxy() {
        this.isAfterProxy = true;
        return this;
    }
    newEndpoint(responseData = null) {
        this.isNewEndpoint = true;
        this.isAfterProxy = true;
        if (responseData) {
            Object.assign(this.newEndpointResponseData, responseData);
        }
        return this;
    }
    response(...middleware) {
        this.responseRewriter.push({
            condition: ALWAYS_TRUE,
            rewriter: _mergeSequentialRewriter(middleware)
        });
        return this;
    }
    requestWhen(condition, middleware) {
        this.requestRewriters.push({
            condition: this._buildRewriteCondition(condition),
            rewriter: middleware
        });
        return this;
    }
    responseWhen(condition, middleware) {
        this.responseRewriter.push({
            condition: this._buildRewriteCondition(condition),
            rewriter: middleware
        });
        return this;
    }
    when(condition, ...rewriters) {
        if (this.isAfterProxy) {
            this.responseWhen(condition, _mergeSequentialRewriter(rewriters));
            return this;
        }
        else {
            this.requestWhen(condition, _mergeSequentialRewriter(rewriters));
            return this;
        }
    }
    _buildRewriteCondition(condition) {
        if (typeof condition === "function") {
            return condition;
        }
        else {
            return condition.evaluate.bind(condition);
        }
    }
    moveTo(newPath, method = undefined) {
        this.newPath = newPath;
        this.newMethod = method;
        return this;
    }
    remove(responseData = null) {
        this.isRemove = true;
        if (responseData) {
            this.notFoundResponseData = (0, lodash_clonedeep_1.default)(responseData);
        }
        if (!this.notFoundResponseData.status) {
            this.notFoundResponseData.status = 404;
        }
        if (!this.notFoundResponseData.data) {
            this.notFoundResponseData.data = DEFAULT_404_BODY;
        }
        return this;
    }
    renameTo(newPath, method = undefined, responseData = null) {
        this.moveTo(newPath, method);
        this.remove(responseData);
        return this;
    }
    addRequestMiddlewareTo(app) {
        var _a;
        const path = this.path.startsWith("/") ? this.path : `/${this.path}`;
        const guardPath = (_a = this.newPath) !== null && _a !== void 0 ? _a : this.path;
        const _guardPath = guardPath.startsWith("/") ? guardPath : `/${guardPath}`;
        // middle to add meta data on request for following middlewares
        app.use(_guardPath, (req, res, next) => {
            // for new Endpoint, we add a middleware to mark this request is new and don't need to call upstream server
            if (this.isNewEndpoint) {
                req.earlyReturnResponse = (0, lodash_clonedeep_1.default)(this.newEndpointResponseData);
                req.isEarlyReturn = true; // Early return marks the req to return without call proxy
            }
            req.upStream = this._upStream;
            next();
        });
        // add remove endpoint middleware
        if (this.isRemove) {
            // const path = this.path.startsWith("/") ? this.path : `/${this.path}`
            app.use(path, (req, res, next) => {
                var _a, _b, _c;
                if (this.method && req.method !== this.method) {
                    return next();
                }
                if ((_a = this.notFoundResponseData) === null || _a === void 0 ? void 0 : _a.headers) {
                    res.set(this.notFoundResponseData.headers);
                }
                return res.status((_b = this.notFoundResponseData) === null || _b === void 0 ? void 0 : _b.status).json((_c = this.notFoundResponseData) === null || _c === void 0 ? void 0 : _c.data);
            });
        }
        // add moveTo
        const _middleware = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            const guardMethod = (_b = this.newMethod) !== null && _b !== void 0 ? _b : this.method;
            // skip to next earlier when the method is matched
            if (guardMethod && req.method !== guardMethod) {
                return next();
            }
            // convert new path to old path
            if (this.newMethod && this.method) {
                req.rewriteMethod = this.method;
            }
            if (this.newPath) {
                req.rewritePath = this.path.startsWith("/") ? this.path : `/${this.path}`;
                req.originPath = this.newPath.startsWith("/") ? this.newPath : `/${this.newPath}`;
                req.rewriteParams = req.params;
            }
            // activate response according to conditional data
            for (let rewriteUnit of this.requestRewriters) {
                if (yield rewriteUnit.condition(req, res)) {
                    yield rewriteUnit.rewriter(req, res);
                }
            }
            return next();
        });
        app.use(_guardPath, _middleware);
    }
    addResponseMiddlewareTo(app) {
        var _a;
        const guardPath = (_a = this.newPath) !== null && _a !== void 0 ? _a : this.path;
        const _middleware = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            for (let rewriteUnit of this.responseRewriter) {
                if (!(yield rewriteUnit.condition(req, res))) {
                    continue;
                }
                yield rewriteUnit.rewriter(req, res);
            }
            next();
        });
        const path = guardPath.startsWith("/") ? guardPath : `/${guardPath}`;
        app.use(path, _middleware);
    }
    apply(plugin) {
        plugin(this);
        return this;
    }
}
exports.Endpoint = Endpoint;
function _mergeSequentialRewriter(rewriters) {
    return (req, res) => __awaiter(this, void 0, void 0, function* () {
        for (let rewriter of rewriters) {
            yield rewriter(req, res);
        }
    });
}
const DEFAULT_404_BODY = {
    isProxy: true,
    error: "Method Not Found"
};
const DEFAULT_200_BODY = {
    isProxy: true,
    message: "implement a default return value"
};
const DEFAULT_RESPONSE_HEADERS = {
    "content-type": "application/json"
};
function createDefaultProxyResponse() {
    return {
        status: 200,
        data: Object.assign(DEFAULT_200_BODY),
        headers: Object.assign(DEFAULT_RESPONSE_HEADERS)
    };
}
exports.createDefaultProxyResponse = createDefaultProxyResponse;
const ALWAYS_TRUE = (req, res, next) => true;
exports.DEFAULT_UPSTREAM = "default";
//# sourceMappingURL=Endpoint.js.map