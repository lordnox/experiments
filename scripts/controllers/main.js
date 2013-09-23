'use strict';

var app = angular.module('Experimental');

var  ucwords = function ucwords (str) {
  // @from http://phpjs.org/functions/ucwords/
  // http://kevin.vanzonneveld.net
  // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // +   improved by: Waldo Malqui Silva
  // +   bugfixed by: Onno Marsman
  // +   improved by: Robin
  // +      input by: James (http://www.james-bell.co.uk/)
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // *     example 1: ucwords('kevin van  zonneveld');
  // *     returns 1: 'Kevin Van  Zonneveld'
  // *     example 2: ucwords('HELLO WORLD');
  // *     returns 2: 'HELLO WORLD'
  return (str + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function ($1) {
    return $1.toUpperCase();
  });
}

app.controller('MainController', ['$scope', '$route', 'WebSocket', function ($scope, $route, WebSocket) {
  $scope.page = {
    title: "Menü"
  };

  var menuItem = function(title, href) {
    return {
      title: title,
      href: '#' + href,
      active: false
    }
  }

  // setup the menü
  $scope.menu = [];

  // fill the menü with all routes - DRY
  angular.forEach($route.routes, function (config,route) {
    if(route.length && route !== "null" && route[route.length - 1] !== '/')
      $scope.menu.push(menuItem(ucwords(config.name || route.substr(1)), route))
  });

}]);

app.directive('onLoad', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.fadeIn('slow');
    }
  };
});