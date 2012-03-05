HEXA.render = (function (w) {
	var // Request Animation Frame
		rAF = w.requestAnimationFrame ||
				w.webkitRequestAnimationFrame ||
				w.mozRequestAnimationFrame ||
				w.oRequestAnimationFrame ||
				w.msRequestAnimationFrame ||
				function ( callback ) {
					w.setTimeout(callback, 16);
				},

		// Libs
		utils = HEXA.utils,
		
		// Elements to animate
		buffer = [],
		keyframeFn = [],

		isRolling = false;

	function loop () {
		var i = 0,
			l = keyframeFn.length;

		if ( !l ) {
			isRolling = false;
			return;
		}

		isRolling = true;
		rAF(loop);

		for ( ; i < l; i++ ) {
			if ( keyframeFn[i] ) keyframeFn[i].call();
		}
	}

	function render () {
		var i = 0,
			l = buffer.length;
							
		for ( ; i < l; i++ ) {
			utils.style(buffer[i].el, buffer[i].style);
		}
	}

	function start () {
		if ( isRolling || !keyframeFn.length ) return;

		loop();
	}

	function stop () {
		isRolling = false;
	}

	function addKeyframeFn (fn, context) {
		keyframeFn.push(fn);
	}

	function removeKeyframeFn (fn) {
		var i = 0,
			l = keyframeFn.length;
		
		for ( ; i < l; i++ ) {
			if ( keyframeFn[i] === fn ) {
				keyframeFn.splice(i, 1);
			}
		}
	}

	function removeKeyframesByContext (context) {
		var i = 0,
			l = keyframeFn.length;

		for ( ; i < l; i++ ) {
			if ( keyframeFn[i] && keyframeFn[i].context === context ) {
				keyframeFn.splice(i, 1);
			}
		}
	}

	function clearKeyframeFn () {
		keyframeFn = [];
	}

	return {
		start: start,
		stop: stop,
		addKeyframeFn: addKeyframeFn,
		removeKeyframeFn: removeKeyframeFn,
		removeKeyframesByContext: removeKeyframesByContext,
		clearKeyframeFn: clearKeyframeFn
	};
})(this);