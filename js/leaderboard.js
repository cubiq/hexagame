HEXA.leaderboard = (function (w) {
	var // Libs
		utils = HEXA.utils,
		userinfo = HEXA.userinfo,
		login = HEXA.login,

		// Elements
		leaderboardEl,
		chartsEl,
		tableWrapperEl,
		chartSelectEl,
		switchesEl,
		buttonEl,

		tapLayer,
		tapButton,

		isReady = false;

	function show () {
		chartsEl = $.id('charts');
		tableWrapperEl = $.id('chartsContainer');
		chartSelectEl = $.id('chartSelect');
		leaderboardEl = $.id('leaderboard');
		switchesEl = $.all('#chartSelect .switch');
		buttonEl = $.id('chartsBack');

		leaderboardEl.style.left = '0';
		utils.translate(chartsEl, chartsEl.offsetWidth + chartsEl.offsetLeft, 0);
		utils.translate(chartSelectEl, -chartsEl.offsetWidth - chartsEl.offsetLeft, 0);

		setTimeout(function () {
			utils.animate(chartsEl, {
				from: { x: chartsEl.offsetWidth + chartsEl.offsetLeft, y: 0 },
				to: { x: 0, y: 0 },
				duration: 600,
				easing: HEXA.easing.quadraticOut
			});

			utils.animate(chartSelectEl, {
				from: { x: -chartsEl.offsetWidth - chartsEl.offsetLeft, y: 0 },
				to: { x: 0, y: 0 },
				duration: 600,
				easing: HEXA.easing.quadraticOut,
				callback: function () {
					isReady = true;
					$.id('mainmenu').style.left = '-9999px';

					tapLayer = new HEXA.Tap(chartSelectEl);
					utils.bind(chartSelectEl, 'tap', switches);

					tapButton = new HEXA.Tap(buttonEl);
					utils.bind(buttonEl, 'tap', exit);

					if ( userinfo.isLogged() ) {
						loadYourRanking();
						return;
					}
					
					login.show(loadTop10);
				}
			});
		}, 60);
	}

	function switches (e) {
		var target = e.target;

		if ( !utils.hasClass(target, 'switch') ) return;

		if ( target.id == 'chartYou' ) {
			if ( userinfo.isLogged() ) {
				loadYourRanking();
				return;
			}

			login.show(loadTop10);
		} else if ( target.id == 'chartTop10' ) {
			loadTop10();
		} else if ( target.id == 'chartResults' ) {
			if ( userinfo.isLogged() ) {
				loadYourResults();
				return;
			}

			login.show(loadTop10);
		}
	}

	/**
	*
	* TO-DO: merge loadYourRanking, loadTop10, loadYourResults together
	*
	*/
	function loadYourRanking () {
		if ( !isReady ) return;

		utils.forEach(switchesEl, function () {
			utils.removeClass(this, 'active');
		});
		utils.addClass($.id('chartYou'), 'active');

		utils.ajax('req/leaderboard.php?t=1', {
			callback: function (result) {
				if ( !isReady ) return;

				var out = '',
					i, l;

				result = w.JSON.parse(result);

				if ( !result || result.status == 'error' ) {
					out = '<h1>' + result.message + '</h1>';
					tableWrapperEl.innerHTML = out;
					return;
				}

				out += '<h1>' + result.title + '</h1>';
				out += '<table cellspacing="0" cellpadding="0"><thead><tr><th class="small">#</th><th>Player</th><th class="small">Words</th><th class="small">Ratio</th><th class="small">Level</th><th class="score">Score</th></tr></thead>';
				out += '<tbody>';

				out += buildRows(result.rows);

				out += '</tbody></table>';

				tableWrapperEl.innerHTML = out;
			}
		});
	}

	function loadTop10 () {
		if ( !isReady ) return;

		utils.forEach(switchesEl, function () {
			utils.removeClass(this, 'active');
		});
		utils.addClass($.id('chartTop10'), 'active');

		utils.ajax('req/leaderboard.php?t=2', {
			callback: function (result) {
				if ( !isReady ) return;

				var out = '',
					i, l;

				result = w.JSON.parse(result);

				if ( !result || result.status == 'error' ) {
					out = '<h1>' + result.message + '</h1>';
					tableWrapperEl.innerHTML = out;
					return;
				}

				out += '<h1>' + result.title + '</h1>';
				out += '<table cellspacing="0" cellpadding="0"><thead><tr><th class="small">#</th><th>Player</th><th class="small">Words</th><th class="small">Ratio</th><th class="small">Level</th><th class="score">Score</th></tr></thead>';
				out += '<tbody>';

				out += buildRows(result.rows);

				out += '</tbody></table>';

				tableWrapperEl.innerHTML = out;
			}
		});
	}

	function loadYourResults () {
		if ( !isReady ) return;

		utils.forEach(switchesEl, function () {
			utils.removeClass(this, 'active');
		});
		utils.addClass($.id('chartResults'), 'active');

		utils.ajax('req/leaderboard.php?t=3', {
			callback: function (result) {
				if ( !isReady ) return;

				var out = '',
					i, l;

				result = w.JSON.parse(result);

				if ( !result || result.status == 'error' ) {
					out = '<h1>' + result.message + '</h1>';
					tableWrapperEl.innerHTML = out;
					return;
				}

				out += '<h1>' + result.title + '</h1>';
				out += '<table cellspacing="0" cellpadding="0"><thead><tr><th class="small">#</th><th>Date</th><th class="small">Words</th><th class="small">Ratio</th><th class="small">Level</th><th class="score">Score</th></tr></thead>';
				out += '<tbody>';

				out += buildRows(result.rows);

				out += '</tbody></table>';

				tableWrapperEl.innerHTML = out;
			}
		});
	}

	function buildRows (rows) {
		var i = 0,
			l = rows.length,
			out = '';

		for ( ; i < l; i++ ) {
			out += '<tr>';
			if ( rows[i].datetime ) {
				out += '<td>' + (i + 1) + '</td>';
				out += '<td class="left">' + utils.escapeHTML(rows[i].datetime) + '</td>';
			} else {
				out += '<td>' + (+rows[i].rank) + '</td>';
				out += '<td class="left">' + utils.escapeHTML(rows[i].name) + '</td>';
			}
			
			out += '<td>' + (+rows[i].words) + '</td>';
			out += '<td>' + Math.round(rows[i].letters / rows[i].words * 100) / 100 + '</td>';
			out += '<td>' + (+rows[i].level) + '</td>';
			out += '<td class="right">' + utils.formatNumber(+rows[i].score) + '</td>';
			out += '</tr>';
		}

		return out;
	}

	function exit () {
		isReady = false;

		tapLayer.destroy();
		tapLayer = null;
		tapButton.destroy();
		tapButton = null;

		$.id('mainmenu').style.left = '50%';
		utils.translate($.id('gateLeft'), 0, 0);
		utils.translate($.id('gateRight'), 0, 0);

		utils.animate(chartsEl, {
			from: { x: 0, y: 0 },
			to: { x: chartsEl.offsetWidth + chartsEl.offsetLeft, y: 0 },
			duration: 600,
			easing: HEXA.easing.quadraticIn
		});

		utils.animate(chartSelectEl, {
			from: { x: 0, y: 0 },
			to: { x: -chartsEl.offsetWidth - chartsEl.offsetLeft, y: 0 },
			duration: 600,
			easing: HEXA.easing.quadraticIn,
			callback: function () {
				leaderboardEl.style.left = '-9999px';
				utils.translate(chartsEl, 0, 0);
				utils.translate(chartSelectEl, 0, 0);
				tableWrapperEl.innerHTML = '';
				HEXA.mainmenu.openGate();
			}
		});

	}

	return {
		show: show
	};
})(this);