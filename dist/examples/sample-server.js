"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = require("../src/server/Server");
const MockGenerator_1 = require("../src/mock/MockGenerator");
const ConditionMatcher_1 = require("../src/server/ConditionMatcher");
const HttpMatcher_1 = require("../src/server/HttpMatcher");
const Rewriter_1 = require("../src/server/Rewriter");
const Generator_1 = require("../src/server/Generator");
const FakerField_1 = require("../src/mock/FakerField");
const ObjectGenerator_1 = require("../src/mock/ObjectGenerator");
const config = {
    upstreamUrl: "localhost:3000",
    port: 8080,
    upstreams: {
        json: {
            upstreamUrl: "http://localhost:8000"
        }
    }
};
const server = new Server_1.ProxyServer(config);
server.addEndPoint("some", "GET", { data: { abc: 1 } })
    .when((0, HttpMatcher_1.Query)("test", 1), (0, Rewriter_1.OverrideResponse)({ test: 1 }), Rewriter_1.Break)
    .when((0, HttpMatcher_1.Query)("test", 2), (0, Rewriter_1.OverrideResponse)({ test2: 2 }), Rewriter_1.Break)
    .response((0, Rewriter_1.RewriteResponse)({
    add: {
        final: 1
    }
}));
server.addEndPoint("t2", "GET")
    .response((0, Rewriter_1.OverrideResponse)({
    result_code: 2003,
    hits: {
        data: [
            { a: 1 },
            { a: 2 },
        ]
    }
}), (0, Rewriter_1.ExtractResponse)({
    data: (0, Rewriter_1.From)("hits.data")
}), (0, Rewriter_1.RewriteResponse)({
    add: {
        "data[].b": (0, MockGenerator_1.values)(1, 2)
    }
}));
server.proxy("posts");
// .from("json")
// server.updateEndPoint("posts/:id","GET").from("json")
//   .renameTo("test/:id","GET")
function PaginationTemplate(template) {
    return (req, res) => {
        const offset = req.query.start_key ? Number(req.query.start_key) : 0;
        const pageSize = req.query.page_size ? Number(req.query.page_size) : 5;
        return (0, ObjectGenerator_1.generateObject)(template, offset, { pageSize: pageSize });
    };
}
server.addEndPoint("some2", "GET")
    .when((0, ConditionMatcher_1.Status)((code) => code < 300).and((0, HttpMatcher_1.Response)("status", "some_success_code")), (0, Rewriter_1.OverrideResponse)((0, Generator_1.Template)({
    "result": {},
    data: {
        "list[+2]": {
            name: (0, FakerField_1.Fake)("name.firstName")
        }
    }
})))
    .when((0, HttpMatcher_1.Query)("name", 2), (0, Rewriter_1.OverrideResponse)((0, Generator_1.TemplateArray)({
    name: (0, FakerField_1.Fake)("name.firstName")
}, 5)))
    .when((0, HttpMatcher_1.Query)("name", 3), (0, Rewriter_1.OverrideResponse)(PaginationTemplate({
    "list[+pageSize]": {
        name: (0, MockGenerator_1.values)(1, 2, 3, 4, 5, 6, 7, 8),
        username: (0, FakerField_1.FakeExpr)("{{name.firstName}} {{name.lastName}}")
    }
})));
server.serve();
//# sourceMappingURL=sample-server.js.map