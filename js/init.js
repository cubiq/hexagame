HEXA.parms = {};

HEXA.init = (function (w) {
	var	// Version
		version = '0.9.5b',

		// Libs
		parms = HEXA.parms,
		utils = HEXA.utils,
		userinfo = HEXA.userinfo,

		// DOM elements
		head,
		body,
		game,
		loading;

	function detectDevice () {
		var nav = w.navigator,
			el = utils.create('div'),

			platform = 'desktop',
			os = 'generic',
			vendors = ',webkit,Moz,ms,O'.split(','),
			transform,

			i = 0, l = vendors.length;

		parms.hasTouch = 'ontouchstart' in el;

		for ( ; i < l; i++ ) {
			transform = vendors[i] + (vendors[i] !== '' ? 'T' : 't') + 'ransform';
			if ( transform in el.style ) {
				parms.vendor = vendors[i];
				parms.transform = transform;
				break;
			}
		}

		if ( parms.hasTouch && screen.width < 481 ) {
			platform = 'mobile';
		} else if ( parms.hasTouch && screen.width < 1281 ) {
			platform = 'tablet';
		}

		if ( (/ipad|iphone|ipod/i).test(nav.platform) ) {
			os = 'iOS';
		} else if ( (/android/i).test(nav.appVersion) ) {
			os = 'android';
		}

		parms.platform = platform;
		parms.OS = os;
		parms.initialOrientation = screen.width > screen.height ? 90 : 0;
		parms.orientation = ( w.orientation + parms.initialOrientation ) % 180 ? 'landscape' : 'portrait';
		parms.resizeEv = platform == 'browser' ? 'resize' : 'orientationchange';
		parms.isGoodBrowser = parms.vendor == 'webkit';		// Sad but true

		// Dimensions
		parms.width = 960;
		parms.height = 720;
		parms.mapWidth = 9;
		parms.mapHeight = 8;

		if ( platform == 'desktop' ) {
			parms.tileWidth = 80;
			parms.tileHeight = 70;
		} else {
			if ( parms.orientation == 'portrait' ) {
				parms.tileWidth = 87;
				parms.tileHeight = 76;
			} else {
				parms.tileWidth = 80;
				parms.tileHeight = 70;
			}
		}

		// Has 3d?
		body.appendChild(el);
		el.style[parms.transform] = 'translateZ(1px)';
		parms.translateZ = (/3d/i).test(w.getComputedStyle(el,null)[parms.transform]) ? ' translateZ(0)' : '';
		parms.CSSMatrix = w.WebKitCSSMatrix;

		// Locale
		parms.language = (nav.language || '').replace("-", "_").toLowerCase();
		if ( parms.language == 'en' || (parms.language != 'en_us' && parms.language != 'en_uk') ) parms.language = 'en_us';

		if ( !userinfo.getLocale() ) userinfo.setLocale(parms.language);

		utils.addClass(body, parms.platform);
		utils.addClass(body, parms.OS);
		utils.addClass(body, parms.orientation);

		body.removeChild(el);
	}

	function checkOrientation (e) {
		parms.orientation = ( w.orientation + parms.initialOrientation ) % 180 ? 'landscape' : 'portrait';
		w.scrollTo(0,0);

		if ( parms.orientation == 'portrait' ) {
			utils.removeClass(body, 'landscape');
			utils.addClass(body, 'portrait');
		} else {
			utils.removeClass(body, 'portrait');
			utils.addClass(body, 'landscape');
		}

		// Update tile size
		if ( parms.platform != 'desktop' ) {
			if ( parms.orientation == 'portrait' ) {
				parms.tileWidth = 87;
				parms.tileHeight = 76;
			} else {
				parms.tileWidth = 80;
				parms.tileHeight = 70;
			}
		}

		setTimeout( function() {
			utils.bind(w, 'scroll', scrolled);
			scrollTop();

			//updateSize();
		}, 500);
	}

	function updateSize () {
		utils.style(game, {
			width: parms.width + 'px',
			height: parms.height + 'px'
		});
	}

	function scrollTop (callback) {
		if ( w.scrollY != 1 ) {
			w.scrollTo(0, 1);

			if ( typeof callback == 'function' ) setTimeout(callback, 10);
		}
	}

	function setViewport () {
		var meta = utils.create('meta'),
			pixelRatio = 'devicePixelRatio' in w && w.devicePixelRatio ? w.devicePixelRatio : 1,
			initialScale = 1 / pixelRatio;

		parms.pixelRatio = pixelRatio;

		meta.setAttribute('name', 'viewport');
		meta.setAttribute('content', 'width=device-width, user-scalable=no, maximum-scale=' + initialScale + ', initial-scale=' + initialScale);
		head.appendChild(meta);
	}

	function setStylesheet () {
		var style = utils.create('link');

		style.setAttribute('type', 'text/css');
		style.setAttribute('rel', 'stylesheet');
		style.setAttribute('href', 'styles/' + parms.platform + '.css?v17');
		head.appendChild(style);
	}

	function init () {
		head = document.getElementsByTagName('head')[0];
		body = document.body;
		game = $.id('game');
		loading = $.id('preload');

		//setViewport();
		detectDevice();
		setStylesheet();

		if ( parms.platform != 'browser' ) {
			utils.bind(w, parms.resizeEv, checkOrientation);
			utils.bind(document, 'touchmove', function (e) { e.preventDefault(); });
		}

		utils.bind(w, 'load', loaded);
	}

	function loaded () {
		utils.unbind(w, 'load', loaded);

		// Hide URL bar and debug bar on iPhone and iPad
		if ( parms.platform != 'desktop' ) {
			w.scrollTo(0,0);

			//utils.bind(w, 'scroll', delayedStart);
			utils.bind(document, 'touchstart', scrollTop);

			utils.style(body, { paddingBottom: '300px' });

			setTimeout( function () {
				scrollTop(delayedStart);
			}, 500);

			return;
		}

		start();
	}

	function delayedStart () {
		//utils.unbind(w, 'scroll', delayedStart);

		parms.width = w.innerWidth;
		parms.height = w.innerHeight;

		updateSize();
		start();
	}

	function scrolled () {
		utils.unbind(w, 'scroll', scrolled);

		parms.width = w.innerWidth;
		parms.height = w.innerHeight;

		updateSize();
	}

	function start () {
		HEXA.dictionary.init(function () {
			HEXA.audio.init(function () {
				HEXA.mainmenu.init();

				game.style.left = parms.platform == 'desktop' ? '50%' : '0px';
				loading.style.display = 'none';

				$.id('versioning').innerHTML = 'v' + version;

				setTimeout(function () {
					loading.parentNode.removeChild(loading);

					HEXA.userinfo.verify(function () {
						// Check if we have some saved score to send to the leaderboard
						if ( userinfo.isLogged() && userinfo.getScoreDelivery() ) {
							utils.ajax('req/sendScore.php', {
								post: userinfo.getScoreDelivery(true),
								callback: function (result) {
									result = w.JSON.parse(result);
									if ( result.status == 'success' ) {
										userinfo.setScoreDelivery();	// Clear the saved score
										userinfo.setHighScore(result.score);
									}
								}
							});
						}

						if ( userinfo.isLogged() && !userinfo.getName() ) {
							HEXA.mainmenu.askName();
						} else {
							HEXA.mainmenu.enter();
						}
					});
				}, 400);
			});
		});
	}

	if ( !('devicePixelRatio' in w) ) w.devicePixelRatio = 1;

	return init;
})(this);