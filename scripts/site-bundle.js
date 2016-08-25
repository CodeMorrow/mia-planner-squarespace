/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(2);


/***/ },
/* 1 */
/***/ function(module, exports) {

	/*
	
	    Squarespace Dynamic Data
	    ------------------------
	    On click, inject page content dynamically into an element.
	    Value in a[href] is used.
	
	    Params:
	
	    - wrapper: where to inject the fetched data
	    - target: elements to be used as an onclick triggers
	    - preCallback: function to be executed pre-load
	    - postCallback: function to be executed post-load
	    - useHashes: keep track of the current active page using # in URL's
	    - autoOpenHash: if the current URL includes a #, fetch that page on init
	    - injectEl: by default, all page data is injected into wrapper. Use this option
	      to specify which part of the loaded page is to be injected in wrapper.
	      Ex: '#content' or '#content, #thumbnails'
	    - minimumResolution: minimum browser width required for this plugin to work
	      Ex: 1025px ensures that default clicking behavior is maintained on mobiles and tablets
	    - scrollToWrapperPreLoad: scroll and focus on wrapper pre-load
	
	    Methods:
	    - simulateHash( hash ): simulate an onClick event by passing the
	      trigger's href value as hash
	
	 */
	
	YUI.add( 'squarespace-dynamic-data', function( Y ) {
	
	  Y.namespace( 'Squarespace' );
	
	  Y.Squarespace.DynamicData = function( params ) {
	    var wrapper = ( params && params.wrapper ) || 'body',
	      preCallback = ( params && params.preCallback ) || null,
	      postCallback = ( params && params.postCallback ) || null,
	      useHashes = ( params && params.useHashes ) || false,
	      autoOpenHash = ( params && params.autoOpenHash ) || false,
	      injectEl = ( params && params.injectEl ) || null,
	      minimumResolution = ( params && params.minimumResolution ) || null,
	      scrollToWrapperPreLoad = ( params && params.scrollToWrapperPreLoad ) || false,
	      appendData = ( params && params.appendData ) || null,
	      classes = {
	        search: ( params && params.target ) || '.sqs-dynamic-data',
	        active: 'sqs-dynamic-data-active',
	        loading: 'sqs-dynamic-data-loading',
	        ready: 'sqs-dynamic-data-ready',
	        activeWrapper: 'data-dynamic-data-link',
	        appendWrapper: 'sqs-dynamic-data-wrapper'
	      };
	
	    // Core
	    function init() {
	      if ( !minimumResolution || window.innerWidth >= minimumResolution ) {
	        wrapper = Y.one( wrapper );
	
	        if ( wrapper ) {
	          Y.on( 'click', fetch, classes.search );
	          openCurrentHash();
	        }
	      }
	    }
	
	    // Simulate a click
	    this.simulateHash = function( hash ) {
	      if ( hash ) {
	        hash = hash.replace( '#', '' );
	        fetch( null, hash);
	      }
	    }
	
	    // Check if current URL contains a hash
	    function openCurrentHash() {
	      var hash = window.location.hash;
	
	      if ( autoOpenHash && hash ) {
	        hash = hash.replace( '#', '' );
	        hash = hash.endsWith('/') ? hash : hash + '/'; // append slash if not present
	        fetch( null, hash);
	      }
	    }
	
	    // Call Fn
	    function callFn( fn ) {
	      if ( typeof fn === 'function') {
	        fn();
	      }
	    }
	
	    // Clean url
	    function cleanUrl( url ) {
	      return url.replace(/\//g,'');
	    }
	
	    // Fetch url - on click or forced
	    function fetch( e, simulate ) {
	
	      var trigger = ( simulate && Y.one( classes.search + '[href="' + simulate + '"]'  ) ) || ( e && e.currentTarget || null ),
	        url = ( simulate ) || ( trigger && trigger.getAttribute( 'href' ) ),
	        tempWrapper,
	        loadingWrapper;
	
	      if ( e ) {
	        e.preventDefault();
	      }
	
	      if ( useHashes ) {
	        window.location.hash = url;
	      }
	
	      // Only load items that have never been loaded
	      if ( ( trigger && !appendData && cleanUrl( url ) != wrapper.getAttribute( classes.activeWrapper ) ) ||
	           ( trigger && appendData && !wrapper.one( '[' + classes.activeWrapper + '=' + cleanUrl( url ) + ']' ) ) ) {
	
	        wrapper.setAttribute( classes.activeWrapper, cleanUrl( url ) );
	
	        Y.all( '.' + classes.active ).removeClass( classes.active );
	        trigger.addClass( classes.active );
	        wrapper.removeClass( classes.ready );
	        wrapper.addClass( classes.loading );
	
	        // Scroll to top if required
	        if ( !simulate ) {
	          scrollToWrapper();
	        }
	
	        callFn( preCallback );
	
	        if ( appendData ) {
	          tempWrapper = Y.Node.create( '<div></div>' );
	          tempWrapper.addClass( classes.appendWrapper );
	          tempWrapper.setAttribute( classes.activeWrapper, cleanUrl( url ) );
	          tempWrapper.appendTo( wrapper );
	        }
	
	        loadingWrapper = tempWrapper ? tempWrapper : wrapper;
	
	        loadingWrapper.load( url, injectEl, function() {
	          loadReady( url );
	        });
	
	      } else {
	
	        wrapper.setAttribute( classes.activeWrapper, cleanUrl( url ) );
	
	        // [TMP-3033] When image blocks that have already been initialized are re-initialized,
	        // their style attributes (determining cropping) get blasted away.
	        // Ultimately we'll figure out a better way to manage initialization of blocks on dynamic pages
	        // but for now, save these styles so we can reapply later. -schai
	        Y.one('#projectPages').all('img[data-src].loaded').each(function(img){
	          img.setAttribute('saved-styles', img.getAttribute('style'));
	        });
	
	        if ( !simulate ) {
	          scrollToWrapper();
	        }
	
	      }
	
	    }
	
	    // SQS block related inits
	    function sqsBlocks(callback) {
	
	      Squarespace.AFTER_BODY_LOADED = false;
	      Squarespace.afterBodyLoad();
	      Squarespace.initializeCommerce(Y);
	
	      // Load Non-Block Images
	      wrapper.all('img[data-src]').each(function(el) {
	        if (!el.ancestor('.sqs-layout')) {
	          ImageLoader.load(el);
	        }
	      });
	
	      // [TMP-3033] When image blocks that have already been initialized are re-initialized,
	      // their style attributes (determining cropping) get blasted away.
	      // Ultimately we'll figure out a better way to manage initialization of blocks on dynamic pages
	      // but for now, save these styles so we can reapply later. -schai
	      Y.one('#projectPages').all('img[data-src].loaded').each(function(img){
	        if(img.getAttribute('saved-styles')) {
	          img.setAttribute('style', img.getAttribute('saved-styles'));
	        }
	      });
	
	      // Social Buttons
	      var socialButtonsNode = Y.all( '.squarespace-social-buttons' );
	      if (!socialButtonsNode.isEmpty()) {
	        Y.all( '.squarespace-social-buttons' ).empty( true );
	        new Y.Squarespace.SocialButtons();
	      }
	
	      // Like Button
	      wrapper.all( '.sqs-simple-like' ).each(function( n ) {
	        Y.Squarespace.SimpleLike.renderLikeCount( n );
	      });
	
	      // Execute scripts
	      wrapper.all( 'script' ).each(function( n ) {
	        var newScript = document.createElement('script');
	        newScript.type = 'text/javascript';
	        if (n.getAttribute('src')) {
	          newScript.src = n.getAttribute('src');
	        } else {
	          newScript.innerHTML = n.get('innerHTML');
	        }
	
	        Y.one('head').append(newScript);
	      });
	
	      callFn( callback ); // wait for images to load?
	    }
	
	    // Locate Wrapper
	    function scrollToWrapper() {
	      var scrollY, scrollAnim;
	
	      if ( scrollToWrapperPreLoad ) {
	        scrollY = wrapper.getXY();
	        scrollY = scrollY[ 1 ];
	        scrollAnim = new Y.Anim({ node: Y.UA.gecko ? 'html' : 'body', to: { scroll: [ 0, scrollY ] }, duration: 0.2, easing: 'easeBoth' });
	        scrollAnim.run();
	      }
	    }
	
	    // Load ready
	    function loadReady( url ) {
	      sqsBlocks( postCallback );
	
	      wrapper.removeClass( classes.loading );
	      wrapper.addClass( classes.ready );
	    }
	
	    init();
	  }
	}, '1.0', { requires: [ 'node', 'node-load', 'squarespace-social-buttons' ] });


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var VideoBackgroundRenderer = __webpack_require__(3).VideoBackground;
	var GetVideoProps = __webpack_require__(3).getVideoProps;
	
	Y.use('node', 'squarespace-dynamic-data', 'history-hash', function(Y) {
	
	  Y.on('domready', function() {
	
	    // fix goofy zooming on orientation change
	    if (navigator.userAgent.match(/iPhone/i) && Y.one('body.mobile-style-available')) {
	      var fixedViewport = 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1',
	          zoomViewport = 'width=device-width, initial-scale=1',
	          viewport = Y.one('meta[name="viewport"]');
	      viewport.setAttribute('content', fixedViewport);
	      Y.one('body').on('touchstart', function(e) {
	        if (e.touches.length > 1) {
	          viewport.setAttribute('content', zoomViewport);
	        }
	      });
	    }
	    var videoBackgroundNodes = Array.prototype.slice.call(document.body.querySelectorAll('div.sqs-video-background'));
	    var videoBackgrounds = [];
	    window.vdbg = videoBackgrounds;
	    videoBackgroundNodes.forEach(function(item) {
	      var videoItem = new VideoBackgroundRenderer(GetVideoProps(item));
	      videoBackgrounds.push(
	        videoItem
	      );
	      item.addEventListener('ready', function() {
	        var dimensions = this._findPlayerDimensions();
	        this.container.parentElement.style.paddingBottom = dimensions.height * 100 / dimensions.width + '%';
	        setTimeout(function() {
	          this.syncPlayer();
	        }.bind(this), 500);
	      }.bind(videoItem), true);
	    });
	
	    // Mobile Nav ///////////////////////////////////
	
	    Y.one('#mobileMenuLink a').on('click', function(e){
	      console.log(e);
	       // var mobileMenuHeight = parseInt(Y.one('#mobileNav .wrapper').get('offsetHeight'),10);
	       // if (Y.one('#mobileNav').hasClass('menu-open')) {
	       //   new Y.Anim({ node: Y.one('#mobileNav'), to: { height: 0 }, duration: 0.5, easing: 'easeBoth' }).run();
	       // } else {
	       //   new Y.Anim({ node: Y.one('#mobileNav'), to: { height: mobileMenuHeight }, duration: 0.5, easing: 'easeBoth' }).run();
	       // }
	
	       Y.one('#mobileNav').toggleClass('menu-open');
	
	       //iOS6 Safari fix...
	       // if(Y.one('#mobileNav').hasClass('menu-open') && Y.one('#mobileNav').get('offsetHeight') == 0){
	       //   new Y.Anim({ node: Y.one('#mobileNav'), to: { height: mobileMenuHeight }, duration: 0.5, easing: 'easeBoth' }).run();
	       // }
	    });
	
	    body = Y.one('body');
	    bodyWidth = parseInt(body.getComputedStyle('width'),10);
	
	    // center align dropdown menus (when design is centered)
	    if(Y.one('body').hasClass('layout-style-center')) {
	      Y.all('#topNav .subnav').each( function(n){
	        n.setStyle('marginLeft', -(parseInt(n.getComputedStyle('width'),10)/2) + 'px' );
	      });
	    }
	
	    // vertically align page title/description
	    if (Y.one('.page-image .wrapper')) {
	      var vertAlign = function() {
	        Y.one('.page-image .wrapper').setStyles({
	          marginTop: -1 * parseInt(Y.one('.page-image .wrapper').getComputedStyle('height'),10)/2 + 'px',
	          opacity: 1
	        });
	      };
	      vertAlign();
	      Y.one('window').on('resize', vertAlign);
	    }
	
	    Y.one('#page').setStyle('opacity', 1);
	
	    // PROJECT PAGES
	    if (Y.one('.collection-type-template-page #projectPages, .collection-type-index #projectPages')) {
	
	      thumbLoader();
	
	      // thumbnail click events
	      thumbClickHandler();
	
	      // hash based page loading
	      pageLoader();
	      Y.on('hashchange', pageLoader);
	
	
	      // project pagination
	      Y.one('#projectNav').delegate('click', function(e) {
	        var project = Y.one('#projectPages .active-project').previous('.project');
	        if (project) {
	          scrollToTop();
	          window.location.hash = project.getAttribute('data-url');
	        } else {
	          e.currentTarget.addClass('disabled');
	        }
	      }, '.prev-project');
	
	      Y.one('#projectNav').delegate('click', function(e) {
	        var project = Y.one('#projectPages .active-project').next('.project');
	        if (project) {
	          scrollToTop();
	          window.location.hash = project.getAttribute('data-url');
	        } else {
	          e.currentTarget.addClass('disabled');
	        }
	      }, '.next-project');
	
	    }
	
	
	    // GALLERY PAGES
	
	
	
	    var body, bodyWidth;
	
	    // SIDEBAR min-height set
	
	    function setPageHeight() {
	      var sidebarHeight;
	      if (Y.one('#sidebar')) {
	        sidebarHeight = Y.one('#sidebar').getComputedStyle('height');
	      }
	      if (sidebarHeight) {
	        Y.one('#page').setStyle('minHeight', sidebarHeight);
	      }
	    }
	
	    // run on page load
	    setPageHeight();
	    Y.later(1000, this, setPageHeight);
	
	
	    // run when sidebar width is tweaked
	    if (Y.Squarespace.Management) {
	      Y.Squarespace.Management.on('tweak', function(f){
	        if (f.getName() == 'blogSidebarWidth' ) {
	          setPageHeight();
	        }
	      });
	    }
	
	
	  });
	
	
	  // GLOBAL FUNCTIONS
	  var dynamicLoaders = {};
	
	  function pageLoader() {
	
	    if (window.location.hash && window.location.hash != '#') {
	      var urlId = window.location.hash.split('#')[1];
	
	      urlId = urlId.charAt(0) == '/' ? urlId : '/' + urlId;
	      urlId = urlId.charAt(urlId.length-1) == '/' ? urlId : urlId + '/';
	
	      var activePage = Y.one('#projectPages .project[data-url="'+urlId+'"]');
	
	      if (activePage) {
	        if (activePage.hasAttribute('data-type-protected') || !activePage.hasClass('page-project') && !activePage.hasClass('gallery-project')) {
	          // navigate away for anything other than pages/galleries
	          window.location.replace(urlId);
	          return;
	        }
	
	        if (activePage.hasClass('page-project') && !activePage.hasClass('sqs-dynamic-data-ready')) {
	          var loader = dynamicLoaders['#'+urlId];
	          if (loader) {
	            loader.simulateHash(urlId);
	          }
	        }
	      }
	
	      // set active on projectPages
	      Y.one('#page').addClass('page-open');
	
	      resetAudioVideoBlocks();
	
	      // remove active class from all project pages/thumbs
	      Y.all('.active-project').each(function(project) {
	        project.removeClass('active-project');
	      });
	
	      activePage.addClass('active-project');
	
	      // set active thumb
	      var activeThumb = Y.one('#projectThumbs a.project[href="'+urlId+'"]');
	      if (activeThumb) {
	        activeThumb.addClass('active-project');
	      }
	
	      // set active navigation
	      if (activePage.next('.project')) {
	        Y.one('#projectNav .next-project').removeClass('disabled');
	      } else {
	        Y.one('#projectNav .next-project').addClass('disabled');
	      }
	      if (activePage.previous('.project')) {
	        Y.one('#projectNav .prev-project').removeClass('disabled');
	      } else {
	        Y.one('#projectNav .prev-project').addClass('disabled');
	      }
	
	      scrollToTop(function() {
	        Y.all('#projectPages .active-project img.loading').each(function(img) {
	          // Load Non-Block Images
	          if (!img.ancestor('.sqs-layout')) {
	            ImageLoader.load(img, { load: true });
	          }
	        });
	
	        Y.all('#projectPages .active-project .sqs-video-wrapper').each(function(video) {
	          video.videoloader.load();
	        });
	      });
	
	    } else { // no url hash
	
	      // clear active on projectPages
	      Y.one('#page').removeClass('page-open');
	
	      resetAudioVideoBlocks();
	
	      // remove active class from all project pages/thumbs
	      Y.all('.active-project').removeClass('active-project');
	
	    }
	  }
	
	  function resetAudioVideoBlocks() {
	    // Audio/video blocks need to be forced reset
	    var preActive = Y.one('#projectPages .active-project');
	    if (preActive && preActive.one('.video-block, .code-block, .embed-block, .audio-block')){
	      Y.fire('audioPlayer:stopAll', {container: preActive });
	      preActive.empty(true).removeClass('sqs-dynamic-data-ready').removeAttribute('data-dynamic-data-link');
	    }
	
	    if (preActive && preActive.one('.sqs-video-wrapper')) {
	      preActive.all('.sqs-video-wrapper').each(function(elem) {
	        elem.videoloader.reload();
	      });
	    }
	  }
	
	  function thumbLoader() {
	    var projectThumbs = Y.all('#projectThumbs img[data-src]');
	
	    // lazy load on scroll
	    var loadThumbsOnScreen = function() {
	      projectThumbs.each(function(img) {
	        if (img.inRegion(Y.one(Y.config.win).get('region'))) {
	          ImageLoader.load(img, { load: true });
	        }
	      });
	    };
	    loadThumbsOnScreen();
	    Y.on('scroll', loadThumbsOnScreen, Y.config.win);
	
	    // also load/refresh on resize
	    Y.one('window').on('resize', function(e){
	      loadThumbsOnScreen();
	    });
	
	
	    // Proactively lazy load
	    var lazyImageLoader = Y.later(100, this, function() {
	      var bInProcess = projectThumbs.some(function(img) {
	        if (img.hasClass('loading')) { // something is loading... wait
	          return true;
	        } else if(!img.getAttribute('src')) { // start the loading
	          ImageLoader.load(img, { load: true });
	          return true;
	        }
	      });
	      if (!bInProcess) {
	        lazyImageLoader.cancel();
	      }
	    }, null, true);
	  }
	
	  function thumbClickHandler() {
	    Y.all('#projectThumbs a.project').each(Y.bind(function(elem) {
	      var href = elem.getAttribute('href');
	      // set dynamic loader for pages
	      if (Y.one('#projectPages [data-url="'+href+'"]').hasClass('page-project')) {
	        dynamicLoaders['#'+href] = new Y.Squarespace.DynamicData({
	            wrapper: '#projectPages [data-url="'+href+'"]',
	            target: 'a.project[href="'+href+'"]',
	            injectEl: 'section > *',
	            autoOpenHash: true,
	            useHashes: true,
	            scrollToWrapperPreLoad: true
	        });
	      } else {
	        elem.on('click', function(e) {
	          e.halt();
	          window.location.hash = '#' + elem.getAttribute('href');
	        });
	      }
	    }, this));
	  }
	
	  function scrollToTop(callback) {
	    var scrollNodes = Y.UA.gecko || Y.UA.ie >= 10 ? 'html' : 'body',
	        scrollLocation = Math.round(Y.one('#page').getXY()[1]);
	    new Y.Anim({
	      node: scrollNodes,
	      to: { scroll: [0, scrollLocation] },
	      duration: 0.2,
	      easing: Y.Easing.easeBoth
	    }).run().on('end', function() {
	      // Bug - yui anim seems to stop if target style couldnt be reached in time
	      if (Y.one(scrollNodes).get('scrollTop') != scrollLocation) {
	        Y.one(scrollNodes).set('scrollTop', scrollLocation);
	      }
	
	      callback && callback();
	    });
	  }
	
	  function lazyOnResize(f,t) {
	    var timer;
	    Y.one('window').on('resize', function(e){
	      if (timer) { timer.cancel(); }
	      timer = Y.later(t, this, f);
	    });
	  }
	
	});


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var VideoBackground = __webpack_require__(4).VideoBackground;
	var getVideoProps = __webpack_require__(113);
	
	module.exports = {
	  'VideoBackground': VideoBackground,
	  'getVideoProps': getVideoProps
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var VideoBackground = __webpack_require__(5);
	var VideoFilterPropertyValues = __webpack_require__(108).filterProperties;
	
	var videoAutoplayTest = __webpack_require__(90);
	
	module.exports = {
	  VideoBackground: VideoBackground,
	  VideoFilterPropertyValues: VideoFilterPropertyValues,
	  videoAutoplayTest: videoAutoplayTest
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _stringify = __webpack_require__(6);
	
	var _stringify2 = _interopRequireDefault(_stringify);
	
	var _assign = __webpack_require__(9);
	
	var _assign2 = _interopRequireDefault(_assign);
	
	var _typeof2 = __webpack_require__(45);
	
	var _typeof3 = _interopRequireDefault(_typeof2);
	
	var _classCallCheck2 = __webpack_require__(80);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = __webpack_require__(81);
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	var custEvent = __webpack_require__(85);
	var parseUrl = __webpack_require__(86);
	var testAutoPlay = __webpack_require__(90);
	
	var DEBUG = false;
	
	var DEFAULT_PROPERTY_VALUES = {
	  'container': '.background-wrapper',
	  'url': 'https://youtu.be/xkEmYQvJ_68',
	  'fitMode': 'fill',
	  'maxLoops': '',
	  'scaleFactor': 1,
	  'playbackSpeed': 1,
	  'filter': 1,
	  'filterStrength': 50,
	  'timeCode': { 'start': 0, 'end': null },
	  'useCustomFallbackImage': false
	};
	
	var FILTER_OPTIONS = __webpack_require__(108).filterOptions;
	var FILTER_PROPERTIES = __webpack_require__(108).filterProperties;
	
	var YOUTUBE_REGEX = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]{11}).*/;
	var VIMEO_REGEX = /^.*(vimeo\.com\/)([0-9]{7,}(#t\=.*s)?)/;
	
	/**
	 * A class which uses the YouTube API to initialize an IFRAME with a YouTube video.
	 * Additional display options and functionality are configured through a set of properties,
	 * superceding default properties.
	 */
	
	var VideoBackground = function () {
	  /**
	   * @param {Object} props - An optional object with configuation.
	   * @param {Object} windowContext - The parent window object (due to .sqs-site-frame).
	   */
	  function VideoBackground(props) {
	    var _this = this;
	
	    var windowContext = arguments.length <= 1 || arguments[1] === undefined ? window : arguments[1];
	    (0, _classCallCheck3["default"])(this, VideoBackground);
	
	    this.windowContext = windowContext;
	    this.events = [];
	
	    this.initializeProperties(props);
	    testAutoPlay().then(function (value) {
	      _this.canAutoPlay = true;
	    }, function (reason) {
	      _this.canAutoPlay = false;
	      _this.container.classList.add('mobile');
	      _this.logger('added mobile');
	    }).then(function (value) {
	      _this.setDisplayEffects();
	      _this.setFallbackImage();
	      _this.callVideoAPI();
	      _this.bindUI();
	
	      if (DEBUG === true) {
	        window.vdbg = _this;
	        _this.debugInterval = setInterval(function () {
	          if (_this.player.getCurrentTime) {
	            _this.logger((_this.player.getCurrentTime() / _this.player.getDuration()).toFixed(2));
	          }
	        }, 900);
	      }
	    });
	  }
	
	  (0, _createClass3["default"])(VideoBackground, [{
	    key: 'destroy',
	    value: function destroy() {
	      if (this.events) {
	        this.events.forEach(function (evt) {
	          return evt.target.removeEventListener(evt.type, evt.handler, true);
	        });
	      }
	      this.events = null;
	
	      if (this.player && (0, _typeof3["default"])(this.player) === 'object') {
	        try {
	          this.player.iframe.classList.remove('ready');
	          clearTimeout(this.player.playTimeout);
	          this.player.playTimeout = null;
	          this.player.destroy();
	          this.player = {};
	        } catch (err) {
	          console.error(err);
	        }
	      }
	
	      if (typeof this.timer === 'number') {
	        clearTimeout(this.timer);
	        this.timer = null;
	      }
	
	      if (typeof this.debugInterval === 'number') {
	        clearInterval(this.debugInterval);
	        this.debugInterval = null;
	      }
	    }
	  }, {
	    key: 'bindUI',
	    value: function bindUI() {
	      var _this2 = this;
	
	      var resizeEvent = typeof window.orientation === 'undefined' ? 'resize' : 'orientationchange';
	      var resizeHandler = function resizeHandler() {
	        if (resizeEvent === 'resize') {
	          _this2.windowContext.requestAnimationFrame(function () {
	            _this2.scaleVideo();
	          });
	        } else if (_this2.useCustomFallbackImage && _this2.windowContext.ImageLoader) {
	          var customFallbackImage = _this2.container.querySelector('img[data-src]');
	          _this2.windowContext.ImageLoader.load(customFallbackImage, true);
	        }
	      };
	      this.events.push({
	        'target': this.windowContext,
	        'type': 'resize',
	        'handler': resizeHandler
	      });
	      this.windowContext.addEventListener(resizeEvent, resizeHandler, true);
	    }
	
	    /**
	     * Merge configuration properties with defaults with minimal validation.
	     */
	
	  }, {
	    key: 'initializeProperties',
	    value: function initializeProperties() {
	      var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	      props = (0, _assign2["default"])({}, DEFAULT_PROPERTY_VALUES, props);
	      if (props.container.nodeType === 1) {
	        this.container = props.container;
	      } else if (typeof props.container === 'string') {
	        this.container = document.querySelector(props.container);
	      } else {
	        console.error('Container ' + props.container + ' not found');
	        return false;
	      }
	      this.videoId = this.getVideoID(props.url);
	      this.filter = props.filter;
	      this.filterStrength = props.filterStrength;
	      this.useCustomFallbackImage = props.useCustomFallbackImage;
	      this.fitMode = props.fitMode;
	      this.maxLoops = parseInt(props.maxLoops, 10) || null;
	      this.scaleFactor = props.scaleFactor;
	      this.playbackSpeed = parseFloat(props.playbackSpeed) === 0.0 ? 1 : parseFloat(props.playbackSpeed);
	      this.timeCode = {
	        start: this._getStartTime(props.url) || props.timeCode.start,
	        end: props.timeCode.end
	      };
	      this.player = {};
	      this.currentLoop = 0;
	    }
	
	    /**
	     * The ID is the only unique property need to use in the YouTube and Vimeo APIs.
	     */
	
	  }, {
	    key: 'getVideoID',
	    value: function getVideoID(value) {
	      if (!value) {
	        value = DEFAULT_PROPERTY_VALUES.url;
	      }
	
	      var match = value.match(YOUTUBE_REGEX);
	      if (match && match[2].length) {
	        this.videoSource = 'youtube';
	        return match[2];
	      }
	
	      match = value.match(VIMEO_REGEX);
	      if (match && match[2].length) {
	        this.videoSource = 'vimeo';
	        return match[2];
	      }
	
	      return '';
	    }
	
	    /**
	     * A default fallback image element will be create from the YouTube API unless the
	     * custom fallback image exists.
	     */
	
	  }, {
	    key: 'setFallbackImage',
	    value: function setFallbackImage() {
	      var _this3 = this;
	
	      if (this.useCustomFallbackImage) {
	        (function () {
	          var customFallbackImage = _this3.container.querySelector('.custom-fallback-image');
	          var tempImage = document.createElement('img');
	          tempImage.src = customFallbackImage.src;
	          tempImage.addEventListener('load', function () {
	            customFallbackImage.classList.add('loaded');
	          });
	        })();
	      }
	    }
	
	    /**
	     * Determine which API to use
	     */
	
	  }, {
	    key: 'callVideoAPI',
	    value: function callVideoAPI() {
	      if (this.videoSource === 'youtube') {
	        this.initializeYouTubeAPI();
	      }
	
	      if (this.videoSource === 'vimeo') {
	        this.initializeVimeoAPI();
	      }
	    }
	
	    /**
	     * Call YouTube API per their guidelines.
	     */
	
	  }, {
	    key: 'initializeYouTubeAPI',
	    value: function initializeYouTubeAPI() {
	      var _this4 = this;
	
	      if (!this.canAutoPlay) {
	        return;
	      }
	
	      if (this.windowContext.document.documentElement.querySelector('script[src*="www.youtube.com/iframe_api"].loaded')) {
	        this.setVideoPlayer();
	        return;
	      }
	
	      this.player.ready = false;
	      var tag = this.windowContext.document.createElement('script');
	      tag.src = 'https://www.youtube.com/iframe_api';
	      var firstScriptTag = this.windowContext.document.getElementsByTagName('script')[0];
	      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	      tag.addEventListener('load', function (evt) {
	        evt.currentTarget.classList.add('loaded');
	        _this4.setVideoPlayer();
	      }, true);
	    }
	
	    /**
	     * Call the Vimeo API per their guidelines.
	     */
	
	  }, {
	    key: 'initializeVimeoAPI',
	    value: function initializeVimeoAPI() {
	      // No external API call is necessary; preserved for parity with YouTube and
	      // potential additional integrations.
	      if (!this.canAutoPlay) {
	        return;
	      }
	
	      this.setVideoPlayer();
	    }
	
	    /**
	     * If the source is YouTube initialize the video player and register its callbacks.
	     * If the source is Vimeo construct and append the player node and register handlers.
	     */
	
	  }, {
	    key: 'setVideoPlayer',
	    value: function setVideoPlayer() {
	      if (this.player.ready) {
	        try {
	          this.player.destroy();
	          this.player.ready = false;
	        } catch (e) {
	          // nothing to destroy
	        }
	      }
	
	      if (this.videoSource === 'youtube') {
	        this.initializeYouTubePlayer();
	      } else if (this.videoSource === 'vimeo') {
	        this.initializeVimeoPlayer();
	      }
	    }
	
	    /**
	     * Initialize the player and bind player events.
	     */
	
	  }, {
	    key: 'initializeYouTubePlayer',
	    value: function initializeYouTubePlayer() {
	      var _this5 = this;
	
	      // Poll until the API is ready.
	      if (this.windowContext.YT.loaded !== 1) {
	        setTimeout(this.setVideoPlayer.bind(this), 100);
	        return false;
	      }
	
	      /**
	       * YouTube event handler. Add the proper class to the player element, and set
	       * player properties.
	       */
	      var onYouTubePlayerReady = function onYouTubePlayerReady(event) {
	        _this5.player.iframe = _this5.player.getIframe();
	        _this5.player.iframe.classList.add('background-video');
	        _this5.syncPlayer();
	        _this5.player.mute();
	        if (typeof window.CustomEvent !== 'function') {
	          custEvent();
	        }
	        var readyEvent = new CustomEvent('ready');
	        _this5.container.dispatchEvent(readyEvent);
	        document.body.classList.add('ready');
	        _this5.player.ready = true;
	        if (!_this5.canAutoPlay) {
	          return;
	        }
	        _this5.player.seekTo(_this5.timeCode.start);
	        _this5.player.playVideo();
	        _this5.logger('playing');
	      };
	
	      /**
	       * YouTube event handler. Determine whether or not to loop the video.
	       */
	      var onYouTubePlayerStateChange = function onYouTubePlayerStateChange(event) {
	        var player = _this5.player;
	        var playerIframe = player.getIframe();
	        var duration = (player.getDuration() - _this5.timeCode.start) / _this5.playbackSpeed;
	
	        var doLoop = function doLoop() {
	          if (player.getCurrentTime() < _this5.timeCode.start) {
	            clearTimeout(_this5.timer);
	            player.pauseVideo();
	            player.seekTo(_this5.timeCode.start);
	          }
	          if (player.getCurrentTime() === _this5.timeCode.start) {
	            clearTimeout(_this5.timer);
	
	            if (_this5.maxLoops) {
	              _this5.currentLoop++;
	              if (_this5.currentLoop > _this5.maxLoops) {
	                player.pauseVideo();
	                _this5.currentLoop = 0;
	                return;
	              }
	            }
	
	            _this5.timer = setTimeout(function () {
	              player.pauseVideo();
	              player.seekTo(_this5.timeCode.start);
	            }, duration * 1000 - 100);
	          }
	        };
	
	        if (event.data === _this5.windowContext.YT.PlayerState.BUFFERING && player.getVideoLoadedFraction() !== 1 && (player.getCurrentTime() === 0 || player.getCurrentTime() > duration - -0.1)) {
	          _this5.logger('BUFFERING');
	          _this5.mediaAutoplayTest();
	        } else if (event.data === _this5.windowContext.YT.PlayerState.PLAYING) {
	          if (_this5.player.playerTimeout !== null) {
	            clearTimeout(_this5.player.playTimeout);
	            _this5.player.playTimeout = null;
	          }
	          if (!_this5.canAutoPlay) {
	            _this5.canAutoPlay = true;
	            _this5.container.classList.remove('mobile');
	          }
	          _this5.logger('PLAYING');
	          playerIframe.classList.add('ready');
	          doLoop();
	        } else {
	          _this5.logger('PAUSED/ENDED: ' + event.data);
	          player.playVideo();
	        }
	      };
	
	      this.player = new this.windowContext.YT.Player(this.container.querySelector('#player'), {
	        height: '315',
	        width: '560',
	        videoId: this.videoId,
	        playerVars: {
	          'autohide': 1,
	          'autoplay': 0,
	          'controls': 0,
	          'enablejsapi': 1,
	          'iv_load_policy': 3,
	          'loop': 0,
	          'modestbranding': 1,
	          'playsinline': 1,
	          'rel': 0,
	          'showinfo': 0,
	          'wmode': 'opaque'
	        },
	        events: {
	          'onReady': function onReady(event) {
	            onYouTubePlayerReady(event);
	          },
	          'onStateChange': function onStateChange(event) {
	            onYouTubePlayerStateChange(event);
	          }
	        }
	      });
	    }
	
	    /**
	     * Initialize the player and bind player events with a postMessage handler.
	     */
	
	  }, {
	    key: 'initializeVimeoPlayer',
	    value: function initializeVimeoPlayer() {
	      var _this6 = this;
	
	      var playerIframe = this.windowContext.document.createElement('iframe');
	      playerIframe.id = 'vimeoplayer';
	      playerIframe.classList.add('background-video');
	      var playerConfig = '&background=1';
	      playerIframe.src = '//player.vimeo.com/video/' + this.videoId + '?api=1' + playerConfig;
	      this.container.appendChild(playerIframe);
	      this.player.iframe = playerIframe;
	
	      /**
	       * Creates cross frame postMessage handlers, gets proper dimensions of player,
	       * and sets ready state for the player and container.
	       *
	       */
	      var player = this.player;
	      var playerOrigin = '*';
	
	      var postMessageManager = function postMessageManager(action, value) {
	        var data = {
	          method: action
	        };
	
	        if (value) {
	          data.value = value;
	        }
	
	        var message = (0, _stringify2["default"])(data);
	        _this6.windowContext.eval('(function(ctx){ ctx.player.iframe.contentWindow.postMessage(' + message + ', ' + (0, _stringify2["default"])(playerOrigin) + '); })')(_this6);
	      };
	      player.postMessageManager = postMessageManager;
	
	      var syncAndSetReady = function syncAndSetReady() {
	        if (!player.dimensions.width || !player.dimensions.height) {
	          return;
	        }
	        if (_this6.player.playerTimeout !== null) {
	          clearTimeout(_this6.player.playTimeout);
	          _this6.player.playTimeout = null;
	        }
	        _this6.syncPlayer();
	        if (typeof window.CustomEvent !== 'function') {
	          custEvent();
	        }
	        var readyEvent = new CustomEvent('ready');
	        _this6.container.dispatchEvent(readyEvent);
	        document.body.classList.add('ready');
	        player.ready = true;
	        player.iframe.classList.add('ready');
	
	        // Only required for Vimeo Basic videos, or video URLs with a start time hash.
	        // Plus and Pro utilize `background=1` URL parameter.
	        // See https://vimeo.com/forums/topic:278001
	        postMessageManager('setVolume', '0');
	        postMessageManager('setLoop', 'true');
	        postMessageManager('play');
	        postMessageManager('addEventListener', 'playProgress');
	      };
	
	      var onReady = function onReady() {
	        player.dimensions = {};
	        postMessageManager('getVideoHeight');
	        postMessageManager('getVideoWidth');
	        _this6.mediaAutoplayTest();
	      };
	
	      var onMessageReceived = function onMessageReceived(event) {
	        if (!/^https?:\/\/player.vimeo.com/.test(event.origin)) {
	          return false;
	        }
	
	        playerOrigin = event.origin;
	
	        var data = event.data;
	        if (typeof data === 'string') {
	          data = JSON.parse(data);
	        }
	        _this6.logger(data);
	
	        switch (data.event) {
	          case 'ready':
	            onReady();
	            break;
	
	          case 'playProgress':
	          case 'timeupdate':
	            if (!_this6.canAutoPlay) {
	              _this6.canAutoPlay = true;
	              _this6.container.classList.remove('mobile');
	            }
	            if (data.data.percent >= 0.98 && _this6.timeCode.start > 0) {
	              postMessageManager('seekTo', _this6.timeCode.start);
	            }
	            break;
	        }
	
	        switch (data.method) {
	          case 'getVideoHeight':
	            player.dimensions.height = data.value;
	            syncAndSetReady();
	            break;
	          case 'getVideoWidth':
	            player.dimensions.width = data.value;
	            syncAndSetReady();
	            break;
	        }
	      };
	
	      var messageHandler = function messageHandler(e) {
	        onMessageReceived(e);
	      };
	
	      this.windowContext.addEventListener('message', messageHandler, false);
	
	      player.destroy = function () {
	        _this6.windowContext.removeEventListener('message', messageHandler);
	        player.iframe.remove();
	      };
	    }
	
	    /**
	     * The IFRAME will be the entire width and height of its container but the video
	     * may be a completely different size and ratio. Scale up the IFRAME so the inner video
	     * behaves in the proper `fitMode` with optional additional scaling to zoom in.
	     */
	
	  }, {
	    key: 'scaleVideo',
	    value: function scaleVideo(scaleValue) {
	      var scale = scaleValue || this.scaleFactor;
	      var playerIframe = this.player.iframe;
	      var videoDimensions = this._findPlayerDimensions();
	
	      if (this.fitMode !== 'fill') {
	        playerIframe.style.width = '';
	        playerIframe.style.height = '';
	        return false;
	      }
	
	      var containerWidth = playerIframe.parentNode.clientWidth;
	      var containerHeight = playerIframe.parentNode.clientHeight;
	      var containerRatio = containerWidth / containerHeight;
	      var videoRatio = videoDimensions.width / videoDimensions.height;
	      var pWidth = 0;
	      var pHeight = 0;
	      if (containerRatio > videoRatio) {
	        // at the same width, the video is taller than the window
	        pWidth = containerWidth * scale;
	        pHeight = containerWidth * scale / videoRatio;
	        playerIframe.style.width = pWidth + 'px';
	        playerIframe.style.height = pHeight + 'px';
	      } else if (videoRatio > containerRatio) {
	        // at the same width, the video is shorter than the window
	        pWidth = containerHeight * scale * videoRatio;
	        pHeight = containerHeight * scale;
	        playerIframe.style.width = pWidth + 'px';
	        playerIframe.style.height = pHeight + 'px';
	      } else {
	        // the window and video ratios match
	        pWidth = containerWidth * scale;
	        pHeight = containerHeight * scale;
	        playerIframe.style.width = pWidth + 'px';
	        playerIframe.style.height = pHeight + 'px';
	      }
	      playerIframe.style.left = 0 - (pWidth - containerWidth) / 2 + 'px';
	      playerIframe.style.top = 0 - (pHeight - containerHeight) / 2 + 'px';
	    }
	
	    /**
	     * Play back speed options based on the YouTube API options.
	     */
	
	  }, {
	    key: 'setSpeed',
	    value: function setSpeed(speedValue) {
	      this.playbackSpeed = parseFloat(this.playbackSpeed);
	      this.player.setPlaybackRate(this.playbackSpeed);
	    }
	
	    /**
	     * All diplay related effects should be applied prior to the video loading to
	     * ensure the effects are visible on the fallback image while loading.
	     */
	
	  }, {
	    key: 'setDisplayEffects',
	    value: function setDisplayEffects() {
	      this.setFilter();
	    }
	
	    /**
	     * Apply filter with values based on filterStrength.
	     */
	
	  }, {
	    key: 'setFilter',
	    value: function setFilter() {
	      var containerStyle = this.container.style;
	      var filter = FILTER_OPTIONS[this.filter - 1];
	      var filterStyle = '';
	      if (filter !== 'none') {
	        filterStyle = this.getFilterStyle(filter, this.filterStrength);
	      }
	
	      // To prevent the blur effect from displaying the background at the edges as
	      // part of the blur, the filer needs to be applied to the player and fallback image,
	      // and those elements need to be scaled slightly.
	      // No other combination of filter target and scaling seems to work.
	      if (filter === 'blur') {
	        containerStyle.webkitFilter = '';
	        containerStyle.filter = '';
	        this.container.classList.add('filter-blur');
	
	        Array.prototype.slice.call(this.container.children).forEach(function (el) {
	          el.style.webkitFilter = filterStyle;
	          el.style.filter = filterStyle;
	        });
	      } else {
	        containerStyle.webkitFilter = filterStyle;
	        containerStyle.filter = filterStyle;
	        this.container.classList.remove('filter-blur');
	
	        Array.prototype.slice.call(this.container.children).forEach(function (el) {
	          el.style.webkitFilter = '';
	          el.style.filter = '';
	        });
	      }
	    }
	
	    /**
	     * Construct the style based on the filter strength and `FILTER_PROPERTIES`.
	     */
	
	  }, {
	    key: 'getFilterStyle',
	    value: function getFilterStyle(filter, strength) {
	      return filter + '(' + (FILTER_PROPERTIES[filter].modifier(strength) + FILTER_PROPERTIES[filter].unit) + ')';
	    }
	
	    /**
	     * The YouTube API seemingly does not expose the actual width and height dimensions
	     * of the video itself. The video's dimensions and ratio may be completely different
	     * than the IFRAME's. This hack finds those values inside some private objects.
	     * Since this is not part of the pbulic API the dimensions will fall back to the
	     * container width and height in case YouTube changes the internals unexpectedly.
	     */
	
	  }, {
	    key: '_findPlayerDimensions',
	    value: function _findPlayerDimensions() {
	      var _this7 = this;
	
	      var w = void 0;
	      var h = void 0;
	      if (this.videoSource === 'youtube') {
	        (function () {
	          w = _this7.container.clientWidth;
	          h = _this7.container.clientHeight;
	          var hasDimensions = false;
	          var playerObjs = [];
	          var player = _this7.player;
	          for (var o in player) {
	            if ((0, _typeof3["default"])(player[o]) === 'object') {
	              playerObjs.push(player[o]);
	            }
	          }
	          playerObjs.forEach(function (obj) {
	            for (var p in obj) {
	              if (hasDimensions) {
	                break;
	              }
	              try {
	                if ((0, _typeof3["default"])(obj[p]) === 'object' && !!obj[p].host) {
	                  if (obj[p].width && obj[p].height) {
	                    w = obj[p].width;
	                    h = obj[p].height;
	                    hasDimensions = true;
	                  }
	                }
	              } catch (err) {
	                // console.error(err);
	              }
	            }
	          });
	        })();
	      } else if (this.videoSource === 'vimeo') {
	        if (!this.player.dimensions) {
	          w = this.player.iframe.clientWidth;
	          h = this.player.iframe.clientHeight;
	        } else {
	          w = this.player.dimensions.width;
	          h = this.player.dimensions.height;
	        }
	      }
	      return {
	        'width': w,
	        'height': h
	      };
	    }
	
	    /**
	     * Get the start time base on the URL formats of YouTube and Vimeo.
	     */
	
	  }, {
	    key: '_getStartTime',
	    value: function _getStartTime(url) {
	      var parsedUrl = new parseUrl(url, true);
	
	      if (this.videoSource === 'youtube' && (!parsedUrl.query || !parsedUrl.query.t) || this.videoSource === 'vimeo' && !parsedUrl.hash) {
	        return false;
	      }
	
	      var timeParam = void 0;
	      switch (this.videoSource) {
	        case 'youtube':
	          timeParam = parsedUrl.query.t;
	          break;
	
	        case 'vimeo':
	          timeParam = parsedUrl.hash;
	          break;
	      }
	      var m = (timeParam.match(/\d+(?=m)/g) ? timeParam.match(/\d+(?=m)/g)[0] : 0) * 60;
	      var s = timeParam.match(/\d+(?=s)/g) ? timeParam.match(/\d+(?=s)/g)[0] : timeParam;
	      return parseInt(m, 10) + parseInt(s, 10);
	    }
	  }, {
	    key: 'mediaAutoplayTest',
	    value: function mediaAutoplayTest() {
	      var _this8 = this;
	
	      this.player.playTimeout = setTimeout(function () {
	        _this8.canAutoPlay = false;
	        _this8.container.classList.add('mobile');
	        _this8.logger('added mobile');
	      }, 2500);
	    }
	
	    /**
	      * Apply the purely visual effects.
	      */
	
	  }, {
	    key: 'syncPlayer',
	    value: function syncPlayer() {
	      this.setDisplayEffects();
	      if (this.videoSource === 'youtube') {
	        this.setSpeed();
	      }
	      this.scaleVideo();
	    }
	  }, {
	    key: 'logger',
	    value: function logger(msg) {
	      if (!DEBUG) {
	        return;
	      }
	
	      console.log(msg);
	    }
	  }]);
	  return VideoBackground;
	}();
	
	module.exports = VideoBackground;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(7), __esModule: true };

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var core  = __webpack_require__(8)
	  , $JSON = core.JSON || (core.JSON = {stringify: JSON.stringify});
	module.exports = function stringify(it){ // eslint-disable-line no-unused-vars
	  return $JSON.stringify.apply($JSON, arguments);
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(10), __esModule: true };

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(11);
	module.exports = __webpack_require__(8).Object.assign;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $export = __webpack_require__(12);
	
	$export($export.S + $export.F, 'Object', {assign: __webpack_require__(26)});

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(13)
	  , core      = __webpack_require__(8)
	  , ctx       = __webpack_require__(14)
	  , hide      = __webpack_require__(16)
	  , PROTOTYPE = 'prototype';
	
	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , expProto  = exports[PROTOTYPE]
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(a, b, c){
	        if(this instanceof C){
	          switch(arguments.length){
	            case 0: return new C;
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if(IS_PROTO){
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library` 
	module.exports = $export;

/***/ },
/* 13 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(15);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(17)
	  , createDesc = __webpack_require__(25);
	module.exports = __webpack_require__(21) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(18)
	  , IE8_DOM_DEFINE = __webpack_require__(20)
	  , toPrimitive    = __webpack_require__(24)
	  , dP             = Object.defineProperty;
	
	exports.f = __webpack_require__(21) ? Object.defineProperty : function defineProperty(O, P, Attributes){
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if(IE8_DOM_DEFINE)try {
	    return dP(O, P, Attributes);
	  } catch(e){ /* empty */ }
	  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	  if('value' in Attributes)O[P] = Attributes.value;
	  return O;
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(19);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(21) && !__webpack_require__(22)(function(){
	  return Object.defineProperty(__webpack_require__(23)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(22)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(19)
	  , document = __webpack_require__(13).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(19);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function(it, S){
	  if(!isObject(it))return it;
	  var fn, val;
	  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to primitive value");
	};

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 19.1.2.1 Object.assign(target, source, ...)
	var getKeys  = __webpack_require__(27)
	  , gOPS     = __webpack_require__(42)
	  , pIE      = __webpack_require__(43)
	  , toObject = __webpack_require__(44)
	  , IObject  = __webpack_require__(31)
	  , $assign  = Object.assign;
	
	// should work with symbols and should have deterministic property order (V8 bug)
	module.exports = !$assign || __webpack_require__(22)(function(){
	  var A = {}
	    , B = {}
	    , S = Symbol()
	    , K = 'abcdefghijklmnopqrst';
	  A[S] = 7;
	  K.split('').forEach(function(k){ B[k] = k; });
	  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
	}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
	  var T     = toObject(target)
	    , aLen  = arguments.length
	    , index = 1
	    , getSymbols = gOPS.f
	    , isEnum     = pIE.f;
	  while(aLen > index){
	    var S      = IObject(arguments[index++])
	      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
	      , length = keys.length
	      , j      = 0
	      , key;
	    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
	  } return T;
	} : $assign;

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(28)
	  , enumBugKeys = __webpack_require__(41);
	
	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(29)
	  , toIObject    = __webpack_require__(30)
	  , arrayIndexOf = __webpack_require__(34)(false)
	  , IE_PROTO     = __webpack_require__(38)('IE_PROTO');
	
	module.exports = function(object, names){
	  var O      = toIObject(object)
	    , i      = 0
	    , result = []
	    , key;
	  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while(names.length > i)if(has(O, key = names[i++])){
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

/***/ },
/* 29 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(31)
	  , defined = __webpack_require__(33);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(32);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 32 */
/***/ function(module, exports) {

	var toString = {}.toString;
	
	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 33 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(30)
	  , toLength  = __webpack_require__(35)
	  , toIndex   = __webpack_require__(37);
	module.exports = function(IS_INCLUDES){
	  return function($this, el, fromIndex){
	    var O      = toIObject($this)
	      , length = toLength(O.length)
	      , index  = toIndex(fromIndex, length)
	      , value;
	    // Array#includes uses SameValueZero equality algorithm
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    // Array#toIndex ignores holes, Array#includes - not
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(36)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 36 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(36)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(39)('keys')
	  , uid    = __webpack_require__(40);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(13)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 40 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 41 */
/***/ function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ },
/* 42 */
/***/ function(module, exports) {

	exports.f = Object.getOwnPropertySymbols;

/***/ },
/* 43 */
/***/ function(module, exports) {

	exports.f = {}.propertyIsEnumerable;

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(33);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _iterator = __webpack_require__(46);
	
	var _iterator2 = _interopRequireDefault(_iterator);
	
	var _symbol = __webpack_require__(66);
	
	var _symbol2 = _interopRequireDefault(_symbol);
	
	var _typeof = typeof _symbol2["default"] === "function" && typeof _iterator2["default"] === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2["default"] === "function" && obj.constructor === _symbol2["default"] ? "symbol" : typeof obj; };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	exports["default"] = typeof _symbol2["default"] === "function" && _typeof(_iterator2["default"]) === "symbol" ? function (obj) {
	  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
	} : function (obj) {
	  return obj && typeof _symbol2["default"] === "function" && obj.constructor === _symbol2["default"] ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
	};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(47), __esModule: true };

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(48);
	__webpack_require__(61);
	module.exports = __webpack_require__(65).f('iterator');

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(49)(true);
	
	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(50)(String, 'String', function(iterated){
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , index = this._i
	    , point;
	  if(index >= O.length)return {value: undefined, done: true};
	  point = $at(O, index);
	  this._i += point.length;
	  return {value: point, done: false};
	});

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(36)
	  , defined   = __webpack_require__(33);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function(TO_STRING){
	  return function(that, pos){
	    var s = String(defined(that))
	      , i = toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY        = __webpack_require__(51)
	  , $export        = __webpack_require__(12)
	  , redefine       = __webpack_require__(52)
	  , hide           = __webpack_require__(16)
	  , has            = __webpack_require__(29)
	  , Iterators      = __webpack_require__(53)
	  , $iterCreate    = __webpack_require__(54)
	  , setToStringTag = __webpack_require__(58)
	  , getPrototypeOf = __webpack_require__(60)
	  , ITERATOR       = __webpack_require__(59)('iterator')
	  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
	  , FF_ITERATOR    = '@@iterator'
	  , KEYS           = 'keys'
	  , VALUES         = 'values';
	
	var returnThis = function(){ return this; };
	
	module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function(kind){
	    if(!BUGGY && kind in proto)return proto[kind];
	    switch(kind){
	      case KEYS: return function keys(){ return new Constructor(this, kind); };
	      case VALUES: return function values(){ return new Constructor(this, kind); };
	    } return function entries(){ return new Constructor(this, kind); };
	  };
	  var TAG        = NAME + ' Iterator'
	    , DEF_VALUES = DEFAULT == VALUES
	    , VALUES_BUG = false
	    , proto      = Base.prototype
	    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , $default   = $native || getMethod(DEFAULT)
	    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
	    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
	    , methods, key, IteratorPrototype;
	  // Fix native
	  if($anyNative){
	    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
	    if(IteratorPrototype !== Object.prototype){
	      // Set @@toStringTag to native iterators
	      setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if(DEF_VALUES && $native && $native.name !== VALUES){
	    VALUES_BUG = true;
	    $default = function values(){ return $native.call(this); };
	  }
	  // Define iterator
	  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG]  = returnThis;
	  if(DEFAULT){
	    methods = {
	      values:  DEF_VALUES ? $default : getMethod(VALUES),
	      keys:    IS_SET     ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if(FORCED)for(key in methods){
	      if(!(key in proto))redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

/***/ },
/* 51 */
/***/ function(module, exports) {

	module.exports = true;

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(16);

/***/ },
/* 53 */
/***/ function(module, exports) {

	module.exports = {};

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var create         = __webpack_require__(55)
	  , descriptor     = __webpack_require__(25)
	  , setToStringTag = __webpack_require__(58)
	  , IteratorPrototype = {};
	
	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(16)(IteratorPrototype, __webpack_require__(59)('iterator'), function(){ return this; });
	
	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
	  setToStringTag(Constructor, NAME + ' Iterator');
	};

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject    = __webpack_require__(18)
	  , dPs         = __webpack_require__(56)
	  , enumBugKeys = __webpack_require__(41)
	  , IE_PROTO    = __webpack_require__(38)('IE_PROTO')
	  , Empty       = function(){ /* empty */ }
	  , PROTOTYPE   = 'prototype';
	
	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function(){
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = __webpack_require__(23)('iframe')
	    , i      = enumBugKeys.length
	    , lt     = '<'
	    , gt     = '>'
	    , iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(57).appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
	  return createDict();
	};
	
	module.exports = Object.create || function create(O, Properties){
	  var result;
	  if(O !== null){
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty;
	    Empty[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : dPs(result, Properties);
	};


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var dP       = __webpack_require__(17)
	  , anObject = __webpack_require__(18)
	  , getKeys  = __webpack_require__(27);
	
	module.exports = __webpack_require__(21) ? Object.defineProperties : function defineProperties(O, Properties){
	  anObject(O);
	  var keys   = getKeys(Properties)
	    , length = keys.length
	    , i = 0
	    , P;
	  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(13).document && document.documentElement;

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	var def = __webpack_require__(17).f
	  , has = __webpack_require__(29)
	  , TAG = __webpack_require__(59)('toStringTag');
	
	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var store      = __webpack_require__(39)('wks')
	  , uid        = __webpack_require__(40)
	  , Symbol     = __webpack_require__(13).Symbol
	  , USE_SYMBOL = typeof Symbol == 'function';
	
	var $exports = module.exports = function(name){
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};
	
	$exports.store = store;

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has         = __webpack_require__(29)
	  , toObject    = __webpack_require__(44)
	  , IE_PROTO    = __webpack_require__(38)('IE_PROTO')
	  , ObjectProto = Object.prototype;
	
	module.exports = Object.getPrototypeOf || function(O){
	  O = toObject(O);
	  if(has(O, IE_PROTO))return O[IE_PROTO];
	  if(typeof O.constructor == 'function' && O instanceof O.constructor){
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(62);
	var global        = __webpack_require__(13)
	  , hide          = __webpack_require__(16)
	  , Iterators     = __webpack_require__(53)
	  , TO_STRING_TAG = __webpack_require__(59)('toStringTag');
	
	for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
	  var NAME       = collections[i]
	    , Collection = global[NAME]
	    , proto      = Collection && Collection.prototype;
	  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
	  Iterators[NAME] = Iterators.Array;
	}

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(63)
	  , step             = __webpack_require__(64)
	  , Iterators        = __webpack_require__(53)
	  , toIObject        = __webpack_require__(30);
	
	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(50)(Array, 'Array', function(iterated, kind){
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , kind  = this._k
	    , index = this._i++;
	  if(!O || index >= O.length){
	    this._t = undefined;
	    return step(1);
	  }
	  if(kind == 'keys'  )return step(0, index);
	  if(kind == 'values')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');
	
	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;
	
	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

/***/ },
/* 63 */
/***/ function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ },
/* 64 */
/***/ function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	exports.f = __webpack_require__(59);

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(67), __esModule: true };

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(68);
	__webpack_require__(77);
	__webpack_require__(78);
	__webpack_require__(79);
	module.exports = __webpack_require__(8).Symbol;

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var global         = __webpack_require__(13)
	  , has            = __webpack_require__(29)
	  , DESCRIPTORS    = __webpack_require__(21)
	  , $export        = __webpack_require__(12)
	  , redefine       = __webpack_require__(52)
	  , META           = __webpack_require__(69).KEY
	  , $fails         = __webpack_require__(22)
	  , shared         = __webpack_require__(39)
	  , setToStringTag = __webpack_require__(58)
	  , uid            = __webpack_require__(40)
	  , wks            = __webpack_require__(59)
	  , wksExt         = __webpack_require__(65)
	  , wksDefine      = __webpack_require__(70)
	  , keyOf          = __webpack_require__(71)
	  , enumKeys       = __webpack_require__(72)
	  , isArray        = __webpack_require__(73)
	  , anObject       = __webpack_require__(18)
	  , toIObject      = __webpack_require__(30)
	  , toPrimitive    = __webpack_require__(24)
	  , createDesc     = __webpack_require__(25)
	  , _create        = __webpack_require__(55)
	  , gOPNExt        = __webpack_require__(74)
	  , $GOPD          = __webpack_require__(76)
	  , $DP            = __webpack_require__(17)
	  , $keys          = __webpack_require__(27)
	  , gOPD           = $GOPD.f
	  , dP             = $DP.f
	  , gOPN           = gOPNExt.f
	  , $Symbol        = global.Symbol
	  , $JSON          = global.JSON
	  , _stringify     = $JSON && $JSON.stringify
	  , PROTOTYPE      = 'prototype'
	  , HIDDEN         = wks('_hidden')
	  , TO_PRIMITIVE   = wks('toPrimitive')
	  , isEnum         = {}.propertyIsEnumerable
	  , SymbolRegistry = shared('symbol-registry')
	  , AllSymbols     = shared('symbols')
	  , OPSymbols      = shared('op-symbols')
	  , ObjectProto    = Object[PROTOTYPE]
	  , USE_NATIVE     = typeof $Symbol == 'function'
	  , QObject        = global.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;
	
	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = DESCRIPTORS && $fails(function(){
	  return _create(dP({}, 'a', {
	    get: function(){ return dP(this, 'a', {value: 7}).a; }
	  })).a != 7;
	}) ? function(it, key, D){
	  var protoDesc = gOPD(ObjectProto, key);
	  if(protoDesc)delete ObjectProto[key];
	  dP(it, key, D);
	  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
	} : dP;
	
	var wrap = function(tag){
	  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
	  sym._k = tag;
	  return sym;
	};
	
	var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
	  return typeof it == 'symbol';
	} : function(it){
	  return it instanceof $Symbol;
	};
	
	var $defineProperty = function defineProperty(it, key, D){
	  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
	  anObject(it);
	  key = toPrimitive(key, true);
	  anObject(D);
	  if(has(AllSymbols, key)){
	    if(!D.enumerable){
	      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
	      D = _create(D, {enumerable: createDesc(0, false)});
	    } return setSymbolDesc(it, key, D);
	  } return dP(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P){
	  anObject(it);
	  var keys = enumKeys(P = toIObject(P))
	    , i    = 0
	    , l = keys.length
	    , key;
	  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P){
	  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key){
	  var E = isEnum.call(this, key = toPrimitive(key, true));
	  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
	  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
	  it  = toIObject(it);
	  key = toPrimitive(key, true);
	  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
	  var D = gOPD(it, key);
	  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it){
	  var names  = gOPN(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i){
	    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
	  } return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
	  var IS_OP  = it === ObjectProto
	    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i){
	    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
	  } return result;
	};
	
	// 19.4.1.1 Symbol([description])
	if(!USE_NATIVE){
	  $Symbol = function Symbol(){
	    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
	    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
	    var $set = function(value){
	      if(this === ObjectProto)$set.call(OPSymbols, value);
	      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, createDesc(1, value));
	    };
	    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
	    return wrap(tag);
	  };
	  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
	    return this._k;
	  });
	
	  $GOPD.f = $getOwnPropertyDescriptor;
	  $DP.f   = $defineProperty;
	  __webpack_require__(75).f = gOPNExt.f = $getOwnPropertyNames;
	  __webpack_require__(43).f  = $propertyIsEnumerable;
	  __webpack_require__(42).f = $getOwnPropertySymbols;
	
	  if(DESCRIPTORS && !__webpack_require__(51)){
	    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }
	
	  wksExt.f = function(name){
	    return wrap(wks(name));
	  }
	}
	
	$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});
	
	for(var symbols = (
	  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
	).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);
	
	for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);
	
	$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function(key){
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(key){
	    if(isSymbol(key))return keyOf(SymbolRegistry, key);
	    throw TypeError(key + ' is not a symbol!');
	  },
	  useSetter: function(){ setter = true; },
	  useSimple: function(){ setter = false; }
	});
	
	$export($export.S + $export.F * !USE_NATIVE, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});
	
	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
	})), 'JSON', {
	  stringify: function stringify(it){
	    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
	    var args = [it]
	      , i    = 1
	      , replacer, $replacer;
	    while(arguments.length > i)args.push(arguments[i++]);
	    replacer = args[1];
	    if(typeof replacer == 'function')$replacer = replacer;
	    if($replacer || !isArray(replacer))replacer = function(key, value){
	      if($replacer)value = $replacer.call(this, key, value);
	      if(!isSymbol(value))return value;
	    };
	    args[1] = replacer;
	    return _stringify.apply($JSON, args);
	  }
	});
	
	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(16)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setToStringTag(global.JSON, 'JSON', true);

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	var META     = __webpack_require__(40)('meta')
	  , isObject = __webpack_require__(19)
	  , has      = __webpack_require__(29)
	  , setDesc  = __webpack_require__(17).f
	  , id       = 0;
	var isExtensible = Object.isExtensible || function(){
	  return true;
	};
	var FREEZE = !__webpack_require__(22)(function(){
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function(it){
	  setDesc(it, META, {value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  }});
	};
	var fastKey = function(it, create){
	  // return primitive with prefix
	  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return 'F';
	    // not necessary to add metadata
	    if(!create)return 'E';
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function(it, create){
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return true;
	    // not necessary to add metadata
	    if(!create)return false;
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function(it){
	  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY:      META,
	  NEED:     false,
	  fastKey:  fastKey,
	  getWeak:  getWeak,
	  onFreeze: onFreeze
	};

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	var global         = __webpack_require__(13)
	  , core           = __webpack_require__(8)
	  , LIBRARY        = __webpack_require__(51)
	  , wksExt         = __webpack_require__(65)
	  , defineProperty = __webpack_require__(17).f;
	module.exports = function(name){
	  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
	  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
	};

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	var getKeys   = __webpack_require__(27)
	  , toIObject = __webpack_require__(30);
	module.exports = function(object, el){
	  var O      = toIObject(object)
	    , keys   = getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var getKeys = __webpack_require__(27)
	  , gOPS    = __webpack_require__(42)
	  , pIE     = __webpack_require__(43);
	module.exports = function(it){
	  var result     = getKeys(it)
	    , getSymbols = gOPS.f;
	  if(getSymbols){
	    var symbols = getSymbols(it)
	      , isEnum  = pIE.f
	      , i       = 0
	      , key;
	    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
	  } return result;
	};

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(32);
	module.exports = Array.isArray || function isArray(arg){
	  return cof(arg) == 'Array';
	};

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(30)
	  , gOPN      = __webpack_require__(75).f
	  , toString  = {}.toString;
	
	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];
	
	var getWindowNames = function(it){
	  try {
	    return gOPN(it);
	  } catch(e){
	    return windowNames.slice();
	  }
	};
	
	module.exports.f = function getOwnPropertyNames(it){
	  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
	};


/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
	var $keys      = __webpack_require__(28)
	  , hiddenKeys = __webpack_require__(41).concat('length', 'prototype');
	
	exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
	  return $keys(O, hiddenKeys);
	};

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var pIE            = __webpack_require__(43)
	  , createDesc     = __webpack_require__(25)
	  , toIObject      = __webpack_require__(30)
	  , toPrimitive    = __webpack_require__(24)
	  , has            = __webpack_require__(29)
	  , IE8_DOM_DEFINE = __webpack_require__(20)
	  , gOPD           = Object.getOwnPropertyDescriptor;
	
	exports.f = __webpack_require__(21) ? gOPD : function getOwnPropertyDescriptor(O, P){
	  O = toIObject(O);
	  P = toPrimitive(P, true);
	  if(IE8_DOM_DEFINE)try {
	    return gOPD(O, P);
	  } catch(e){ /* empty */ }
	  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
	};

/***/ },
/* 77 */
/***/ function(module, exports) {



/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(70)('asyncIterator');

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(70)('observable');

/***/ },
/* 80 */
/***/ function(module, exports) {

	"use strict";
	
	exports.__esModule = true;
	
	exports["default"] = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _defineProperty = __webpack_require__(82);
	
	var _defineProperty2 = _interopRequireDefault(_defineProperty);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	exports["default"] = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      (0, _defineProperty2["default"])(target, descriptor.key, descriptor);
	    }
	  }
	
	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(83), __esModule: true };

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(84);
	var $Object = __webpack_require__(8).Object;
	module.exports = function defineProperty(it, key, desc){
	  return $Object.defineProperty(it, key, desc);
	};

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(12);
	// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	$export($export.S + $export.F * !__webpack_require__(21), 'Object', {defineProperty: __webpack_require__(17).f});

/***/ },
/* 85 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * CustomEvent polyfill for Internet Explorer versions >= 9
	 * Polyfill from
	 *   https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
	 */
	var custEvent = function custEvent() {
	  (function () {
	
	    function CustomEvent(event, params) {
	      params = params || { bubbles: false, cancelable: false, detail: undefined };
	      var evt = document.createEvent('CustomEvent');
	      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
	      return evt;
	    }
	
	    CustomEvent.prototype = window.Event.prototype;
	
	    window.CustomEvent = CustomEvent;
	  })();
	};
	
	module.exports = custEvent;

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var required = __webpack_require__(87)
	  , lolcation = __webpack_require__(88)
	  , qs = __webpack_require__(89)
	  , relativere = /^\/(?!\/)/
	  , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i;
	
	/**
	 * These are the parse instructions for the URL parsers, it informs the parser
	 * about:
	 *
	 * 0. The char it Needs to parse, if it's a string it should be done using
	 *    indexOf, RegExp using exec and NaN means set as current value.
	 * 1. The property we should set when parsing this value.
	 * 2. Indication if it's backwards or forward parsing, when set as number it's
	 *    the value of extra chars that should be split off.
	 * 3. Inherit from location if non existing in the parser.
	 * 4. `toLowerCase` the resulting value.
	 */
	var instructions = [
	  ['#', 'hash'],                        // Extract from the back.
	  ['?', 'query'],                       // Extract from the back.
	  ['/', 'pathname'],                    // Extract from the back.
	  ['@', 'auth', 1],                     // Extract from the front.
	  [NaN, 'host', undefined, 1, 1],       // Set left over value.
	  [/:(\d+)$/, 'port'],                  // RegExp the back.
	  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
	];
	
	 /**
	 * @typedef ProtocolExtract
	 * @type Object
	 * @property {String} protocol Protocol matched in the URL, in lowercase
	 * @property {Boolean} slashes Indicates whether the protocol is followed by double slash ("//")
	 * @property {String} rest     Rest of the URL that is not part of the protocol
	 */
	
	 /**
	  * Extract protocol information from a URL with/without double slash ("//")
	  *
	  * @param  {String} address   URL we want to extract from.
	  * @return {ProtocolExtract}  Extracted information
	  * @api private
	  */
	function extractProtocol(address) {
	  var match = protocolre.exec(address);
	
	  return {
	    protocol: match[1] ? match[1].toLowerCase() : '',
	    slashes: !!match[2],
	    rest: match[3] ? match[3] : ''
	  };
	}
	
	/**
	 * The actual URL instance. Instead of returning an object we've opted-in to
	 * create an actual constructor as it's much more memory efficient and
	 * faster and it pleases my OCD.
	 *
	 * @constructor
	 * @param {String} address URL we want to parse.
	 * @param {Object|String} location Location defaults for relative paths.
	 * @param {Boolean|Function} parser Parser for the query string.
	 * @api public
	 */
	function URL(address, location, parser) {
	  if (!(this instanceof URL)) {
	    return new URL(address, location, parser);
	  }
	
	  var relative = relativere.test(address)
	    , parse, instruction, index, key
	    , type = typeof location
	    , url = this
	    , extracted
	    , i = 0;
	
	  //
	  // The following if statements allows this module two have compatibility with
	  // 2 different API:
	  //
	  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
	  //    where the boolean indicates that the query string should also be parsed.
	  //
	  // 2. The `URL` interface of the browser which accepts a URL, object as
	  //    arguments. The supplied object will be used as default values / fall-back
	  //    for relative paths.
	  //
	  if ('object' !== type && 'string' !== type) {
	    parser = location;
	    location = null;
	  }
	
	  if (parser && 'function' !== typeof parser) {
	    parser = qs.parse;
	  }
	
	  location = lolcation(location);
	
	  //
	  // extract protocol information before running the instructions
	  //
	  extracted = extractProtocol(address);
	  url.protocol = extracted.protocol || location.protocol || '';
	  url.slashes = extracted.slashes || location.slashes;
	  address = extracted.rest;
	
	  for (; i < instructions.length; i++) {
	    instruction = instructions[i];
	    parse = instruction[0];
	    key = instruction[1];
	
	    if (parse !== parse) {
	      url[key] = address;
	    } else if ('string' === typeof parse) {
	      if (~(index = address.indexOf(parse))) {
	        if ('number' === typeof instruction[2]) {
	          url[key] = address.slice(0, index);
	          address = address.slice(index + instruction[2]);
	        } else {
	          url[key] = address.slice(index);
	          address = address.slice(0, index);
	        }
	      }
	    } else if (index = parse.exec(address)) {
	      url[key] = index[1];
	      address = address.slice(0, address.length - index[0].length);
	    }
	
	    url[key] = url[key] || (instruction[3] || ('port' === key && relative) ? location[key] || '' : '');
	
	    //
	    // Hostname, host and protocol should be lowercased so they can be used to
	    // create a proper `origin`.
	    //
	    if (instruction[4]) {
	      url[key] = url[key].toLowerCase();
	    }
	  }
	
	  //
	  // Also parse the supplied query string in to an object. If we're supplied
	  // with a custom parser as function use that instead of the default build-in
	  // parser.
	  //
	  if (parser) url.query = parser(url.query);
	
	  //
	  // We should not add port numbers if they are already the default port number
	  // for a given protocol. As the host also contains the port number we're going
	  // override it with the hostname which contains no port number.
	  //
	  if (!required(url.port, url.protocol)) {
	    url.host = url.hostname;
	    url.port = '';
	  }
	
	  //
	  // Parse down the `auth` for the username and password.
	  //
	  url.username = url.password = '';
	  if (url.auth) {
	    instruction = url.auth.split(':');
	    url.username = instruction[0] || '';
	    url.password = instruction[1] || '';
	  }
	
	  //
	  // The href is just the compiled result.
	  //
	  url.origin = url.protocol && url.host && url.protocol !== 'file:' ? url.protocol +'//'+ url.host : 'null';
	  url.href = url.toString();
	}
	
	/**
	 * This is convenience method for changing properties in the URL instance to
	 * insure that they all propagate correctly.
	 *
	 * @param {String} part          Property we need to adjust.
	 * @param {Mixed} value          The newly assigned value.
	 * @param {Boolean|Function} fn  When setting the query, it will be the function used to parse
	 *                               the query.
	 *                               When setting the protocol, double slash will be removed from
	 *                               the final url if it is true.
	 * @returns {URL}
	 * @api public
	 */
	URL.prototype.set = function set(part, value, fn) {
	  var url = this;
	
	  if ('query' === part) {
	    if ('string' === typeof value && value.length) {
	      value = (fn || qs.parse)(value);
	    }
	
	    url[part] = value;
	  } else if ('port' === part) {
	    url[part] = value;
	
	    if (!required(value, url.protocol)) {
	      url.host = url.hostname;
	      url[part] = '';
	    } else if (value) {
	      url.host = url.hostname +':'+ value;
	    }
	  } else if ('hostname' === part) {
	    url[part] = value;
	
	    if (url.port) value += ':'+ url.port;
	    url.host = value;
	  } else if ('host' === part) {
	    url[part] = value;
	
	    if (/:\d+$/.test(value)) {
	      value = value.split(':');
	      url.port = value.pop();
	      url.hostname = value.join(':');
	    } else {
	      url.hostname = value;
	      url.port = '';
	    }
	  } else if ('protocol' === part) {
	    url.protocol = value.toLowerCase();
	    url.slashes = !fn;
	  } else {
	    url[part] = value;
	  }
	
	  for (var i = 0; i < instructions.length; i++) {
	    var ins = instructions[i];
	
	    if (ins[4]) {
	      url[ins[1]] = url[ins[1]].toLowerCase();
	    }
	  }
	
	  url.origin = url.protocol && url.host && url.protocol !== 'file:' ? url.protocol +'//'+ url.host : 'null';
	  url.href = url.toString();
	
	  return url;
	};
	
	/**
	 * Transform the properties back in to a valid and full URL string.
	 *
	 * @param {Function} stringify Optional query stringify function.
	 * @returns {String}
	 * @api public
	 */
	URL.prototype.toString = function toString(stringify) {
	  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;
	
	  var query
	    , url = this
	    , protocol = url.protocol;
	
	  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';
	
	  var result = protocol + (url.slashes ? '//' : '');
	
	  if (url.username) {
	    result += url.username;
	    if (url.password) result += ':'+ url.password;
	    result += '@';
	  }
	
	  result += url.host + url.pathname;
	
	  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
	  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;
	
	  if (url.hash) result += url.hash;
	
	  return result;
	};
	
	//
	// Expose the URL parser and some additional properties that might be useful for
	// others or testing.
	//
	URL.extractProtocol = extractProtocol;
	URL.location = lolcation;
	URL.qs = qs;
	
	module.exports = URL;


/***/ },
/* 87 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Check if we're required to add a port number.
	 *
	 * @see https://url.spec.whatwg.org/#default-port
	 * @param {Number|String} port Port number we need to check
	 * @param {String} protocol Protocol we need to check against.
	 * @returns {Boolean} Is it a default port for the given protocol
	 * @api private
	 */
	module.exports = function required(port, protocol) {
	  protocol = protocol.split(':')[0];
	  port = +port;
	
	  if (!port) return false;
	
	  switch (protocol) {
	    case 'http':
	    case 'ws':
	    return port !== 80;
	
	    case 'https':
	    case 'wss':
	    return port !== 443;
	
	    case 'ftp':
	    return port !== 21;
	
	    case 'gopher':
	    return port !== 70;
	
	    case 'file':
	    return false;
	  }
	
	  return port !== 0;
	};


/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
	
	var slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;
	
	/**
	 * These properties should not be copied or inherited from. This is only needed
	 * for all non blob URL's as a blob URL does not include a hash, only the
	 * origin.
	 *
	 * @type {Object}
	 * @private
	 */
	var ignore = { hash: 1, query: 1 }
	  , URL;
	
	/**
	 * The location object differs when your code is loaded through a normal page,
	 * Worker or through a worker using a blob. And with the blobble begins the
	 * trouble as the location object will contain the URL of the blob, not the
	 * location of the page where our code is loaded in. The actual origin is
	 * encoded in the `pathname` so we can thankfully generate a good "default"
	 * location from it so we can generate proper relative URL's again.
	 *
	 * @param {Object|String} loc Optional default location object.
	 * @returns {Object} lolcation object.
	 * @api public
	 */
	module.exports = function lolcation(loc) {
	  loc = loc || global.location || {};
	  URL = URL || __webpack_require__(86);
	
	  var finaldestination = {}
	    , type = typeof loc
	    , key;
	
	  if ('blob:' === loc.protocol) {
	    finaldestination = new URL(unescape(loc.pathname), {});
	  } else if ('string' === type) {
	    finaldestination = new URL(loc, {});
	    for (key in ignore) delete finaldestination[key];
	  } else if ('object' === type) {
	    for (key in loc) {
	      if (key in ignore) continue;
	      finaldestination[key] = loc[key];
	    }
	
	    if (finaldestination.slashes === undefined) {
	      finaldestination.slashes = slashes.test(loc.href);
	    }
	  }
	
	  return finaldestination;
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 89 */
/***/ function(module, exports) {

	'use strict';
	
	var has = Object.prototype.hasOwnProperty;
	
	/**
	 * Simple query string parser.
	 *
	 * @param {String} query The query string that needs to be parsed.
	 * @returns {Object}
	 * @api public
	 */
	function querystring(query) {
	  var parser = /([^=?&]+)=?([^&]*)/g
	    , result = {}
	    , part;
	
	  //
	  // Little nifty parsing hack, leverage the fact that RegExp.exec increments
	  // the lastIndex property so we can continue executing this loop until we've
	  // parsed all results.
	  //
	  for (;
	    part = parser.exec(query);
	    result[decodeURIComponent(part[1])] = decodeURIComponent(part[2])
	  );
	
	  return result;
	}
	
	/**
	 * Transform a query string to an object.
	 *
	 * @param {Object} obj Object that should be transformed.
	 * @param {String} prefix Optional prefix.
	 * @returns {String}
	 * @api public
	 */
	function querystringify(obj, prefix) {
	  prefix = prefix || '';
	
	  var pairs = [];
	
	  //
	  // Optionally prefix with a '?' if needed
	  //
	  if ('string' !== typeof prefix) prefix = '?';
	
	  for (var key in obj) {
	    if (has.call(obj, key)) {
	      pairs.push(encodeURIComponent(key) +'='+ encodeURIComponent(obj[key]));
	    }
	  }
	
	  return pairs.length ? prefix + pairs.join('&') : '';
	}
	
	//
	// Expose the module.
	//
	exports.stringify = querystringify;
	exports.parse = querystring;


/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _promise = __webpack_require__(91);
	
	var _promise2 = _interopRequireDefault(_promise);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	/*
	The MIT License (MIT)
	Copyright (c) 2016
	Faruk Ates
	Paul Irish
	Alex Sexton
	Ryan Seddon
	Patrick Kettner
	Stu Cox
	Richard Herrera
	
	Permission is hereby granted, free of charge, to any person obtaining a copy of
	this software and associated documentation files (the "Software"), to deal in
	the Software without restriction, including without limitation the rights to
	use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
	of the Software, and to permit persons to whom the Software is furnished to do
	so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
	*/
	
	var DEBUG = false;
	
	var RETRIES = 5;
	var WAITTIME = 200; //ms
	
	var _require = __webpack_require__(107);
	
	var OggVideo = _require.OggVideo;
	var Mp4Video = _require.Mp4Video;
	
	
	var VideoAutoplayTest = function VideoAutoplayTest() {
	  return new _promise2["default"](function (resolve, reject) {
	    if (DEBUG === 'resolve') {
	      resolve(true);
	      return;
	    } else if (DEBUG === 'reject') {
	      reject('rejected for debugging');
	      return;
	    }
	
	    var elem = document.createElement('video');
	    var elemStyle = elem.style;
	
	    var currentTry = 0;
	    var timeout = void 0;
	
	    var testAutoplay = function testAutoplay(evt) {
	      currentTry++;
	      clearTimeout(timeout);
	
	      var canAutoPlay = evt && evt.type === 'playing' || elem.currentTime !== 0;
	
	      if (!canAutoPlay && currentTry < RETRIES) {
	        timeout = setTimeout(testAutoplay, WAITTIME);
	        return;
	      }
	
	      elem.removeEventListener('playing', testAutoplay, false);
	      if (canAutoPlay) {
	        resolve(canAutoPlay);
	      } else {
	        reject('no autoplay: browser does not support autoplay');
	      }
	      elem.parentNode.removeChild(elem);
	    };
	
	    // skip the test if the autoplay isn't supported on `video` elements
	    if (!('autoplay' in elem)) {
	      reject('no autoplay: browser does not support autoplay attribute');
	      return;
	    }
	
	    elemStyle.cssText = 'position: absolute; height: 0; width: 0; overflow: hidden; visibility: hidden; z-index: -100';
	
	    try {
	      if (elem.canPlayType('video/ogg; codecs="theora"').match(/^(probably)|(maybe)/)) {
	        elem.src = OggVideo;
	      } else if (elem.canPlayType('video/mp4; codecs="avc1.42E01E"').match(/^(probably)|(maybe)/)) {
	        elem.src = Mp4Video;
	      } else {
	        reject('no autoplay: element does not support mp4 or ogg format');
	        return;
	      }
	    } catch (err) {
	      reject('no autoplay: ' + err);
	      return;
	    }
	
	    elem.setAttribute('autoplay', '');
	    elem.setAttribute('muted', 'true');
	    elem.style.cssText = 'display:none';
	    document.body.appendChild(elem);
	    // wait for the next tick to add the listener, otherwise the element may
	    // not have time to play in high load situations (e.g. the test suite)
	    setTimeout(function () {
	      elem.addEventListener('playing', testAutoplay, false);
	      timeout = setTimeout(testAutoplay, WAITTIME);
	    }, 0);
	  });
	};
	
	module.exports = VideoAutoplayTest;

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(92), __esModule: true };

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(77);
	__webpack_require__(48);
	__webpack_require__(61);
	__webpack_require__(93);
	module.exports = __webpack_require__(8).Promise;

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY            = __webpack_require__(51)
	  , global             = __webpack_require__(13)
	  , ctx                = __webpack_require__(14)
	  , classof            = __webpack_require__(94)
	  , $export            = __webpack_require__(12)
	  , isObject           = __webpack_require__(19)
	  , aFunction          = __webpack_require__(15)
	  , anInstance         = __webpack_require__(95)
	  , forOf              = __webpack_require__(96)
	  , speciesConstructor = __webpack_require__(100)
	  , task               = __webpack_require__(101).set
	  , microtask          = __webpack_require__(103)()
	  , PROMISE            = 'Promise'
	  , TypeError          = global.TypeError
	  , process            = global.process
	  , $Promise           = global[PROMISE]
	  , process            = global.process
	  , isNode             = classof(process) == 'process'
	  , empty              = function(){ /* empty */ }
	  , Internal, GenericPromiseCapability, Wrapper;
	
	var USE_NATIVE = !!function(){
	  try {
	    // correct subclassing with @@species support
	    var promise     = $Promise.resolve(1)
	      , FakePromise = (promise.constructor = {})[__webpack_require__(59)('species')] = function(exec){ exec(empty, empty); };
	    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
	  } catch(e){ /* empty */ }
	}();
	
	// helpers
	var sameConstructor = function(a, b){
	  // with library wrapper special case
	  return a === b || a === $Promise && b === Wrapper;
	};
	var isThenable = function(it){
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};
	var newPromiseCapability = function(C){
	  return sameConstructor($Promise, C)
	    ? new PromiseCapability(C)
	    : new GenericPromiseCapability(C);
	};
	var PromiseCapability = GenericPromiseCapability = function(C){
	  var resolve, reject;
	  this.promise = new C(function($$resolve, $$reject){
	    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject  = $$reject;
	  });
	  this.resolve = aFunction(resolve);
	  this.reject  = aFunction(reject);
	};
	var perform = function(exec){
	  try {
	    exec();
	  } catch(e){
	    return {error: e};
	  }
	};
	var notify = function(promise, isReject){
	  if(promise._n)return;
	  promise._n = true;
	  var chain = promise._c;
	  microtask(function(){
	    var value = promise._v
	      , ok    = promise._s == 1
	      , i     = 0;
	    var run = function(reaction){
	      var handler = ok ? reaction.ok : reaction.fail
	        , resolve = reaction.resolve
	        , reject  = reaction.reject
	        , domain  = reaction.domain
	        , result, then;
	      try {
	        if(handler){
	          if(!ok){
	            if(promise._h == 2)onHandleUnhandled(promise);
	            promise._h = 1;
	          }
	          if(handler === true)result = value;
	          else {
	            if(domain)domain.enter();
	            result = handler(value);
	            if(domain)domain.exit();
	          }
	          if(result === reaction.promise){
	            reject(TypeError('Promise-chain cycle'));
	          } else if(then = isThenable(result)){
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch(e){
	        reject(e);
	      }
	    };
	    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
	    promise._c = [];
	    promise._n = false;
	    if(isReject && !promise._h)onUnhandled(promise);
	  });
	};
	var onUnhandled = function(promise){
	  task.call(global, function(){
	    var value = promise._v
	      , abrupt, handler, console;
	    if(isUnhandled(promise)){
	      abrupt = perform(function(){
	        if(isNode){
	          process.emit('unhandledRejection', value, promise);
	        } else if(handler = global.onunhandledrejection){
	          handler({promise: promise, reason: value});
	        } else if((console = global.console) && console.error){
	          console.error('Unhandled promise rejection', value);
	        }
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
	    } promise._a = undefined;
	    if(abrupt)throw abrupt.error;
	  });
	};
	var isUnhandled = function(promise){
	  if(promise._h == 1)return false;
	  var chain = promise._a || promise._c
	    , i     = 0
	    , reaction;
	  while(chain.length > i){
	    reaction = chain[i++];
	    if(reaction.fail || !isUnhandled(reaction.promise))return false;
	  } return true;
	};
	var onHandleUnhandled = function(promise){
	  task.call(global, function(){
	    var handler;
	    if(isNode){
	      process.emit('rejectionHandled', promise);
	    } else if(handler = global.onrejectionhandled){
	      handler({promise: promise, reason: promise._v});
	    }
	  });
	};
	var $reject = function(value){
	  var promise = this;
	  if(promise._d)return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  promise._v = value;
	  promise._s = 2;
	  if(!promise._a)promise._a = promise._c.slice();
	  notify(promise, true);
	};
	var $resolve = function(value){
	  var promise = this
	    , then;
	  if(promise._d)return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  try {
	    if(promise === value)throw TypeError("Promise can't be resolved itself");
	    if(then = isThenable(value)){
	      microtask(function(){
	        var wrapper = {_w: promise, _d: false}; // wrap
	        try {
	          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
	        } catch(e){
	          $reject.call(wrapper, e);
	        }
	      });
	    } else {
	      promise._v = value;
	      promise._s = 1;
	      notify(promise, false);
	    }
	  } catch(e){
	    $reject.call({_w: promise, _d: false}, e); // wrap
	  }
	};
	
	// constructor polyfill
	if(!USE_NATIVE){
	  // 25.4.3.1 Promise(executor)
	  $Promise = function Promise(executor){
	    anInstance(this, $Promise, PROMISE, '_h');
	    aFunction(executor);
	    Internal.call(this);
	    try {
	      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
	    } catch(err){
	      $reject.call(this, err);
	    }
	  };
	  Internal = function Promise(executor){
	    this._c = [];             // <- awaiting reactions
	    this._a = undefined;      // <- checked in isUnhandled reactions
	    this._s = 0;              // <- state
	    this._d = false;          // <- done
	    this._v = undefined;      // <- value
	    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
	    this._n = false;          // <- notify
	  };
	  Internal.prototype = __webpack_require__(104)($Promise.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function then(onFulfilled, onRejected){
	      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
	      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail   = typeof onRejected == 'function' && onRejected;
	      reaction.domain = isNode ? process.domain : undefined;
	      this._c.push(reaction);
	      if(this._a)this._a.push(reaction);
	      if(this._s)notify(this, false);
	      return reaction.promise;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function(onRejected){
	      return this.then(undefined, onRejected);
	    }
	  });
	  PromiseCapability = function(){
	    var promise  = new Internal;
	    this.promise = promise;
	    this.resolve = ctx($resolve, promise, 1);
	    this.reject  = ctx($reject, promise, 1);
	  };
	}
	
	$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
	__webpack_require__(58)($Promise, PROMISE);
	__webpack_require__(105)(PROMISE);
	Wrapper = __webpack_require__(8)[PROMISE];
	
	// statics
	$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function reject(r){
	    var capability = newPromiseCapability(this)
	      , $$reject   = capability.reject;
	    $$reject(r);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function resolve(x){
	    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
	    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
	    var capability = newPromiseCapability(this)
	      , $$resolve  = capability.resolve;
	    $$resolve(x);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(106)(function(iter){
	  $Promise.all(iter)['catch'](empty);
	})), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function all(iterable){
	    var C          = this
	      , capability = newPromiseCapability(C)
	      , resolve    = capability.resolve
	      , reject     = capability.reject;
	    var abrupt = perform(function(){
	      var values    = []
	        , index     = 0
	        , remaining = 1;
	      forOf(iterable, false, function(promise){
	        var $index        = index++
	          , alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        C.resolve(promise).then(function(value){
	          if(alreadyCalled)return;
	          alreadyCalled  = true;
	          values[$index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if(abrupt)reject(abrupt.error);
	    return capability.promise;
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function race(iterable){
	    var C          = this
	      , capability = newPromiseCapability(C)
	      , reject     = capability.reject;
	    var abrupt = perform(function(){
	      forOf(iterable, false, function(promise){
	        C.resolve(promise).then(capability.resolve, reject);
	      });
	    });
	    if(abrupt)reject(abrupt.error);
	    return capability.promise;
	  }
	});

/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(32)
	  , TAG = __webpack_require__(59)('toStringTag')
	  // ES3 wrong here
	  , ARG = cof(function(){ return arguments; }()) == 'Arguments';
	
	// fallback for IE11 Script Access Denied error
	var tryGet = function(it, key){
	  try {
	    return it[key];
	  } catch(e){ /* empty */ }
	};
	
	module.exports = function(it){
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
	    // builtinTag case
	    : ARG ? cof(O)
	    // ES3 arguments fallback
	    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

/***/ },
/* 95 */
/***/ function(module, exports) {

	module.exports = function(it, Constructor, name, forbiddenField){
	  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
	    throw TypeError(name + ': incorrect invocation!');
	  } return it;
	};

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	var ctx         = __webpack_require__(14)
	  , call        = __webpack_require__(97)
	  , isArrayIter = __webpack_require__(98)
	  , anObject    = __webpack_require__(18)
	  , toLength    = __webpack_require__(35)
	  , getIterFn   = __webpack_require__(99)
	  , BREAK       = {}
	  , RETURN      = {};
	var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
	  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
	    , f      = ctx(fn, that, entries ? 2 : 1)
	    , index  = 0
	    , length, step, iterator, result;
	  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
	    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	    if(result === BREAK || result === RETURN)return result;
	  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
	    result = call(iterator, f, step.value, entries);
	    if(result === BREAK || result === RETURN)return result;
	  }
	};
	exports.BREAK  = BREAK;
	exports.RETURN = RETURN;

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(18);
	module.exports = function(iterator, fn, value, entries){
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch(e){
	    var ret = iterator['return'];
	    if(ret !== undefined)anObject(ret.call(iterator));
	    throw e;
	  }
	};

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators  = __webpack_require__(53)
	  , ITERATOR   = __webpack_require__(59)('iterator')
	  , ArrayProto = Array.prototype;
	
	module.exports = function(it){
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};

/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(94)
	  , ITERATOR  = __webpack_require__(59)('iterator')
	  , Iterators = __webpack_require__(53);
	module.exports = __webpack_require__(8).getIteratorMethod = function(it){
	  if(it != undefined)return it[ITERATOR]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};

/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	// 7.3.20 SpeciesConstructor(O, defaultConstructor)
	var anObject  = __webpack_require__(18)
	  , aFunction = __webpack_require__(15)
	  , SPECIES   = __webpack_require__(59)('species');
	module.exports = function(O, D){
	  var C = anObject(O).constructor, S;
	  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
	};

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	var ctx                = __webpack_require__(14)
	  , invoke             = __webpack_require__(102)
	  , html               = __webpack_require__(57)
	  , cel                = __webpack_require__(23)
	  , global             = __webpack_require__(13)
	  , process            = global.process
	  , setTask            = global.setImmediate
	  , clearTask          = global.clearImmediate
	  , MessageChannel     = global.MessageChannel
	  , counter            = 0
	  , queue              = {}
	  , ONREADYSTATECHANGE = 'onreadystatechange'
	  , defer, channel, port;
	var run = function(){
	  var id = +this;
	  if(queue.hasOwnProperty(id)){
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};
	var listener = function(event){
	  run.call(event.data);
	};
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if(!setTask || !clearTask){
	  setTask = function setImmediate(fn){
	    var args = [], i = 1;
	    while(arguments.length > i)args.push(arguments[i++]);
	    queue[++counter] = function(){
	      invoke(typeof fn == 'function' ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function clearImmediate(id){
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if(__webpack_require__(32)(process) == 'process'){
	    defer = function(id){
	      process.nextTick(ctx(run, id, 1));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  } else if(MessageChannel){
	    channel = new MessageChannel;
	    port    = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = ctx(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
	    defer = function(id){
	      global.postMessage(id + '', '*');
	    };
	    global.addEventListener('message', listener, false);
	  // IE8-
	  } else if(ONREADYSTATECHANGE in cel('script')){
	    defer = function(id){
	      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
	        html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function(id){
	      setTimeout(ctx(run, id, 1), 0);
	    };
	  }
	}
	module.exports = {
	  set:   setTask,
	  clear: clearTask
	};

/***/ },
/* 102 */
/***/ function(module, exports) {

	// fast apply, http://jsperf.lnkit.com/fast-apply/5
	module.exports = function(fn, args, that){
	  var un = that === undefined;
	  switch(args.length){
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	  } return              fn.apply(that, args);
	};

/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(13)
	  , macrotask = __webpack_require__(101).set
	  , Observer  = global.MutationObserver || global.WebKitMutationObserver
	  , process   = global.process
	  , Promise   = global.Promise
	  , isNode    = __webpack_require__(32)(process) == 'process';
	
	module.exports = function(){
	  var head, last, notify;
	
	  var flush = function(){
	    var parent, fn;
	    if(isNode && (parent = process.domain))parent.exit();
	    while(head){
	      fn   = head.fn;
	      head = head.next;
	      try {
	        fn();
	      } catch(e){
	        if(head)notify();
	        else last = undefined;
	        throw e;
	      }
	    } last = undefined;
	    if(parent)parent.enter();
	  };
	
	  // Node.js
	  if(isNode){
	    notify = function(){
	      process.nextTick(flush);
	    };
	  // browsers with MutationObserver
	  } else if(Observer){
	    var toggle = true
	      , node   = document.createTextNode('');
	    new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
	    notify = function(){
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if(Promise && Promise.resolve){
	    var promise = Promise.resolve();
	    notify = function(){
	      promise.then(flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessag
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    notify = function(){
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(global, flush);
	    };
	  }
	
	  return function(fn){
	    var task = {fn: fn, next: undefined};
	    if(last)last.next = task;
	    if(!head){
	      head = task;
	      notify();
	    } last = task;
	  };
	};

/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	var hide = __webpack_require__(16);
	module.exports = function(target, src, safe){
	  for(var key in src){
	    if(safe && target[key])target[key] = src[key];
	    else hide(target, key, src[key]);
	  } return target;
	};

/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var global      = __webpack_require__(13)
	  , core        = __webpack_require__(8)
	  , dP          = __webpack_require__(17)
	  , DESCRIPTORS = __webpack_require__(21)
	  , SPECIES     = __webpack_require__(59)('species');
	
	module.exports = function(KEY){
	  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
	  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
	    configurable: true,
	    get: function(){ return this; }
	  });
	};

/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	var ITERATOR     = __webpack_require__(59)('iterator')
	  , SAFE_CLOSING = false;
	
	try {
	  var riter = [7][ITERATOR]();
	  riter['return'] = function(){ SAFE_CLOSING = true; };
	  Array.from(riter, function(){ throw 2; });
	} catch(e){ /* empty */ }
	
	module.exports = function(exec, skipClosing){
	  if(!skipClosing && !SAFE_CLOSING)return false;
	  var safe = false;
	  try {
	    var arr  = [7]
	      , iter = arr[ITERATOR]();
	    iter.next = function(){ return {done: safe = true}; };
	    arr[ITERATOR] = function(){ return iter; };
	    exec(arr);
	  } catch(e){ /* empty */ }
	  return safe;
	};

/***/ },
/* 107 */
/***/ function(module, exports) {

	'use strict';
	
	var OggVideo = 'data:video/ogg;base64,T2dnUwACAAAAAAAAAABmnCATAAAAAHDEixYBKoB0aGVvcmEDAgEAAQABAAAQAAAQAAAAAAAFAAAAAQAAAAAAAAAAAGIAYE9nZ1MAAAAAAAAAAAAAZpwgEwEAAAACrA7TDlj///////////////+QgXRoZW9yYSsAAABYaXBoLk9yZyBsaWJ0aGVvcmEgMS4xIDIwMDkwODIyIChUaHVzbmVsZGEpAQAAABoAAABFTkNPREVSPWZmbXBlZzJ0aGVvcmEtMC4yOYJ0aGVvcmG+zSj3uc1rGLWpSUoQc5zmMYxSlKQhCDGMYhCEIQhAAAAAAAAAAAAAEW2uU2eSyPxWEvx4OVts5ir1aKtUKBMpJFoQ/nk5m41mUwl4slUpk4kkghkIfDwdjgajQYC8VioUCQRiIQh8PBwMhgLBQIg4FRba5TZ5LI/FYS/Hg5W2zmKvVoq1QoEykkWhD+eTmbjWZTCXiyVSmTiSSCGQh8PB2OBqNBgLxWKhQJBGIhCHw8HAyGAsFAiDgUCw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDAwPEhQUFQ0NDhESFRUUDg4PEhQVFRUOEBETFBUVFRARFBUVFRUVEhMUFRUVFRUUFRUVFRUVFRUVFRUVFRUVEAwLEBQZGxwNDQ4SFRwcGw4NEBQZHBwcDhATFhsdHRwRExkcHB4eHRQYGxwdHh4dGxwdHR4eHh4dHR0dHh4eHRALChAYKDM9DAwOExo6PDcODRAYKDlFOA4RFh0zV1A+EhYlOkRtZ00YIzdAUWhxXDFATldneXhlSFxfYnBkZ2MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEhIVGRoaGhoSFBYaGhoaGhUWGRoaGhoaGRoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhESFh8kJCQkEhQYIiQkJCQWGCEkJCQkJB8iJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQREhgvY2NjYxIVGkJjY2NjGBo4Y2NjY2MvQmNjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRISEhUXGBkbEhIVFxgZGxwSFRcYGRscHRUXGBkbHB0dFxgZGxwdHR0YGRscHR0dHhkbHB0dHR4eGxwdHR0eHh4REREUFxocIBERFBcaHCAiERQXGhwgIiUUFxocICIlJRcaHCAiJSUlGhwgIiUlJSkcICIlJSUpKiAiJSUlKSoqEBAQFBgcICgQEBQYHCAoMBAUGBwgKDBAFBgcICgwQEAYHCAoMEBAQBwgKDBAQEBgICgwQEBAYIAoMEBAQGCAgAfF5cdH1e3Ow/L66wGmYnfIUbwdUTe3LMRbqON8B+5RJEvcGxkvrVUjTMrsXYhAnIwe0dTJfOYbWrDYyqUrz7dw/JO4hpmV2LsQQvkUeGq1BsZLx+cu5iV0e0eScJ91VIQYrmqfdVSK7GgjOU0oPaPOu5IcDK1mNvnD+K8LwS87f8Jx2mHtHnUkTGAurWZlNQa74ZLSFH9oF6FPGxzLsjQO5Qe0edcpttd7BXBSqMCL4k/4tFrHIPuEQ7m1/uIWkbDMWVoDdOSuRQ9286kvVUlQjzOE6VrNguN4oRXYGkgcnih7t13/9kxvLYKQezwLTrO44sVmMPgMqORo1E0sm1/9SludkcWHwfJwTSybR4LeAz6ugWVgRaY8mV/9SluQmtHrzsBtRF/wPY+X0JuYTs+ltgrXAmlk10xQHmTu9VSIAk1+vcvU4ml2oNzrNhEtQ3CysNP8UeR35wqpKUBdGdZMSjX4WVi8nJpdpHnbhzEIdx7mwf6W1FKAiucMXrWUWVjyRf23chNtR9mIzDoT/6ZLYailAjhFlZuvPtSeZ+2oREubDoWmT3TguY+JHPdRVSLKxfKH3vgNqJ/9emeEYikGXDFNzaLjvTeGAL61mogOoeG3y6oU4rW55ydoj0lUTSR/mmRhPmF86uwIfzp3FtiufQCmppaHDlGE0r2iTzXIw3zBq5hvaTldjG4CPb9wdxAme0SyedVKczJ9AtYbgPOzYKJvZZImsN7ecrxWZg5dR6ZLj/j4qpWsIA+vYwE+Tca9ounMIsrXMB4Stiib2SPQtZv+FVIpfEbzv8ncZoLBXc3YBqTG1HsskTTotZOYTG+oVUjLk6zhP8bg4RhMUNtfZdO7FdpBuXzhJ5Fh8IKlJG7wtD9ik8rWOJxy6iQ3NwzBpQ219mlyv+FLicYs2iJGSE0u2txzed++D61ZWCiHD/cZdQVCqkO2gJpdpNaObhnDfAPrT89RxdWFZ5hO3MseBSIlANppdZNIV/Rwe5eLTDvkfWKzFnH+QJ7m9QWV1KdwnuIwTNtZdJMoXBf74OhRnh2t+OTGL+AVUnIkyYY+QG7g9itHXyF3OIygG2s2kud679ZWKqSFa9n3IHD6MeLv1lZ0XyduRhiDRtrNnKoyiFVLcBm0ba5Yy3fQkDh4XsFE34isVpOzpa9nR8iCpS4HoxG2rJpnRhf3YboVa1PcRouh5LIJv/uQcPNd095ickTaiGBnWLKVWRc0OnYTSyex/n2FofEPnDG8y3PztHrzOLK1xo6RAml2k9owKajOC0Wr4D5x+3nA0UEhK2m198wuBHF3zlWWVKWLN1CHzLClUfuoYBcx4b1llpeBKmbayaR58njtE9onD66lUcsg0Spm2snsb+8HaJRn4dYcLbCuBuYwziB8/5U1C1DOOz2gZjSZtrLJk6vrLF3hwY4Io9xuT/ruUFRSBkNtUzTOWhjh26irLEPx4jPZL3Fo3QrReoGTTM21xYTT9oFdhTUIvjqTkfkvt0bzgVUjq/hOYY8j60IaO/0AzRBtqkTS6R5ellZd5uKdzzhb8BFlDdAcrwkE0rbXTOPB+7Y0FlZO96qFL4Ykg21StJs8qIW7h16H5hGiv8V2Cflau7QVDepTAHa6Lgt6feiEvJDM21StJsmOH/hynURrKxvUpQ8BH0JF7BiyG2qZpnL/7AOU66gt+reLEXY8pVOCQvSsBtqZTNM8bk9ohRcwD18o/WVkbvrceVKRb9I59IEKysjBeTMmmbA21xu/6iHadLRxuIzkLpi8wZYmmbbWi32RVAUjruxWlJ//iFxE38FI9hNKOoCdhwf5fDe4xZ81lgREhK2m1j78vW1CqkuMu/AjBNK210kzRUX/B+69cMMUG5bYrIeZxVSEZISmkzbXOi9yxwIfPgdsov7R71xuJ7rFcACjG/9PzApqFq7wEgzNJm2suWESPuwrQvejj7cbnQxMkxpm21lUYJL0fKmogPPqywn7e3FvB/FCNxPJ85iVUkCE9/tLKx31G4CgNtWTTPFhMvlu8G4/TrgaZttTChljfNJGgOT2X6EqpETy2tYd9cCBI4lIXJ1/3uVUllZEJz4baqGF64yxaZ+zPLYwde8Uqn1oKANtUrSaTOPHkhvuQP3bBlEJ/LFe4pqQOHUI8T8q7AXx3fLVBgSCVpMba55YxN3rv8U1Dv51bAPSOLlZWebkL8vSMGI21lJmmeVxPRwFlZF1CpqCN8uLwymaZyjbXHCRytogPN3o/n74CNykfT+qqRv5AQlHcRxYrC5KvGmbbUwmZY/29BvF6C1/93x4WVglXDLFpmbapmF89HKTogRwqqSlGbu+oiAkcWFbklC6Zhf+NtTLFpn8oWz+HsNRVSgIxZWON+yVyJlE5tq/+GWLTMutYX9ekTySEQPLVNQQ3OfycwJBM0zNtZcse7CvcKI0V/zh16Dr9OSA21MpmmcrHC+6pTAPHPwoit3LHHqs7jhFNRD6W8+EBGoSEoaZttTCZljfduH/fFisn+dRBGAZYtMzbVMwvul/T/crK1NQh8gN0SRRa9cOux6clC0/mDLFpmbarmF8/e6CopeOLCNW6S/IUUg3jJIYiAcDoMcGeRbOvuTPjXR/tyo79LK3kqqkbxkkMRAOB0GODPItnX3Jnxro/25Ud+llbyVVSN4ySGIgHA6DHBnkWzr7kz410f7cqO/Syt5KqpFVJwn6gBEvBM0zNtZcpGOEPiysW8vvRd2R0f7gtjhqUvXL+gWVwHm4XJDBiMpmmZtrLfPwd/IugP5+fKVSysH1EXreFAcEhelGmbbUmZY4Xdo1vQWVnK19P4RuEnbf0gQnR+lDCZlivNM22t1ESmopPIgfT0duOfQrsjgG4tPxli0zJmF5trdL1JDUIUT1ZXSqQDeR4B8mX3TrRro/2McGeUvLtwo6jIEKMkCUXWsLyZROd9P/rFYNtXPBli0z398iVUlVKAjFlY437JXImUTm2r/4ZYtMy61hf16RPJIU9nZ1MABAwAAAAAAAAAZpwgEwIAAABhp658BScAAAAAAADnUFBQXIDGXLhwtttNHDhw5OcpQRMETBEwRPduylKVB0HRdF0A';
	var Mp4Video = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAs1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjYwMSBhMGNkN2QzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAD2WIhAA3//728P4FNjuZQQAAAu5tb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAZAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACGHRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAZAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAgAAAAIAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAGQAAAAAAAEAAAAAAZBtZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAACgAAAAEAFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAE7bWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAA+3N0YmwAAACXc3RzZAAAAAAAAAABAAAAh2F2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAgACAEgAAABIAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY//8AAAAxYXZjQwFkAAr/4QAYZ2QACqzZX4iIhAAAAwAEAAADAFA8SJZYAQAGaOvjyyLAAAAAGHN0dHMAAAAAAAAAAQAAAAEAAAQAAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAABAAAAAQAAABRzdHN6AAAAAAAAAsUAAAABAAAAFHN0Y28AAAAAAAAAAQAAADAAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjU2LjQwLjEwMQ==';
	
	module.exports = {
	  OggVideo: OggVideo,
	  Mp4Video: Mp4Video
	};

/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _freeze = __webpack_require__(109);
	
	var _freeze2 = _interopRequireDefault(_freeze);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	var filterOptions = ['none', 'blur', 'brightness', 'contrast', 'invert', 'opacity', 'saturate', 'sepia', 'drop-shadow', 'grayscale', 'hue-rotate'];
	
	(0, _freeze2["default"])(filterOptions);
	
	/**
	 * Each filter style needs to adjust the strength value (1 - 100) by a `modifier`
	 * function and a unit, as appropriate. The `modifier` is purely subjective.
	 */
	var filterProperties = {
	  blur: {
	    modifier: function modifier(value) {
	      return value * 0.3;
	    },
	    unit: 'px'
	  },
	  brightness: {
	    modifier: function modifier(value) {
	      return value * 0.009 + 0.1;
	    },
	    unit: ''
	  },
	  contrast: {
	    modifier: function modifier(value) {
	      return value * 0.4 + 80;
	    },
	    unit: '%'
	  },
	  grayscale: {
	    modifier: function modifier(value) {
	      return value;
	    },
	    unit: '%'
	  },
	  'hue-rotate': {
	    modifier: function modifier(value) {
	      return value * 3.6;
	    },
	    unit: 'deg'
	  },
	  invert: {
	    modifier: function modifier(value) {
	      return 1;
	    },
	    unit: ''
	  },
	  opacity: {
	    modifier: function modifier(value) {
	      return value;
	    },
	    unit: '%'
	  },
	  saturate: {
	    modifier: function modifier(value) {
	      return value * 2;
	    },
	    unit: '%'
	  },
	  sepia: {
	    modifier: function modifier(value) {
	      return value;
	    },
	    unit: '%'
	  }
	};
	
	(0, _freeze2["default"])(filterProperties);
	
	module.exports = {
	  filterOptions: filterOptions,
	  filterProperties: filterProperties
	};

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(110), __esModule: true };

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(111);
	module.exports = __webpack_require__(8).Object.freeze;

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.5 Object.freeze(O)
	var isObject = __webpack_require__(19)
	  , meta     = __webpack_require__(69).onFreeze;
	
	__webpack_require__(112)('freeze', function($freeze){
	  return function freeze(it){
	    return $freeze && isObject(it) ? $freeze(meta(it)) : it;
	  };
	});

/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	var $export = __webpack_require__(12)
	  , core    = __webpack_require__(8)
	  , fails   = __webpack_require__(22);
	module.exports = function(KEY, exec){
	  var fn  = (core.Object || {})[KEY] || Object[KEY]
	    , exp = {};
	  exp[KEY] = exec(fn);
	  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
	};

/***/ },
/* 113 */
/***/ function(module, exports) {

	var getPropsFromNode = function(node) {
	  var props = {
	    'container': node
	  };
	
	  if (node.getAttribute('data-config-url')) {
	    props.url = node.getAttribute('data-config-url');
	  }
	
	  if (node.getAttribute('data-config-playback-speed')) {
	    props.playbackSpeed = node.getAttribute('data-config-playback-speed');
	  }
	
	  if (node.getAttribute('data-config-filter')) {
	    props.filter = node.getAttribute('data-config-filter');
	  }
	
	  if (node.getAttribute('data-config-filter-strength')) {
	    props.filterStrength = node.getAttribute('data-config-filter-strength');
	  }
	
	  return props;
	};
	
	module.exports = getPropsFromNode;


/***/ }
/******/ ]);