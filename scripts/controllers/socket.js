//'use strict';

var app = angular.module('Experimental');

app.controller('SocketController', ['$scope', 'WebSocket', function ($scope, WebSocket) {
  console.log(WebSocket);

  var uuid = function() {
    return Math.random();
  };

  WebSocket.subscribe($scope, ['chat', 'useless']);
  WebSocket.unsubscribe($scope, 'useless');

  // Publish to the chat server
  WebSocket.publish('chat', {
    msg: 'Hello'
  });
  // Sending a request/response to the chat server
  WebSocket.request({
    msg: 'I need a response-scope'
  }, $scope);
  // This time we take response with a callback
  WebSocket.request({
    msg: 'I need a response-callback'
  }, function(data) {
    console.log("Data via callback received", data);
    data.msg = "callback - " + data.msg 
    $scope.messages.push(data);
    $scope.$apply();
  });

  var requests = {};
  var message = function(text, uuid) {
    var time = '';
    if(uuid && uuid in requests) {
      var end = new Date;
      var start = requests[uuid];
      time = end - start;
    }
    $scope.messages.push({
      msg: time + text
    });
  }

  $scope.$on('socket:response', function(event, data) {
    console.log("Data via socket:response received", data);
    data.msg = "socket:response - " + data.msg 
    message(data.msg, data.uuid);
  });

  $scope.$on('socket:publish', function(event, data) {
    console.log("Data via socket:publish received", data);
    data.msg = "socket:publish - " + data.msg 
    message(data.msg, data.uuid);
  })

  $scope.messages = [
    {msg: "The WebSocket-Service still needs a configuration option"}
  ];

  $scope.publish = function(text) {
    var id = uuid();
    requests[id] = new Date;
    WebSocket.publish('chat', {
      msg: text,
      uuid: id
    });
  };
  $scope.request = function(text) {
    var id = uuid();
    requests[id] = new Date;
    // using only the $scope method, callback would also work here
    WebSocket.request({
      msg: text,
      uuid: id
    }, $scope);
  };
}]);

app.factory('WebSocket', ['$q', '$rootScope', function($q, $rootScope) {
  var log = function(msg, data) {
    var args = Array.prototype.slice.call(arguments, 1);
    console.log(new Date, msg, args);
    return msg;
  };

  var uuid = function() {
    return Math.random();
  };

  var socket    = null
    , onReady   = []
    , responses = {}
    , pubsub    = {
        prevent: [],
        channels: {}
      }
    ;

  var broadcast = function(channel, data) {
        if(!pubsub.channels.hasOwnProperty(channel)) {
          return log("no channel-subscribtion found for " + channel);
        }
        angular.forEach(pubsub.channels[channel], function(scope) {
          scope.$emit('socket:publish', data);
          scope.$apply();
        });
      }
    , emit = function(uuid, data) {
        if(!responses.hasOwnProperty(uuid)) {
          return log("no response registered for " + uuid);
        }
        var response = responses[uuid].response;
        delete responses[uuid];

        if(typeof response === 'function') {
          return response(data);
        }

        response.$emit('socket:response', data);
        response.$apply();
      }

  var onMessage = function(event) {
    log("on-message", event);
    data = JSON.parse(event.data);
    if(!data.hasOwnProperty('data')) {
      log("no data send");
      return;
    }
    if(data.hasOwnProperty('channel')) {
      return broadcast(data.channel, data.data);
    }
    if(data.hasOwnProperty('response')) {
      return emit(data.response, data.data);
    }
    log("no useable message");
  }, onOpen = function(event) {
    log("on-open", event);
    angular.forEach(onReady, function(fn) {
      fn.call(null, socket);
    });
    onReady = [];
  }, onClose = function(event) {
    log("on-close", event);
  }, onError = function(event) {
    log("on-error", event);
  }, createWebsocket = function() {
    return new WebSocket("ws://localhost:8080/", ['db']);
  };

  var getSocket   = function(fn) {
        if(socket) {
          if(socket.readyState === 1) {
            return fn(socket);
          }
          onReady.push(fn);
          return;
        }
        socket            = createWebsocket();
        socket.onopen     = onOpen;
        socket.onmessage  = onMessage;
        socket.onclose    = onClose;
        socket.onerror    = onError;
        onReady.push(fn);
      }
    , send        = function(data) {
        var id = uuid();
        getSocket(function(socket) {
          data.uuid = id;
          log("Sending data through socket", data);
          socket.send(JSON.stringify(data));
        });
      }
    , subscribe   = function($scope, channels) {
        channels = Array.isArray(channels) ? channels : [channels];
        log("Subscribing to channels: " + channels.join(","));
        angular.forEach(channels, function(channel) {
          if(!pubsub.channels.hasOwnProperty(channel))
            pubsub.channels[channel] = [];
          pubsub.channels[channel].push($scope);
        });
      }
    , unsubscribe = function($scope, channels) {
        channels = Array.isArray(channels) ? channels : [channels];
        log("Unsubscribing to channels: " + channels.join(","));
        angular.forEach(channels, function(channel) {
          if(pubsub.channels.hasOwnProperty(channel)) {
            pubsub.channels[channel] = pubsub.channels[channel].filter(function(scope) {
              return scope.$id !== $scope.$id;
            });
            if(!pubsub.channels[channel].length) {
              delete pubsub.channels[channel];
            }
          }
        });
      }
    , publish     = function(channel, data, preventReEmit) {
        log('Publish to ' + channel, data);
        var id = send({
          channel : channel,
          data    : data
        });
        if(preventReEmit) {
          pubsub.prevent.push(id);
        }
        return id;
      }
    , request     = function(data, response) {
        var id = uuid();
        log("Sending request[" + id + "]", data);
        responses[id] = {
          time: new Date,
          response: response
        };
        return send({
          data    : data,
          response: id
        });
      }
    ;

  var Service = {
    /**
     *  Calls the callback with a working connection.
     *  @param callback to be called when the connection is ready
     **/
    _socket: getSocket,
    /**
     *  Send a request to through the socket
     *  @param data that will be send
     *  @param fn that will be called on response
     **/
    request: request,
    /**
     *  Subscribe a scope to a channel, will use the scopes $emit methods
     *  @param $scope that will be used
     *  @param channels that will be subscribed to array or string
     **/
    subscribe: subscribe,
    /**
     *  Unsubscribes a $scope from a channel
     *  @param $scope to unsubscribe
     *  @param channels that will be removed from subscribtion
     **/
    unsubscribe: unsubscribe,
    /**
     *  Publish data to a channel
     *  @param channel to publish data to
     *  @param data to publish
     *  @param flag that stops the response from reemitting
     **/
    publish: publish
  };

  return Service;
}]);