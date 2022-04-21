# Matryoshka

Create a mock API Gateway by rewrite your existing APIs with mock fields and generating new API on the fly. 

## Installation

```bash
# npm
npm i matryoshka-server

# yarn
yarn add matryoshka-server
```

## QuickStart

### Start the proxy server

1. create a file ```server.js``` with the following content.

```js
const {ProxyServer} = require('matryoshka-server')

const server = new ProxyServer({
  upstreamUrl: "http://localhost:3000",
  port: 8081
})

// The proxy server forward
// all the request to the upStreamUrl and 
// change the name of 'posts' API to 'new-posts'

// now when you call http://localhost:8081/new-posts
// it will redirect the request to http://localhost:3000/posts
server.proxy("posts")
  .renameTo("new-posts")

// server running 
server.serve()

```

2. Run ```node server.js``` and you can access your proxy server on [http://localhost:8081](http://localhost:8081)
3. To generate a public https url (especially for mobile development),
    * Download [localtunnel](https://github.com/localtunnel/localtunnel#globally) and run ```lt -p 8081```.
    * This will generate a https url for your proxy server

## Basic Functions

### update/delete/create API Endpoints

```ts
const {OverrideResponse, ProxyServer} = require('matryoshka-server')

const server = new ProxyServer({
   upstreamUrl:"http://localhost:3000",
   port:8080
})

// rename http://localhost:3000/posts => http://localhost:8080/new-posts
server.proxy("posts")
        .renameTo("new-posts")

// remove http://localhost:8080/comments (return 404)
server.remove("comments")

// create GET http://localhost:8080/new-endpoint (return {success:true})
server.addEndPoint("new-endpoint","GET").response(
        OverrideResponse({
           success:true
        })
)

// server running
server.serve()

```

### Rewrite request and response

```js
...

server.updateEndPoint("posts","GET")
  // rewrite request
  .request(
    // update query
    // when you call      http://localhost:8080/posts?page=2&page_size=2&new_name=value
    // it will convert to http://localhost:3000/posts?_page=2&_limit=2&old_name=value
    RewriteQuery({
      // rename query parameters
      rename:{
        "page":"_page",
        "page_size":"_limit",
        "new_name":"old_name"
      }
    }),
    // update body
    RewriteBody({
      rename:{
        "new_name":"old_name",
        "field1":{
          "field2":"old_name2" // nested field
        }
      },
      // update body parameters
      update:{
        "field3.field4": "new value", // set new value
        "field5.field6": (currentValue:number)=>currentValue * 2, // set new value according to current value
      }
    }),
    RewriteHeader({
      add:{
        "New-Header":"some value" // add new header
      }
    })
  )
  .proxy() // call upstream
  .response(
    // rewrite response
    RewriteResponse({
      add:{
        "[].new_field":"new_value" // add new field on every item inside array
      }
    }),
    // rewrite return status code
    OverrideStatus(201),
    // rewrite response header
    RewriteResponseHeader({
      remove:{
        vary:true
      }
    })
  )

...
```

### Conditional rewrite
```js

server.updateEndPoint("posts","GET")
        .proxy()
        // when status code is 200
        .when(Status(200),
                RewriteResponse({
                   add:{
                      "[].new_field":"new_value" // add new field on every item inside array
                   }
                })
        )
        // when status code is not 200
        .when(not(Status(200)),
                RewriteResponse({
                   add:{
                      "error":"some error message"
                   }
                })
        )


```

### Generate Mock data
```js
server.addEndPoint("users","GET")
        .proxy()
        // generate mock data
        .response(
                OverrideResponse(Template({
                   status:"some_code", // add hard code value
                   "data[+3]":{ // generate an array of length 3
                      id:1,
                      avatar:Fake("image.avatar"), // generate fake value from @faker-js https://github.com/faker-js/faker
                      firstName:values("name 1","name 2"), // generate fake value from hard value list
                      lastName:Fake("name.lastName"),
                      fullName:values("firstname lastname",FakeExpr("{{name.firstName}} {{name.lastName}}")) // combine hardcode value with @faker-js
                   }
                }))
        )

```
### Connect to multiple proxy servers

```js
...
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

...
```


