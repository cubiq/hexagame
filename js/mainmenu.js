HEXA.mainmenu = (function (w) {
	var // Libs
		parms = HEXA.parms,
		utils = HEXA.utils,
		render = HEXA.render,
		userinfo = HEXA.userinfo,

		tiles = [],
		tilesCount,

		homescreenEl,
		mainmenuEl,
		logoTilesEl,
		gateLeftEl,
		gateRightEl,
		loginMonitorEl,

		logoTilesStartY,

		tapLayer,
		tapPopup,
		tapSignin;

	function init () {
		if ( !homescreenEl ) {
			homescreenEl = $.id('homescreen');
			mainmenuEl = $.id('mainmenu');
			logoTilesEl = $.all('#logo li');
			gateLeftEl = $.id('gateLeft');
			gateRightEl = $.id('gateRight');
			loginMonitorEl = $.id('loginMonitor');

			createMenu();

			utils.bind(window, 'orientationchange', orientationChange);

			tapSignin = new HEXA.Tap(loginMonitorEl);
			utils.bind(loginMonitorEl, 'tap', signout);

			// Get the latest news
			utils.ajax('req/news.php', {
				callback: function (result) {
					if ( !result ) return;
					result = w.JSON.parse(result);
					if ( result.status == 'error' ) return;

					var news = $.id('news');
					news.style.display = 'block';
					news.innerHTML = '<span class="title">~ News ~</span><span>' + result.date + ': <a href="' + result.href + '">' + result.title + '</a></span>';
				}
			});
		}

		logoTilesStartY = (logoTilesEl[0].offsetTop - logoTilesEl[0].offsetHeight - logoTilesEl[0].parentNode.offsetTop);

		// Place logo out of the screen
		utils.forEach(logoTilesEl, function () {
			this.style.marginLeft = '3px';
			utils.translate(this, 0, logoTilesStartY);
		});
	}

	function enter () {
		if ( userinfo.isLogged() ) {
			loginMonitorEl.style.display = 'block';
			loginMonitorEl.innerHTML = 'Welcome <strong>' + utils.escapeHTML(userinfo.getName()) + '</strong><br>' + (parms.platform == 'desktop' ? 'Click' : 'Tap') + ' to log out';
		} else {
			loginMonitorEl.style.display = 'none';
		}

		dropLogo();
		//openGate();
	}

	function openGate () {
		utils.animate(gateRightEl, {
			from: { x: 0, y: 0 },
			to: { x: gateRightEl.offsetWidth + 1, y: 0},
			duration: 800,
			easing: HEXA.easing.sineInOut,
			context: 'gate'
			//delay: 1000
		});

		utils.animate(gateLeftEl, {
			from: { x: 0, y: 0 },
			to: { x: -gateLeftEl.offsetWidth, y: 0},
			duration: 800,
			easing: HEXA.easing.sineInOut,
			context: 'gate'
			//delay: 1000
		});
	}

	function closeGate (callback) {
		utils.animate(gateRightEl, {
			from: { x: utils.getTranslate(gateRightEl).x, y: 0 },
			to: { x: 0, y: 0},
			duration: 500,
			easing: HEXA.easing.sineInOut
		});

		utils.animate(gateLeftEl, {
			from: { x: utils.getTranslate(gateLeftEl).x, y: 0 },
			to: { x: 0, y: 0},
			duration: 500,
			easing: HEXA.easing.sineInOut,
			callback: callback
		});
	}

	function dropLogo () {
		var delay = 0,
			trigger = $('#logo li:first-child');

		utils.forEach(logoTilesEl, function () {
			utils.animate(this, {
				from: { x: 0, y: logoTilesStartY },
				to: { x: 0, y: 0 },
				duration: parms.platform == 'desktop' ? 1500 : 1200,
				easing: HEXA.easing.elasticOut,
				delay: delay * 50,
				callback: function (el) {
					if ( el == trigger ) openGate();
				}
			});
			delay++;
		});
	}

	function exitLogo (callback) {
		var delay = 0;

		utils.forEach(logoTilesEl, function () {
			utils.animate(this, {
				from: { x: 0, y: utils.getTranslate(this).y },
				to: { x: 0, y: logoTilesStartY },
				duration: 300,
				easing: HEXA.easing.backIn,
				delay: delay * 50,
				callback: delay == 7 ? callback : null
			});
			delay++;
		});
	}

	function createMenu () {
		var options = [
				{
					label: 'New Game',
					className: 'action',
					callback: newGame
				},
				{
					label: 'Instructions',
					className: 'disabled',
					callback: function () { alert('Sorry, not yet available.'); }
				},
				{
					label: 'Leaderboard',
					callback: openLeaderboard
				},
				{
					label: 'Options',
					className: 'disabled',
					callback: function () { alert('Sorry, not yet available.'); }
				},
				{
					label: 'About',
					callback: about
				}
			],
			i = 0,
			l = options.length,
			el;
		
		for ( ; i < l; i++ ) {
			el = utils.create('div');
			el.innerHTML = options[i].label;
			el.className = 'button';
			el.style.top = 102 * i + 10 + 'px';
			el.onTap = options[i].callback;
			if ( options[i].className ) el.className += ' ' + options[i].className;
			mainmenuEl.appendChild(el);
		}

		tapLayer = new HEXA.Tap(homescreenEl);
		utils.bind(homescreenEl, 'tap', handleTap);
	}

	function handleTap (e) {
		if ( !e.target.onTap ) return;

		render.clearKeyframeFn();
		e.target.onTap();
	}

	function newGame () {
		closeGate(function () {
			if ( parms.platform == 'desktop' ) return;
			exitLogo(function () { setTimeout(
				function () {
					HEXA.hexagame.init();
				}, 100);
			});
		});

		if ( parms.platform == 'desktop' ) exitLogo(function () { HEXA.hexagame.init(); });
	}

	function openLeaderboard () {
		closeGate(function () {
			HEXA.leaderboard.show();
		});
	}

	function orientationChange () {
		render.removeKeyframesByContext('gate');
		utils.translate(gateRightEl, 2000, 0);
		utils.translate(gateLeftEl, -2000, 0);
		logoTilesStartY = (logoTilesEl[0].offsetTop - logoTilesEl[0].offsetHeight - logoTilesEl[0].parentNode.offsetTop);
	}

	function askName () {
		var content = '<form onsubmit="HEXA.mainmenu.saveName();return false" id="nickname"><h1>Choose your nick name, this is how you\'ll be recognized on Hexagame.</h1>';
		content += '<div class="loadingMsg">Updating your nickname, please wait...</div><div id="nicknameFieldset"><input type="text" name="nickname" id="nicknameField"><div id="nicknameSubmit" class="button action">Submit</div></div></form>';

		HEXA.popup.show({
			width: 620,
			height: 350,
			content: content,
			duration: 400,
			easing: HEXA.easing.quadraticOut,
			onCompletion: function () {
				if ( parms.platform == 'desktop' ) $.id('nicknameField').focus();
				var submitButton = $.id('nicknameSubmit');
				tapPopup = new HEXA.Tap(submitButton);
				utils.bind(submitButton, 'tap', saveName);
			}
		});
	}

	function saveName () {
		var field = $.id('nicknameField'),
			value = field.value.replace(/^\s+|\s+$/g, '');

		if ( value.length < 3 ) {
			alert('Nickname must be at least 3 characters long');
			field.value = value;
			return;
		}

		$.id('nickname').className = 'loading';

		utils.ajax('req/saveName.php', {
			post: 'n=' + escape(value),
			callback: __saveNameResult
		});
	}

	function __saveNameResult (result) {
		result = w.JSON.parse(result);

		if ( result.status == 'success' ) {
			utils.unbind($.id('nicknameSubmit'), 'tap', saveName);
			tapPopup.destroy();
			tapPopup = null;

			HEXA.popup.hide(enter);
			return;
		}

		$.id('nickname').className = '';
		alert(result.message);
	}

	function about () {
		var content = '<div id="aboutPopup"><p>Hexagame is an Open Source HTML5 game by Matteo <a href="http://cubiq.org">Cubiq</a> Spinelli.</p><p>Fork on <a href="https://github.com/cubiq/hexagame">Github</a>, send comments and suggestions on the official <a href="http://blog.hexaga.me">blog</a>.</p><div id="aboutClose" class="button action">Close</div></div>';

		HEXA.popup.show({
			width: 620,
			height: 380,
			content: content,
			duration: 400,
			easing: HEXA.easing.quadraticOut,
			onCompletion: function () {
				var closeButton = $.id('aboutClose');
				tapPopup = new HEXA.Tap(closeButton);
				utils.bind(closeButton, 'tap', closeAbout);
			}
		});
	}

	function closeAbout () {
		utils.unbind($.id('aboutClose'), 'tap', closeAbout);
		tapPopup.destroy();
		tapPopup = null;

		HEXA.popup.hide();
	}

	function signout () {
		w.location.href = '/goauth.php?logout=' + Date.now();
	}

	return {
		init: init,
		enter: enter,
		openGate: openGate,
		askName: askName,
		saveName: saveName
	};
})(this);