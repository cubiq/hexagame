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
			value: function () { var value = Math.round((scoreboard.getWordLength() - 3) * 200); totalBonus += value; return value; }
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
				//checkpointEl.style.opacity = '0';
				checkpointEl.style.left = '50%';
				checkpointEl.offsetHeight;

				for ( ; i < l; i++ ) {
					el = utils.create('div');
					el.className = 'checkpoint';
					el.id = menu[i].id;
					value = menu[i].value.call();
					el.innerHTML = menu[i].label.replace(/%s/, utils.formatNumber(value));
					checkpointEl.appendChild(el);
					el.style.opacity = '0';
					//utils.translate(el, -el.offsetWidth-400, 0);
					menu[i].el = el;
				}
				scoreboard.addScore(totalBonus);

				// Add button
				buttonEl = utils.create('div');
				buttonEl.className = 'button action';
				buttonEl.innerHTML = 'Continue';
				buttonEl.style.opacity = '0';

				tapLayer = new HEXA.Tap(buttonEl);

				checkpointEl.appendChild(buttonEl);

				setTimeout(function () {
					for ( i = 0; i < l; i++ ) {
						utils.animate(menu[i].el, {
							from: { scale: 0.7, opacity: 0 },
							to: { scale: 1, opacity: 1 },
							delay: i * 100,
							easing: HEXA.easing.quadraticOut,
							duration: 400
						});
					}

					utils.animate(buttonEl, {
						from: { scale: 0.7, opacity: 0 },
						to: { scale: 1, opacity: 1 },
						delay: i * 100,
						easing: HEXA.easing.quadraticOut,
						duration: 400,
						callback: function () {
							utils.bind(buttonEl, 'tap', hide);
						}
					});
				}, 200);
			}
		});
	}

	function hide () {
		var i = 0,
			l = menu.length;

		utils.unbind(buttonEl, 'tap', hide);

		for ( i = 0; i < l; i++ ) {
			utils.animate(menu[i].el, {
				from: { scale: 1, opacity: 1 },
				to: { scale: 0.7, opacity: 0 },
				delay: i * 100,
				easing: HEXA.easing.quadraticIn,
				duration: 400
			});
		}

		utils.animate(buttonEl, {
			from: { scale: 1, opacity: 1 },
			to: { scale: 0.7, opacity: 0 },
			delay: i * 100,
			easing: HEXA.easing.quadraticIn,
			duration: 400,
			callback: function () {
				checkpointEl.style.left = '-9999px';

				tapLayer.destroy();
				tapLayer = null;

				buttonEl.parentNode.removeChild(buttonEl);
				buttonEl = null;

				for ( i = 0; i < l; i++ ) {
					menu[i].el.parentNode.removeChild(menu[i].el);
					menu[i].el = null;
				}

				setTimeout(HEXA.wordhunt.init, 200);
			}
		});
	}

	return {
		show: show
	};
})();