'use strict';

angular.module('Experimental').controller('SliderController', ['$scope', function ($scope) {

  var nextPosition = function(position) { return (position + 1) % $scope.slider.elements; };
  var prevPosition = function(position) { return (position - 1 + $scope.slider.elements) % $scope.slider.elements; };

  var positionClass = function(position) {
    var pos = $scope.slider.position;
    switch(true) {
      // if position is the current position
      case position === pos: return 'at-bat';
      // if position is right before current position:
      case position === prevPosition(pos): return 'last-up';
      // if position is right after current position:
      case position === nextPosition(pos): return 'on-deck';
      // if neither: 
      default: return 'in-the-hole';
    }
  };

  var next = function sliderNext() {
    $scope.slider.position = nextPosition($scope.slider.position);
  };

  var prev = function sliderPrev() {
    $scope.slider.position = ($scope.slider.position - 1 + $scope.slider.elements) % $scope.slider.elements;
  };

  $scope.next = function() {
    $scope.slider.direction = '';
    next();
  };

  $scope.prev = function() {
    $scope.slider.direction = 'my-carousel-reverse';
    prev();
  };

  $scope.slider = {
    elements: 2,
    position: 0,
    direction: '',
    positionClass: function(pos) {
      var res = positionClass(pos);
      console.log(pos, res);
      return res;
    }
  };

}]);