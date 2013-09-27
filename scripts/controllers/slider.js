'use strict';

Swiper.prototype.plugins.shapeChange = function(swiper, params) {
  if (!swiper.support.transforms3d) return;
  var slides, wrapperSize, slideSize, initialized;
  var isH = swiper.params.mode == 'horizontal';
  if(!params) return;
  /*=========================
    Default Parameters
    ===========================*/
  var defaults = {
    rotate : 50,
    stretch :0,
    depth: 100,
    modifier : 1,
    shadows : true 
  }
  params = params || {};  
  for (var prop in defaults) {
    if (! (prop in params)) {
      params[prop] = defaults[prop] 
    }
  }
  
  
  function init() {
    initialized = true;
    slides = swiper.slides
    for (var i=0; i<slides.length; i++) {
      swiper.setTransition(slides[i], 0)
    }
    
    if (isH) {
      wrapperSize = swiper.h.getWidth(swiper.wrapper);
      slideSize = wrapperSize/slides.length;
      
      for (var i=0; i<slides.length; i++) {
        slides[i].swiperSlideOffset = slides[i].offsetLeft
      }
    }
    else {
      wrapperSize = swiper.h.getHeight(swiper.wrapper);
      slideSize = wrapperSize/slides.length;
      for (var i=0; i<slides.length; i++) {
        slides[i].swiperSlideOffset = slides[i].offsetTop
      }
    }
  }
  
  function threeDSlides(transform) {
    if (!initialized) return;
    var transform = transform || {x:0, y:0, z:0};
    var center = isH ? -transform.x+swiper.width/2 : -transform.y+swiper.height/2 ;

    var rotate = isH ? params.rotate : -params.rotate;
    var translate = params.depth;

    var active = swiper.activeIndex;

    //Each slide offset from center
    for (var i=0; i<swiper.slides.length; i++) {
      
      var slideOffset = swiper.slides[i].swiperSlideOffset
      var offsetMultiplier = (center - slideOffset - slideSize/2)/slideSize*params.modifier;

      var distance = i - active;
      console.log(i, distance, slideSize);
      
      var widthScale = 1;
      var heightScale = 1;

      widthScale = distance > 2 ? 0 : 1 / distance;
      
      var rotateY = isH ? rotate*offsetMultiplier : 0;
      var rotateX = isH ? 0 : rotate*offsetMultiplier;
      // var rotateZ = 0
      var translateZ = -translate*Math.abs(offsetMultiplier);
      
      var translateY = isH ? 0 : params.stretch*(offsetMultiplier)
      var translateX = isH ? params.stretch*(offsetMultiplier) : 0;
      
      if(widthScale) {
        console.log(distance, 1 - widthScale, translateX, slideSize);
        translateX += (1 - widthScale) * slideSize;
      }

      //Fix for ultra small values
      if (Math.abs(translateX)<0.001) translateX = 0;
      if (Math.abs(translateY)<0.001) translateY = 0;
      if (Math.abs(translateZ)<0.001) translateZ = 0;
      if (Math.abs(rotateY)<0.001) rotateY = 0;
      if (Math.abs(rotateX)<0.001) rotateX = 0;

      
      var slideTransform = 'translate3d('+translateX+'px,'+translateY+'px,'+translateZ+'px)  rotateX('+rotateX+'deg) rotateY('+rotateY+'deg)';
      slideTransform += ' scale3d('+widthScale+', '+heightScale+', 1)';
      
      //console.log(slideTransform);

      swiper.setTransform(swiper.slides[i], slideTransform);
      swiper.slides[i].style.zIndex =-Math.abs(Math.round(offsetMultiplier))+1
      if (params.shadows) {
        //Set shadows
        var shadowBefore = isH ? swiper.slides[i].querySelector('.swiper-slide-shadow-left') : swiper.slides[i].querySelector('.swiper-slide-shadow-top');
        var shadowAfter = isH ? swiper.slides[i].querySelector('.swiper-slide-shadow-right') : swiper.slides[i].querySelector('.swiper-slide-shadow-bottom');
        shadowAfter.style.opacity = (-offsetMultiplier)>0 ? (-offsetMultiplier) : 0;
        shadowBefore.style.opacity = offsetMultiplier>0 ? offsetMultiplier : 0;
      }
    }
    
    //Set correct perspective for IE10    
    if (swiper.ie10) {
      var ws = swiper.wrapper.style;
      ws.perspectiveOrigin = center+'px 50%'
    }
    
  }
  
  //Plugin Hooks
  var hooks = {
    onFirstInit : function(args){
      slides = swiper.slides;
      if (params.shadows) {
        //Add Shadows
        var shadowEl1 = document.createElement('div')
        var shadowEl2 = document.createElement('div')
        shadowEl1.className = isH ? 'swiper-slide-shadow-left' : 'swiper-slide-shadow-top'
        shadowEl2.className = isH ? 'swiper-slide-shadow-right' : 'swiper-slide-shadow-bottom'
        for (var i=0; i<slides.length; i++) {
          slides[i].appendChild(shadowEl1.cloneNode())
          slides[i].appendChild(shadowEl2.cloneNode())
        }
      }
      //Update Dimensions
      init();
      //Set in 3D
      threeDSlides({x:swiper.getWrapperTranslate('x'), y:swiper.getWrapperTranslate('y'), z:swiper.getWrapperTranslate('z')});
    },
    onInit : function(args) {
      init();
      //Set in 3D
      threeDSlides({x:swiper.getWrapperTranslate('x'), y:swiper.getWrapperTranslate('y'), z:swiper.getWrapperTranslate('z')});
    },
    onSetWrapperTransform: function(transform){
      threeDSlides(transform);
    },
    onSetWrapperTransition: function(args){
      
      for (var i=0; i<swiper.slides.length; i++) {
        swiper.setTransition(swiper.slides[i], args.duration)
        if (isH && params.shadows) {
          swiper.setTransition(swiper.slides[i].querySelector('.swiper-slide-shadow-left'), args.duration)
          swiper.setTransition(swiper.slides[i].querySelector('.swiper-slide-shadow-right'), args.duration)
        }
        else if(params.shadows) {
          swiper.setTransition(swiper.slides[i].querySelector('.swiper-slide-shadow-top'), args.duration)
          swiper.setTransition(swiper.slides[i].querySelector('.swiper-slide-shadow-bottom'), args.duration)
        }
      }
  
      
    }
  }
  return hooks
}


angular.module('Experimental').controller('SliderController', ['$scope', function ($scope) {
  console.log('slider copntroller started');

  var swiper = null, tdFlow = null;

  setTimeout(function() {
    swiper = new Swiper('.swiper-experiment .swiper-container', {
      loop: true,
//      calculateHeight: true,
//    offsetSlidesAfter: 1,
      slidesPerView: 1.5,
      loopAdditionalSlides: 2,
      speed: 5000,
      shapeChange: {
        modifier: 1,
        rotate: 0,
        shadows: false
      }
    });    
    tdFlow = new Swiper('.swiper-3d .swiper-container', {
      loop: true,
//    offsetSlidesAfter: 2,
      slidesPerView: 1.5,
      speed: 5000,
      loopAdditionalSlides: 2,
      tdFlow: {
        shadows: false,
        rotate: 0,
        stretch: 100
      }
    });    
  }, 20);

  $scope.next = function() {
    swiper.swipeNext();
    tdFlow.swipeNext();
  };

  $scope.prev = function() {
    swiper.swipePrev();
    tdFlow.swipePrev();
  };

}]);