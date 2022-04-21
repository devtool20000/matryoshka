import {ProxyServer} from'../index'

const server = new ProxyServer({
  upstreamUrl:"http://localhost:3000",
  port:8080,
  upstreams:{
    // add new upstream servers
    "server2":{
      upstreamUrl:"http://localhost:3001" // you can run json-server db2.json --port 3001 to start a new server for this sample
    }
  }
})

server.proxy("posts")
  .renameTo("new-posts")

//
server.proxy("comments").from("server2") // specify the name of upstream server
  .renameTo("server2-comments") // you can try http://localhost:8080/server2-comments

// server running
server.serve()
