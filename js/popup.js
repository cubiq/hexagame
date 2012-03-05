HEXA.popup = (function () {
	var // Libs
		utils = HEXA.utils;
	
	function show (options) {
		var popupEl = $.id('popup'),
			container = $('#popup > div');

		$.id('popupCloak').style.display = 'block';

		if ( options.className ) utils.addClass(popupEl, options.className);
		popupEl.style.left = '50%';
		popupEl.style.width = options.width + 'px';
		popupEl.style.height = options.height + 'px';
		popupEl.style.marginLeft = -Math.round(options.width / 2) + 'px';
		popupEl.style.marginTop = -Math.round(options.height / 2) + 'px';
		utils.translate(popupEl, 0, -popupEl.offsetHeight - popupEl.offsetTop);
		container.innerHTML = options.content || '';

		utils.animate(popupEl, {
			from: { x: 0, y: -popupEl.offsetHeight - popupEl.offsetTop },
			to: { x: 0, y: 0 },
			duration: options.duration === undefined ? 400 : options.duration,
			easing: options.easing === undefined ? HEXA.easing.quadraticOut : options.easing,
			callback: options.onCompletion
		});
	}

	function hide (onCompletion) {
		var popupEl = $.id('popup'),
			container = $('#popup > div');

		utils.animate(popupEl, {
			from: { x: 0, y: 0 },
			to: { x: 0, y: popupEl.offsetHeight + popupEl.offsetTop },
			duration: 400,
			easing: HEXA.easing.quadraticIn,
			callback: function () {
				container.innerHTML = '';
				popupEl.style.left = '-9999px';
				$.id('popupCloak').style.display = 'none';
				if (onCompletion) onCompletion();
			}
		});
	}

	return {
		show: show,
		hide: hide
	};

})();