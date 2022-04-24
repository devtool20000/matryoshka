# Core Concepts

## Proxy API Gateway
At this core, Matryoshka uses **Proxy API Gateway** to wrap and
redirect API calls from client to upstream servers. the **Proxy API Gateway**
supports more than 1 up stream servers which makes it possible to merge 
existing APIs with other mock APIs (e.g., json-server) or build adapter to create
rapid prototype (e.g., build an adapter for ElasticSearch).

Basically, there are two upstream servers: **Main Upstream** and **Extra Upstreams**. For **Main Upstream**
Matryoshka server will forward all requests which won't match any **Extra Upstreams** to **Main Upstream** without further configuration. 
Here is the config for Proxy API Gateway. You just need to give the Base Url for 
each upstreams
```js
const server = new ProxyServer({
  upstreamUrl:"http://localhost:3000", // Main Upstream: your existing API here
  port:8080,
  upstreams:{
    // add new upstream servers
    "server2":{
      upstreamUrl:"http://localhost:3001" // Extra Upstream: might connect to mock APIs
    },
    "server3":{
      upstreamUrl:"http://localhost:3002" // Extra Upstream: might be adapter to other rapid prototype service 
    }
  }
})
```

To use **Extra Upstreams**, you need to specify them in endpoint rewrite
```js
server.proxy("comments").from("server2") // specify the name of extra upstream server
  .renameTo("server2-comments") 

```

## API Rewrite
Matryoshka supports 3 different rewrite operation:
* Remove an existing API
* Update an existing API
* Add a new mock API

### Remove an existing API
Remove API is to hide an API from existing endpoints and return 404 by default. 
```js
server.remove("comments") // remove the API from upstream
server.remove("comments","GET") // only remove the GET method on /comments
```

sometimes, we might want a custom 405 error message globally and you can config it in ```ProxyServer```'s 
config
```js
const server = new ProxyServer({
  upstreamUrl:"http://localhost:3000", // Main Upstream: your existing API here
  default:{
    notFoundResponseData:{ // add it here
      status:405,
      data:{
        "message":"Method Not Found"
      },
      headers:{
        // ...
      }
    }
  }
})
```

### Update an existing API
You can also update existing API in several ways:
* Rename the API path or method
* Rewrite the API Request
* Rewrite the API Response

#### Rename the API path or http method
Backend team might want to change the name of API and sometimes even
change the http Method. A classic case for this is initially the Backend team use 
GET for search endpoint while later find they want to support complex search criteria
and thus want to change it to POST method and put the criteria in body. 

Matryoshka supports these Out-of-box by using the ```renameTo``` method
```js
// rename an API Endpoint for all Http method 
server.updateEndPoint("articles").renameTo("new-articles")

// rename only Get method
server.updateEndPoint("articles","GET").renameTo("new-articles")

// rename API Endpoint while also change the Http method
server.updateEndPoint("search","GET").renameTo("new-search","POST")

// rename API with path parameters, you need to keep the path parameters the same in both old and new path
server.updateEndPoint("posts/:id","GET").renameTo("new-posts/:id","GET")

// rewrite for a specific Extra Upstream
server.updateEndPoint("articles").renameTo("new-articles").from("extra-upstream-name")
```

#### Rewrite the API Request

#### Rewrite the API Response












### Add a new mock API
