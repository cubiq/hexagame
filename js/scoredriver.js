HEXA.scoredriver = (function () {
	var	// Libs
		utils = HEXA.utils,

		// Elements
		scoreEl,

		// Counters
		counter,
		totalScore,

		// well... Timer
		timer;

	function init (points) {
		scoreEl = $('#sbScore .value');
		set(points);
	}

	function set (points) {
		//clearTimeout(timer);
		utils.clearMyTimeout(timer);

		counter = points || 0;
		totalScore = counter;
		scoreEl.innerHTML = utils.formatNumber(totalScore);
	}

	function _ticker () {
		var value = totalScore - counter,
			dist = Math.pow(10, value.toString().length - 1);

		counter += dist;

		scoreEl.innerHTML = utils.formatNumber(counter);

		//if (counter < totalScore) timer = setTimeout(_ticker, 50);
		if (counter < totalScore) timer = utils.myTimeout(_ticker, 50);
	}
		
	function add (value) {
		//clearTimeout(timer);
		utils.clearMyTimeout(timer);

		totalScore += value;
		if ( totalScore == counter ) return;
		_ticker();
	}

	function get () {
		return totalScore;
	}

	return {
		init: init,
		set: set,
		add: add,
		get: get
	};
})();