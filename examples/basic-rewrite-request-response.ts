import {
  Add,
  OverrideStatus,
  ProxyServer, Remove, Rename,
  RewriteBody,
  RewriteHeader,
  RewriteQuery,
  RewriteResponse, RewriteResponseHeader, Update
} from '../index'

const server = new ProxyServer({
  upstreamUrl:"http://localhost:3000",
  port:8080
})


server.updateEndPoint("posts","GET")
  // rewrite request
  .request(
    // update query
    // when you call      http://localhost:8080/posts?page=2&page_size=2&new_name=value
    // it will convert to http://localhost:3000/posts?_page=2&_limit=2&old_name=value
    RewriteQuery(
      Rename({
        "page":"_page",
        "page_size":"_limit",
        "new_name":"old_name"
      })
    ),
    // update body
    RewriteBody(
      Rename({
        "new_name":"old_name",
        "field1":{
          "field2":"old_name2" // nested field
        }
      }),
      Update({
        "field3.field4": "new value", // set new value
        "field5.field6": (currentValue:number)=>currentValue * 2, // set new value according to current value
      })
    ),
    RewriteHeader(
      Add({
        "new-header":"some value" // add new header
      })
    )
  )
  .proxy() // call upstream
  .response(
    // rewrite response
    RewriteResponse(
      Add({
        "[].new_field":"new_value" // add new field on every item inside array
      })
    ),
    // rewrite return status code
    OverrideStatus(201),
    // rewrite response header
    RewriteResponseHeader(
      Remove("vary")
    )
  )


// server running
server.serve()
