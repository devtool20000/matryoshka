import {OverrideResponse, ProxyServer} from '../index'

const server = new ProxyServer({
  upstreamUrl:"http://localhost:3000",
  port:8080
})

// now when you call http://localhost:8080/new-posts
// it will redirect the request to http://localhost:3000/posts
server.proxy("posts")
  .renameTo("new-posts")

// this will remove comments and return 404 when calling http://localhost:8080/comments
server.remove("comments")

// this will add a new endpoint http://localhost:8080/new-endpoint for GET method and return {success:true}
server.addEndPoint("new-endpoint","GET").response(
  OverrideResponse({
    success:true
  })
)

// server running
server.serve()
