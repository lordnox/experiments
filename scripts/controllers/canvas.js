'use strict';

angular.module('Experimental').controller('CanvasController', ['$scope', '$timeout', function ($scope, timeout) {
    $scope.parameter = {
      colors: {
        layout: '#000',
        stroke: '#f00'
      },
      scale: 10,
      top: {
        width: 10
      },
      base: {
        x: 10,
        y: 10,

      },
      variables: {
        a: 10
      },
      demo: {
        posx    :  200,
        posy    :  200,
        r       :  100,
        f       :  14,
        top     :  20,
        theta   :  412,
        alpha   :  100
      },
      draw: {
        demo: true,
        symbol: true
      },
      symbol: {
        lineWidth: 1,
        points: [
          [15, 25],   // P1
          
          [0, 30],    // Control 1 P1
          [0,  9],   // Control 2 P1
          [11, 9],   // P2

          [21, 11],   // P2
          [23, 25],   // P2
          [32, 18],   // P2

          [43, 14],   // P2
          [44, 21],   // P2
          [58, 17]    // P2
        ]
      }
    };

    $scope.canvas = {
      width: 700,
      height: 400
    }

    var resetContext = function(context, canvas) {
      var width = canvas.width || canvas.scrollWidth;
      var height = canvas.height || canvas.scrollHeight;
      var x = $scope.parameter.base.x;
      var y = $scope.parameter.base.y;
      var f = $scope.parameter.scale;

      context.fillStyle = "#fff";
      context.fillRect(0, 0, width, height);

      context.beginPath();
      context.moveTo(x+f * 0    , y+4 * f);
      context.lineTo(x+f * 24  , y+4 * f);
      context.moveTo(x+f * 26  , y+4 * f);
      context.lineTo(x+f * 50  , y+4 * f);
      context.moveTo(x+f * 49.5  , y+3.5 * f);
      context.lineTo(x+f * 50  , y+4 * f);
      context.lineTo(x+f * 49.5  , y+4.5 * f);
      context.moveTo(x+f * 6   , y+ 0 * f);
      context.lineTo(x+f * 6   , y+15.3 * f);
      context.moveTo(x+f * 6   , y+17.3 * f);
      context.lineTo(x+f * 6   , y+37.5 * f);
      context.moveTo(x+f * 6.5   , y+37 * f);
      context.lineTo(x+f * 6   , y+37.5 * f);
      context.lineTo(x+f * 5.5   , y+37 * f);

      context.lineWidth = 1;
      context.strokeStyle = $scope.parameter.colors.layout;
      context.stroke();
    };

    var drawSymbol = function(context, parameter) {
      var points = parameter.symbol.points;
      var f = parameter.scale;

      context.strokeStyle = parameter.colors.stroke;

      context.beginPath(); // begin custom shape
      

      context.moveTo(f*points[0][0], f*points[0][1]);
      context.bezierCurveTo(
        f*points[1][0], f*points[1][1],
        f*points[2][0], f*points[2][1],
        f*points[3][0], f*points[3][1]
      );
      context.bezierCurveTo(
        f*points[4][0], f*points[4][1],
        f*points[5][0], f*points[5][1],
        f*points[6][0], f*points[6][1]
      );
      context.bezierCurveTo(
        f*points[7][0], f*points[7][1],
        f*points[8][0], f*points[8][1],
        f*points[9][0], f*points[9][1]
      );

      context.lineWidth = parameter.symbol.lineWidth;
      context.strokeStyle = parameter.colors.stroke;
      context.stroke();
      context.closePath(); // complete custom shape

      var drawPoints = function(point) {
        context.beginPath(); // begin custom shape
        var x = point[0], y = point[1], w = 1;
        context.moveTo(f*(x-w), f*(y-w));
        context.lineTo(f*(x+w), f*(y+w));
        context.moveTo(f*(x-w), f*(y+w));
        context.lineTo(f*(x+w), f*(y-w));
        context.closePath(); // complete custom shape
        context.stroke();
      }
      context.lineWidth = 1;
      context.strokeStyle = "#0f0";
      points.map(drawPoints);
    }

    var drawDemo = function(context, parameter) {
      var x = parameter.base.x;
      var y = parameter.base.y;

      var posx = parameter.demo.posx;
      var posy = parameter.demo.posy;
      var r = parameter.demo.r;
      var f = parameter.demo.f / 10;
      var top = parameter.demo.top;
      var theta = parameter.demo.theta / 100;
      var alpha = parameter.demo.alpha / 100;

      context.globalAlpha = alpha;
      context.strokeStyle = parameter.colors.stroke;
      context.beginPath(); // begin custom shape

      for (var x = 0; x < top * 2; x += 2) {
        context.bezierCurveTo(
          posx + r *     Math.cos((x + 0) * Math.PI / top + theta), posy + r * Math.sin(x * Math.PI / top + theta), 
          posx + f * r * Math.cos((x + 1) * Math.PI / top + theta), posy + f * r * Math.sin((x + 1) * Math.PI / top + theta), 
          posx + r *     Math.cos((x + 2) * Math.PI / top + theta), posy + r * Math.sin((x + 2) * Math.PI / top + theta));
      }
      context.closePath(); // complete custom shape
      context.lineWidth = 4;
      context.strokeStyle = "#111122";
      context.stroke();
    }

    $scope.update = function() {
      var canvas = document.getElementById("myCanvas");
      var context = canvas.getContext("2d");

      var parameter = $scope.parameter;

      resetContext(context, canvas);
      if(parameter.draw.demo)
        drawDemo(context, parameter);
      if(parameter.draw.symbol)
        drawSymbol(context, parameter);
    };

    $scope.$watch('parameter | json', $scope.update);
    $scope.$watch('canvas | json', function() {
      timeout($scope.update, 10);
    });
    
}]);