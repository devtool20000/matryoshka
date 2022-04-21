import {
  Fake, FakeExpr,
  OverrideResponse,
  ProxyServer, RewriteResponse,
  Template, TemplateArray, values
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

server.addEndPoint("books","GET")
  .proxy()
  // generate mock data
  .response(
    OverrideResponse(TemplateArray({
      id:values(1,2),
      name:values("name1","name2")
    },2))
  )

server.updateEndPoint("posts","GET")
  .proxy()
  // generate mock data
  .response(
    RewriteResponse({
      add:{
        "[]":{
          newField:values(1,2,3),
          "nestArray[+3]":{
            name:Fake("name.firstName")
          }
        }
      }
    })
  )

// server running
server.serve()
