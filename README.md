# Matryoshka
wrap your existing API with mock fields and endpoints on the fly
## Installation
```bash
# npm
npm i matryoshka-server

# yarn
yarn add matryoshka-server
```

## QuickStart
Start the proxy server
```js
const {ProxyServer} = require('matryoshka-server')

const server = new ProxyServer({
  proxyUrl:"http://localhost:3000",
  port:8080
})

// now when you call http://localhost:8080/new-posts
// it will redirect the request to http://localhost:3000/posts
server.proxy("posts")
  .renameTo("new-posts")

// server running 
server.serve() 

```

Rewrite existing endpoint
```js

```

Add new endpoint
```js

```

connect to multiple proxy servers
```js
```


