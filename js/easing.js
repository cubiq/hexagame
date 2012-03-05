HEXA.easing = (function () {

	function linear (key) {
		return key;
	}

	function elasticOut (key, elasticity, friction) {
		friction = friction || 0.225;
		elasticity = elasticity || 1;

		if ( key === 0 ) { return 0; }
		if ( key == 1 ) { return 1; }

		return ( elasticity * Math.pow( 2, - 10 * key ) * Math.sin( ( key - friction / 4 ) * ( 2 * Math.PI ) / friction ) + 1 );
	}

	function sineInOut (key) {
		return - 0.5 * ( Math.cos( Math.PI * key ) - 1 );
	}

	function cubicIn (key) {
		return key * key * key;
	}

	function quadraticIn (key) {
		return key * key;
	}

	function quadraticOut (key) {
		return - key * ( key - 2 );
	}

	function backIn (key, bounce) {
		bounce = bounce === undefined ? 4 : bounce;
		return key * key * ( ( bounce + 1 ) * key - bounce );
	}

	function backOut (key, bounce) {
		bounce = bounce === undefined ? 4 : bounce;
		return ( key = key - 1 ) * key * ( ( bounce + 1 ) * key + bounce ) + 1;
	}

	function bounce (key) {
		if ( ( key /= 1 ) < ( 1 / 2.75 ) ) {
			return 7.5625 * key * key;
		} else if ( key < ( 2 / 2.75 ) ) {
			return 7.5625 * ( key -= ( 1.5 / 2.75 ) ) * key + 0.75;
		} else if ( key < ( 2.5 / 2.75 ) ) {
			return 7.5625 * ( key -= ( 2.25 / 2.75 ) ) * key + 0.9375;
		} else {
			return 7.5625 * ( key -= ( 2.625 / 2.75 ) ) * key + 0.984375;
		}
	}

	return {
		linear: linear,
		elasticOut: elasticOut,
		sineInOut: sineInOut,
		cubicIn: cubicIn,
		quadraticIn: quadraticIn,
		quadraticOut: quadraticOut,
		backIn: backIn,
		backOut: backOut,
		bounce: bounce
	};
})();