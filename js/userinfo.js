HEXA.userinfo = (function (w) {
	var u = w.JSON.parse(w.localStorage.getItem('userinfo')) || {},
		utils = HEXA.utils;

	function init () {
		var i,
			defaults = {
				locale: '',

				completedGames: 0,
				highScore: 0,
				maxLevel: 1,
				scoreDelivery: {},

				id: 0,
				name: ''
			};

		for ( i in defaults ) {
			if ( !(i in u) ) u[i] = defaults[i];
		}

		save();
	}

	function verify (callback) {
		utils.ajax('req/googleVerify.php', {
			callback: function (result) {
				result = w.JSON.parse(result);

				u.id = 0;

				if ( result.status == 'success' ) {
					if ( result.name != u.name || result.id != u.id ) {
						u.name = result.name;
						u.id = +result.id;
						u.highScore = +result.highScore;
						u.maxLevel = +result.maxLevel;
					}
				}

				save();

				callback();
			}
		});
	}

	function get () {
		return u;
	}

	function completeGame () {
		u.completedGames++;
		save();
	}

	function setLevel (level) {
		if ( level <= u.maxLevel ) return;

		u.maxLevel = level;
		save();
	}

	function getLevel () {
		return u.maxLevel;
	}

	function isLogged () {
		return !!u.id;
	}

	function getName () {
		return u.name;
	}

	function getHighScore () {
		return u.highScore;
	}

	function setHighScore (value) {
		if ( value < u.highScore ) return;
		u.highScore = value;

		save();
	}

	function setScoreDelivery (value) {
		u.scoreDelivery = value || {};
		save();
	}

	function getScoreDelivery (postize) {
		if ( !('score' in u.scoreDelivery) ) return false;

		if ( !postize ) return u.scoreDelivery;

		var i,
			out = [];

		for ( i in u.scoreDelivery ) {
			out.push(i + '=' + escape( u.scoreDelivery[i] ));
		}

		return out.join('&');
	}

	function getLocale () {
		return u.locale;
	}

	function setLocale (value) {
		u.locale = value;
		save();
	}

	function save () {
		w.localStorage.setItem('userinfo', w.JSON.stringify(u));
	}

	function id () {
		return u.id;
	}

	init();

	return {
		get: get,
		setHighScore: setHighScore,
		getHighScore: getHighScore,
		setLevel: setLevel,
		getLevel: getLevel,
		completeGame: completeGame,
		verify: verify,
		isLogged: isLogged,
		getName: getName,
		setScoreDelivery: setScoreDelivery,
		getScoreDelivery: getScoreDelivery,
		getLocale: getLocale,
		setLocale: setLocale,
		id: id
	};
})(this);