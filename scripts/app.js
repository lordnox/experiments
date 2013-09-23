'use strict';

var app = angular.module('Experimental', []);

app.config(['$routeProvider', '$locationProvider', function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: './views/index.html',
    })
    .when('/justify', {
      templateUrl: './views/justify.html',
      controller: 'JustifyController'
    })
    .when('/user', {
      templateUrl: './views/user.html',
      controller: 'UserController',
      name: 'User-Test'
    })
    .when('/socket', {
      templateUrl: './views/socket.html',
      controller: 'SocketController',
    })
    .otherwise({
      redirectTo: '/'
    });  
}]);

app.controller()