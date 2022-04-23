import {
  Add,
  not,
  OverrideStatus,
  ProxyServer,
  RewriteBody,
  RewriteHeader,
  RewriteQuery,
  RewriteResponse, RewriteResponseHeader, Status
} from '../index'

const server = new ProxyServer({
  upstreamUrl:"http://localhost:3000",
  port:8080
})


server.updateEndPoint("posts","GET")
  // rewrite response only when status code is 200
  .proxy()
  // when status code is 200
  .when(Status(200),
    RewriteResponse(
      Add("[].new_field","new_value") // add new field on every item inside array
    )
  )
  // when status code is not 200
  .when(not(Status(200)),
    RewriteResponse(
      Add("error","some error message")
    )
  )

// server running
server.serve()
