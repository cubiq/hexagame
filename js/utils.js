var HEXA = {};

HEXA.utils = (function () {
	var random;


	/**
	*
	* Selector shortcusts
	*
	*/
	function $ (q, context) {
		return (context || document).querySelector(q);
	}

	$.all = function (q, context) {
		return (context || document).querySelectorAll(q);
	};

	$.id = function (q, context) {
		return (context || document).getElementById(q);
	};


	/**
	*
	* callback for each dom element
	*
	*/
	function forEach (el, fn) {
		if ( typeof el == 'string' ) {
			el = $.all(el);
		} else if ( typeof el == 'object' && 'nodeType' in el ) {
			el = [el];
		}

		var i = 0,
			l = el.length;

		for ( ; i < l; i++ ) fn.call(el[i]);
	}


	/**
	*
	* style class manipulation
	*
	*/
	function hasClass (el, value) {
		return new RegExp('(^|\\s)' + value + '(\\s|$)').test(el.className);
	}
	
	function addClass (el, value, repaint) {
		if ( !hasClass(el, value) ) el.className = el.className ? el.className + ' ' + value : value;
		if ( repaint ) el.offsetHeight;
	}
	
	// Not using regex here to get a cleaner output
	function removeClass (el, value, repaint) {
		if ( !el.className ) return;

		var classes = el.className.split(' '),
			newClasses = [],
			i = 0,
			l = classes.length;

		for ( ; i < l; i++ ) {
			if (classes[i] != value) newClasses.push(classes[i]);
		}
		el.className = newClasses.join(' ');
		if ( repaint ) el.offsetHeight;
	}
	
	function toggleClass (el, value) {
		if ( hasClass(el, value) ) removeClass(el, value);
		else addClass(el, value);
	}


	/**
	*
	* Apply styles to element
	*
	*/
	function style (el, value, repaint) {
		for ( var i in value ) el.style[i] = value[i];
		
		if ( repaint ) el.offsetHeight;
	}

	function translate (el, x, y, scale) {
		el.style[HEXA.parms.transform] = 'translate(' + x + 'px,' + y + 'px)' + HEXA.parms.translateZ + ( scale !== undefined ? ' scale(' + scale + ')' : '');
	}

	function backgroundPos (el, x, y) {
		el.style.backgroundPosition = Math.round(x) + 'px ' + Math.round(y) + 'px';
	}

	function getTranslate (el) {
		var matrix = window.getComputedStyle(el, null)[HEXA.parms.transform];

		if ( HEXA.parms.CSSMatrix ) {
			matrix = new HEXA.parms.CSSMatrix(matrix);
			return {
				x: matrix.e,
				y: matrix.f
			};
		}

		matrix = matrix.split('(')[1].replace(/[^\d\-.,]/g, '').split(',');
		return {
			x: +matrix[4],
			y: +matrix[5]
		};
	}


	/**
	*
	* Events
	*
	*/
	function bind (el, type, fn, capture) {
		el.addEventListener(type, fn, !!capture);
	}

	function unbind (el, type, fn, capture) {
		el.removeEventListener(type, fn, !!capture);
	}


	/**
	*
	* Create element
	*
	*/
	function create (tag) {
		return document.createElement(tag);
	}


	function myTimeout (callback, duration) {
		duration = Date.now() + duration;

		function step () {
			var now = Date.now();

			if ( duration > now ) return;

			HEXA.render.removeKeyframeFn(step);
			callback();
		}

		HEXA.render.addKeyframeFn(step);
		HEXA.render.start();

		return step;
	}

	function clearMyTimeout (callback) {
		HEXA.render.removeKeyframeFn(callback);
	}

	/**
	*
	* Core animation function
	*
	*/
	function animate (el, options) {
		var startTime = Date.now(),
			from = options.from,
			to = options.to,
			duration = options.duration,
			easing = options.easing || HEXA.easing.linear,
			callback = options.callback,
			context = options.context;

		from.x = from.x || 0;
		from.y = from.y || 0;
		to.x = to.x || 0;
		to.y = to.y || 0;

		startTime += options.delay || 0;

		function step () {
			var now = Date.now(),
				newX,
				newY,
				newBgX,
				newBgY,
				newOpacity,
				newScale,
				ease;

			if ( startTime > now ) return;

			if ( now >= startTime + duration ) {
				if ( to.opacity !== undefined ) el.style.opacity = to.opacity;
				if ( to.bgX !== undefined ) el.style.backgroundPosition = to.bgX + 'px ' + to.bgY + 'px';

				translate(el, to.x, to.y, to.scale);

				HEXA.render.removeKeyframeFn(step);
				if ( callback ) callback(el);
				return;
			}

			now = (now - startTime) / duration;
			ease = easing(now);

			if ( to.opacity !== undefined ) {
				newOpacity = (to.opacity - from.opacity) * ease + from.opacity;
				el.style.opacity = newOpacity;
			}

			if ( to.bgX !== undefined ) {
				newBgX = Math.round((to.bgX - from.bgX) * ease + from.bgX);
				newBgY = Math.round((to.bgY - from.bgY) * ease + from.bgY);
				el.style.backgroundPosition = newBgX + 'px ' + newBgY + 'px';
			}

			if ( to.scale !== undefined ) {
				newScale = (to.scale - from.scale) * ease + from.scale;
			}

			newX = (to.x - from.x) * ease + from.x;
			newY = (to.y - from.y) * ease + from.y;

			translate(el, newX, newY, newScale);	// Translate is always applied so that the element is forced in the HW layer
		}

		if ( context ) step.context = context;

		HEXA.render.addKeyframeFn(step);
		HEXA.render.start();

		return step;
	}


	/**
	*
	* Random Number Generator
	* Based on code by Johannes Baagoe (http://baagoe.org/en/wiki/Better_random_numbers_for_javascript)
	*
	*/
	function Mash () {
		var n = 0xefc8249d,

			mash = function (data) {
				var i, l, h;
			
				data = data.toString();
				for (i=0, l=data.length; i<l; i++) {
					n += data.charCodeAt(i);
					h = 0.02519603282416938* n;
					n = h >>> 0;
					h -= n;
					h *= n;
					n = h >>> 0;
					h -= n;
					n += h * 0x100000000; // 2^32
				}

				return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
			};

		return mash;
	}
	
	function Alea (seed) {
		var s0 = 0,
			s1 = 0,
			s2 = 0,
			c = 1,
			i, l,
			r,
			mash = Mash();

		seed = seed || Date.now();

		s0 = mash(' ');
		s1 = mash(' ');
		s2 = mash(' ');

		s0 -= mash(seed);
		if (s0 < 0) s0 += 1;
		s1 -= mash(seed);
		if (s1 < 0) s1 += 1;
		s2 -= mash(seed);
		if (s2 < 0) s2 += 1;

		mash = null;

		r = function() {
			var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
			s0 = s1;
			s1 = s2;
			return (s2 = t - (c = t | 0));
		};

		r.seed = seed;
		return r;
	}
	
	function rnd (min, max) {
		if ( !random ) randomInit();
		if ( !max ) {
			max = min;
			min = 0;
		}

		return Math.floor(random() * (max - min + 1)) + min;
	}
	
	function randomInit (seed) {
		random = Alea(seed);
		return random.seed;
	}


	/**
	*
	* Add commas to number
	*
	*/
	function formatNumber (n) {
		var rgx = /(\d+)(\d{3})/;
		n += '';

		while ( rgx.test(n) ) {
			n = n.replace(rgx, '$1' + ',' + '$2');
		}
		
		return n;
	}


	/**
	*
	* Ready... GO!
	*
	*/
	function readyGo (callback) {
		var el = create('div'),
			height;
		el.id = 'readyGo';
		$.id('boardwrapper').appendChild(el);
		height = el.offsetHeight;

		animate(el, {
			from: { bgX: 0, bgY: height },
			to: { bgX: 0, bgY: 0 },
			delay: 200,
			duration: 250,
			easing: HEXA.easing.sineInOut,
			callback: function () {
				animate(el, {
					from: { bgX: 0, bgY: 0 },
					to: { bgX: 0, bgY: -height },
					delay: 900,
					duration: 250,
					easing: HEXA.easing.sineInOut,
					callback: function () {
						animate(el, {
							from: { bgX: 0, bgY: -height },
							to: { bgX: 0, bgY: -height * 2 },
							delay: 900,
							duration: 250,
							easing: HEXA.easing.sineInOut,
							callback: function () {
								el.parentNode.removeChild(el);
								if ( callback ) callback();
							}
						});
					}
				});
			}
		});
	}


	/**
	*
	* Floating messages on the board (eg: "Level Up!", "Bonus Word", ...)
	*
	*/
	function floatMessage (tile, text, distance, duration) {
		var x = tile.offsetLeft + Math.round(tile.offsetWidth / 2) - 200,
			y = tile.offsetTop - 20,
			el = document.createElement('div');

		el.className = 'floatingMessage';
		el.style.left = x + 'px';
		el.style.top = y + 'px';
		el.innerHTML = text;
		tile.parentNode.appendChild(el);
		el.offsetHeight;

		animate(el, {
			from: { x: 0, y: 0, opacity: 1 },
			to: { x: 0, y: distance, opacity: 0 },
			duration: duration,
			delay: 800,
			easing: HEXA.easing.cubicIn,
			callback: function () {
				el.parentNode.removeChild(el);
			}
		});
	}


	/**
	*
	* Ajax
	*
	*/
	function ajax (url, parms) {
		var req = new XMLHttpRequest(),
			post = parms.post || null,
			callback = parms.callback || null,
			timeout = parms.timeout || null;

		req.onreadystatechange = function () {
			if ( req.readyState != 4 ) return;

			// Error
			if ( req.status != 200 && req.status != 304 ) {
				if ( callback ) callback(false);
				return;
			}

			if ( callback ) callback(req.responseText);
		};

		if ( post ) {
			req.open("POST", url, true);
			req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		} else {
			req.open('GET', url, true);
		}

		req.send(post);

		if ( timeout ) {
			setTimeout(function () {
				req.onreadystatechange = function () {};
				req.abort();
				if ( callback ) callback(false);
			}, timeout);
		}
	}


	/**
	*
	* Cookie
	*
	*/
	function getCookie (name) {
		var nameEQ = name + "=",
			ca = document.cookie.split(';'),
			i = 0,
			l = ca.length,
			c;

		for ( ;i < l; i++) {
			c = ca[i];
			while ( c.charAt(0) == ' ' ) {
				c = c.substring(1, c.length);
			}

			if ( c.indexOf(nameEQ) === 0 ) return c.substring(nameEQ.length, c.length);
		}

		return null;
	}


	/**
	*
	* Escape HTML
	*
	*/
	function escapeHTML (value) {
		return (value + '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
	}

	return {
		$: $,

		hasClass: hasClass,
		addClass: addClass,
		removeClass: removeClass,
		toggleClass: toggleClass,

		forEach: forEach,
		
		style: style,
		translate: translate,
		getTranslate: getTranslate,

		bind: bind,
		unbind: unbind,

		create: create,

		myTimeout: myTimeout,
		clearMyTimeout: clearMyTimeout,

		animate: animate,

		rnd: rnd,
		randomInit: randomInit,

		formatNumber: formatNumber,
		floatMessage: floatMessage,

		readyGo: readyGo,

		ajax: ajax,

		getCookie: getCookie,

		escapeHTML: escapeHTML
	};
})();

var $ = HEXA.utils.$;