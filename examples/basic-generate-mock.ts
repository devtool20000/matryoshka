import {
  Fake, FakeExpr,
  OverrideResponse,
  ProxyServer,
  Template, values
} from '../index'

const server = new ProxyServer({
  upstreamUrl:"http://localhost:3000",
  port:8080
})


server.addEndPoint("users","GET")
  .proxy()
  // generate mock data
  .response(
    OverrideResponse(Template({
      status:"some_code", // add hard code value
      "data[+3]":{ // generate an array of length 3
        id:1,
        avatar:Fake("image.avatar"), // generate fake value from @faker-js
        firstName:values("name 1","name 2"), // generate fake value from hard value list
        lastName:Fake("name.lastName"),
        fullName:values("firstname lastname",FakeExpr("{{name.firstName}} {{name.lastName}}")) // combine hardcode value with @faker-js
      }
    }))
  )

// server running
server.serve()
