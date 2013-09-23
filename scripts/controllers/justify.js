'use strict';

angular.module('Experimental').controller('JustifyController', ['$scope', function ($scope) {
  $scope.text = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.';
  $scope.text = 'Hello World. I think this is really fun.';
  $scope.makeArray = function(len) {
    var result = [];
    while(len--) result.push(null)
    return result;
  };

  var steps = [
    '(1) define subproblems',
    '(2) guess (part of solution)',
    '(3) relate subproblem solutions',
    '(4) recurse & memoize or build DP table bottom-up',
    '(5) solve origional problem'
  ];

  $scope.lines = steps;

  $scope.words = $scope.text.split(' ');

  $scope.config = {
    max: 30
  };

  var text = [];

  var _hash = function(args) { return JSON.stringify(args); };

  var memoize = function(fn, memo, hash) {
    if(!memo) memo = {};
    if(!hash) hash = _hash;
    var memoized = function memoized() {
      var args   = Array.prototype.slice.call(arguments);
      var hashed = hash(args.slice(1));
      if(memo[hashed]) return memo[hashed];
      return memo[hashed] = fn.apply(this, args);
    };
    return function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(memoized);
      return memoized.apply(this, args);
    };
  };

  // recurse-Factory
  var recurseFactory = function(_init, _break, _calc, _compare) {
    return function(recurse, args) {
      var init      = _init(args)
        , length    = init[0]
        , result    = init[1]
        , i         = 0
        , current;
      if(_break(result, args)) return result; // break recursion

      while(++i < length)
        if(_compare(
          current = _calc(recurse, i, args), result)
        ) result = current;
      return result;
    };
  };

  var _justify = (function() {
    var wordsToString = function(words) {
      return words.join(' ');
    };

    var badness = function(words, max) {
      var length  = wordsToString(words).length;     
      if(length > max) return Infinity;
      var val     = max / length;
      return Math.pow(val, 3);
    };

    var makeResult = function(badness, lines, line) {
      if(line) {
        lines   = angular.copy(lines);
        lines.unshift(wordsToString(line));
      };
      return {
        badness: badness,
        lines  : lines
      };
    };

    var _calc = function(recurse, i, args) {
      var words   = args[0];
      var config  = args[1];
      var suffix  = words.slice(i);
      var prefix  = words.slice(0, i);
      
      var bad     = badness(prefix, config);      
      // recursion:
      var result  = recurse(recurse, [suffix, config]);        

      return makeResult(bad + result.badness, result.lines, prefix);
    };

    var _compare = function(current, best) {
      return current.badness < best.badness;
    };

    var _break = function(result, args) {
      return args[0].length <= 1;
    };

    var _init = function(args) {
      return [args[0].length, makeResult(badness.apply(this, args), [], args[0])]
    };

    return recurseFactory(_init, _break, _calc, _compare);
  })();

  var _fib = function fib(fib, n) {
    if(n < 2) return n;
    return fib(fib,n-1)+fib(fib,n-2);
  };

  var _fib = recurseFactory(
     function _init(n) {
    return [n,n];
  }, function _break(_, n) {
    return n == 0;
  }, function _calc(fib, i, n) {
    return fib(fib, n - 1) + fib(fib, n - 2);
  }, function _compare(a, b) {
    return true;
  });

  var justify = memoize(_justify);
  var memoFib = memoize(_fib);

  var just = function(text, config) {
    var words   = text.split(' ');
    var result  = justify([words, config.max]);
    return result.lines;
  };

  var update = function() {
    $scope.lines   = just($scope.text, $scope.config);
    $scope.result  = memoFib($scope.config.max);
  };

  $scope.$watch('text', update);
  $scope.$watch('config.max', update);

  var textlength = function(i, j) {
    if(j > text.length) throw new Error("Textlength: " + j + " muss kleiner " + text.length + " sein.");
    return text.slice(i, j).join(' ').length;
  };

  var _badness = function(len) {
    if(len > $scope.config.max) return Infinity;
    return Math.pow($scope.config.max - len , 3);
  };

  var badness = function(i, j) {
    if(j > text.length) throw new Error("Badness: " + j + " muss kleiner " + text.length + " sein.");
    return _badness(textlength(i, j));
  };

  $scope.badness = function(text) {
    return _badness(text.length);
  };

}]).filter('nosp', function() {
  return function(input) {
    return input.map(function(i) {
      if(i == ' ') return '\u00A0';
      return i;
    });
  };
}).filter('split', function() {
  return function(input) {
    return input.split('');
  };
}).filter('stringify', function() {
  return function(input) {
    return ''+input;
  };
});