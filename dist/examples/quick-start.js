"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const server = new index_1.ProxyServer({
    upstreamUrl: "http://localhost:3000",
    port: 8080
});
// now when you call http://localhost:8080/new-posts
// it will redirect the request to http://localhost:3000/posts
server.proxy("posts")
    .renameTo("new-posts");
// server running
server.serve();
//# sourceMappingURL=quick-start.js.map