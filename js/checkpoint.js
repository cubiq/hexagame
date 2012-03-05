HEXA.checkpoint = (function () {
	var	// Libs
		utils = HEXA.utils,
		scoreboard = HEXA.scoreboard,
		countdown = HEXA.countdown,

		boardEl,
		checkpointEl,
		buttonEl,

		tapLayer,

		totalBonus = 0,

		menu = [{
			id: 'checkpointTitle',
			label: 'Level %s Checkpoint',
			value: scoreboard.getLevel
		}, {
			id: 'checkpointTimeBonus',
			label: 'Time Bonus <span>%s</span>',
			value: function () { var value = countdown.get() * 2; totalBonus += value; return value; }
		}, {
			id: 'checkpointSwapsBonus',
			label: 'Swaps Bonus <span>%s</span>',
			value: function () { var value = Math.floor(scoreboard.getSwaps()) * 50; totalBonus += value; return value; }
		}, {
			id: 'checkpointWordLengthBonus',
			label: 'Word Length Bonus <span>%s</span>',
			value: function () { var value = Math.round((scoreboard.getWordLength() - 3) * 100); totalBonus += value; return value; }
		}, {
			id: 'checkpointTotal',
			label: 'Total <span>%s</span>',
			value: function () { return totalBonus; }
		}];

	function show () {
		var el,
			container,
			i = 0,
			value,
			l = menu.length;
		
		totalBonus = 0;

		utils.animate($.id('board'), {
			from: { opacity: 1 },
			to: { opacity: 0 },
			duration: 500,
			callback: function (el) {
				el.style.opacity = '';
				el.style.left = '-9999px';

				HEXA.hexmap.destroy();

				boardEl = $.id('boardwrapper');

				checkpointEl = $.id('checkpoint');
				checkpointEl.style.opacity = '0';
				checkpointEl.style.left = '50%';
				checkpointEl.offsetHeight;

				for ( ; i < l; i++ ) {
					el = utils.create('div');
					el.className = 'checkpoint';
					el.id = menu[i].id;
					value = menu[i].value.call();
					el.innerHTML = menu[i].label.replace(/%s/, utils.formatNumber(value));
					checkpointEl.appendChild(el);
					menu[i].el = el;
				}
				scoreboard.addScore(totalBonus);

				// Add button
				buttonEl = utils.create('div');
				buttonEl.className = 'button action';
				buttonEl.innerHTML = 'Continue';

				tapLayer = new HEXA.Tap(buttonEl);
				utils.bind(buttonEl, 'tap', hide);

				checkpointEl.appendChild(buttonEl);

				utils.animate(checkpointEl, {
					from: { opacity: 0 },
					to: { opacity: 1 },
					duration: 500
				});
			}
		});
	}

	function hide () {
		var i = 0,
			l = menu.length;
		
		checkpointEl.style.left = '-9999px';

		utils.unbind(buttonEl, 'tap', hide);
		tapLayer.destroy();
		tapLayer = null;

		buttonEl.parentNode.removeChild(buttonEl);
		buttonEl = null;

		for ( ; i < l; i++ ) {
			menu[i].el.parentNode.removeChild(menu[i].el);
			menu[i].el = null;
		}

		HEXA.wordhunt.init();
	}

	return {
		show: show
	};
})();