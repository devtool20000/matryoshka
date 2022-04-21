import {ProxyServer} from'../index'

const server = new ProxyServer({
  upstreamUrl:"http://localhost:3000",
  port:8080
})

// now when you call http://localhost:8080/new-posts
// it will redirect the request to http://localhost:3000/posts
server.proxy("posts")
  .renameTo("new-posts")

// server running
server.serve()
