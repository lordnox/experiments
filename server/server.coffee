
originIsAllowed = (origin) ->
  console.log 'check origin', origin
  # put logic here to detect whether the specified origin is allowed.
  true

WebSocketServer = require("websocket").server
http            = require "http"

server = http.createServer (request, response) ->
  console.log (new Date()) + " Received request for " + request.url
  response.writeHead 404
  response.end()

server.listen 8080, ->
  console.log (new Date()) + " Server is listening on port 8080"

wsServer = new WebSocketServer
  httpServer: server
  autoAcceptConnections: false

store = {}

wsServer.on "request", (request) ->
  console.log "request handler called"
  unless originIsAllowed(request.origin)
    
    # Make sure we only accept requests from an allowed origin
    console.log (new Date()) + " Connection from origin " + request.origin + " rejected."
    return request.reject()

  connection = request.accept "db", request.origin
  console.log (new Date()) + " Connection accepted."

  connection.on "message", (message) ->
    console.log message

    if message.type is "utf8"
      console.log "Received Message: " + message.utf8Data
      connection.sendUTF message.utf8Data
    else if message.type is "binary"
      console.log "Received Binary Message of " + message.binaryData.length + " bytes"
      connection.sendBytes message.binaryData

  connection.on "close", (reasonCode, description) ->
    console.log (new Date()) + " Peer " + connection.remoteAddress + " disconnected."

