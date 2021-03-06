import {ProxyServer, ServerOptions} from "../src/server/Server";
import {constantValues, values} from "../src/mock/MockGenerator";
import {ConditionMatcher, not, Status} from "../src/server/ConditionMatcher";
import {Body, Exist, Header, LessThan, NotExist, Query, Response, ResponseHeader} from "../src/server/HttpMatcher";
import {
  OverrideResponse,
  RewriteBody,
  RewriteHeader,
  RewriteQuery,
  RewriteResponse,
  RewriteResponseHeader,
  OverrideStatus, CreateResponse, Break, ExtractResponse, From
} from "../src/server/Rewriter";
import {Endpoint} from "../src/server/Endpoint";
import {Add, JsonTemplate} from "../src/mock/ObjectUpdater";
import {Template, TemplateArray} from "../src/server/Generator";
import {Fake, FakeExpr} from "../src/mock/FakerField";
import {generateObject} from "../src/mock/ObjectGenerator";



const config: ServerOptions = {
  upstreamUrl: "localhost:3000",
  port:8080,
  upstreams:{
    json:{
      upstreamUrl:"http://localhost:8000"
    }
  }
}


const server = new ProxyServer(config)


server.addEndPoint("some","GET",{data:{abc:1}})
  .when(Query("test",1),
    OverrideResponse({test:1}),
    Break
  )
  .when(Query("test",2),
    OverrideResponse({test2:2}),
    Break
  )
  .response(
    RewriteResponse(
      Add("final",1)
    )
  )

server.addEndPoint("t2","GET")
  .response(
    OverrideResponse({
      result_code:2003,
      hits:{
        data:[
          {a:1},
          {a:2},
        ]
      }
    }),
    ExtractResponse({
      data: From("hits.data")
    }),
    RewriteResponse(
      Add("data[].b",values(1,2))
    )
  )

server.proxy("posts")
// .from("json")
// server.updateEndPoint("posts/:id","GET").from("json")
//   .renameTo("test/:id","GET")

function PaginationTemplate(template:JsonTemplate):CreateResponse{
  return (req,res)=>{
    const offset = req.query.start_key ? Number(req.query.start_key) : 0
    const pageSize = req.query.page_size ? Number(req.query.page_size) : 5
    return generateObject(template,offset,{pageSize:pageSize})
  }
}


server.addEndPoint("some2","GET")
  .when(Status((code)=>code < 300).and(Response("status","some_success_code")),
    OverrideResponse(Template({
      "result": {
      },
      data:{
        "list[+2]":{
          name:Fake("name.firstName")
        }
      }
    }))
  )
  .when(Query("name",2),
    OverrideResponse(TemplateArray({
      name:Fake("name.firstName")
    },5))
  )
  .when(Query("name",3),
    OverrideResponse(PaginationTemplate({
      "list[+pageSize]":{
        name:values(1,2,3,4,5,6,7,8),
        username: FakeExpr("{{name.firstName}} {{name.lastName}}")
      }
    }))

  )

server.serve()


