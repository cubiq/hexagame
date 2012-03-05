HEXA.countdown = (function () {
	var	// Libs
		utils = HEXA.utils,

		timeRemaining = 0,

		// Elements
		minEl,
		secEl,

		// Callback
		onCompletion,

		// Timer
		timer;

	function init (seconds, callback) {
		minEl = $.id('sbTimeMin');
		secEl = $.id('sbTimeSec');

		set(seconds);
		setOnCompletion(callback);
	}

	function set (seconds) {
		pause();
		timeRemaining = seconds || 0;
		_updateLabel();
	}

	function add (value) {
		//pause();
		timeRemaining += value;
		
		if ( timeRemaining > 300 ) timeRemaining = 300;

		_updateLabel();
		//start();
	}

	function setOnCompletion (callback) {
		onCompletion = callback;
	}

	function pause () {
		//clearTimeout(timer);
		utils.clearMyTimeout(timer);
	}

	function start () {
		//clearTimeout(timer);
		utils.clearMyTimeout(timer);

		_tick();
	}

	function _updateLabel () {
		var minVal,
			secVal;

		minVal = Math.floor(timeRemaining / 60);
		secVal = (timeRemaining % 60).toString();
		if (secVal.length < 2) secVal = '0' + secVal;

		minEl.innerHTML = minVal;
		secEl.innerHTML = secVal;
	}

	function _tick () {
		timeRemaining--;
		if ( timeRemaining < 0 ) timeRemaining = 0;
		
		_updateLabel();

		if ( timeRemaining === 0 ) {
			//clearTimeout(timer);
			utils.clearMyTimeout(timer);
			if (onCompletion) onCompletion();
			return;
		}
		
		//timer = setTimeout(_tick, 1000);
		timer = utils.myTimeout(_tick, 1000);
	}

	function get () {
		return timeRemaining;
	}

	return {
		init: init,
		set: set,
		get: get,
		add: add,
		setOnCompletion: setOnCompletion,
		pause: pause,
		start: start
	};
})();