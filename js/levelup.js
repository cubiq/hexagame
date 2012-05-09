HEXA.levelup = (function () {
	var	// Libs
		utils = HEXA.utils,
		render = HEXA.render,

		// Elements
		progressbarEl,
		levelLabelEl,

		progressbarSize,

		currentLevel,
		currentValue,
		maxValue,

		onLevelUp,

		animationInstance;

	function init () {
		progressbarEl = $.id('levelProgress');
		levelLabelEl = $('#sbLevel .value');

		progressbarSize = progressbarEl.offsetWidth;
		set();
	}

	function set (level, value) {
		currentLevel = level || 1;
		currentValue = value || 0;
		levelLabelEl.innerHTML = currentLevel;

		_updateMaxValue();
		_pos();
	}

	function setCallback (callback) {
		onLevelUp = callback;
	}

	function add (value) {
		currentValue += value;

		if ( currentValue >= maxValue ) {
			_levelUp();
			if ( onLevelUp ) onLevelUp(currentLevel);
			return;
		}

		_pos();
	}

	function _updateMaxValue () {
		maxValue = 18 + currentLevel * 9;
	}

	function _pos () {
		var pos = -progressbarSize + Math.round(progressbarSize / maxValue * currentValue),
			currentPosition = +window.getComputedStyle(progressbarEl, null).backgroundPosition.split(' ')[0].replace(/[^\d\-]/g, '');	// Unfortunately not all browsers support backgroundPositionX

		if ( animationInstance ) render.removeKeyframeFn(animationInstance);

		if ( pos == currentPosition ) return;

		animationInstance = utils.animate(progressbarEl, {
			from: { bgX: currentPosition, bgY: 0 },
			to: { bgX: pos, bgY: 0 },
			duration: 300,
			easing: HEXA.easing.sineInOut,
			callback: function () { animationInstance = null; }
		});
	}

	function _levelUp () {
		var currentPosition = +window.getComputedStyle(progressbarEl, null).backgroundPosition.split(' ')[0].replace(/[^\d\-]/g, '');	// Unfortunately not all browsers support backgroundPositionX

		currentLevel++;
		levelLabelEl.innerHTML = currentLevel;
		currentValue -= maxValue;
		_updateMaxValue();

		if ( animationInstance ) render.removeKeyframeFn(animationInstance);

		animationInstance = utils.animate(progressbarEl, {
			from: { bgX: currentPosition, bgY: 0 },
			to: { bgX: 0, bgY: 0 },
			duration: 300,
			easing: HEXA.easing.sineInOut,
			callback: function () {
				animationInstance = null;
				_pos();
			}
		});
	}

	function get () {
		return currentLevel;
	}

	function getRemaining () {
		return maxValue - currentValue;
	}

	return {
		init: init,
		set: set,
		get: get,
		getRemaining: getRemaining,
		add: add,
		setCallback: setCallback
	};
})();