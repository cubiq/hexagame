HEXA.gameover = (function (w) {
	var // Libs
		popup = HEXA.popup,
		utils = HEXA.utils,
		scoreboard = HEXA.scoreboard,
		userinfo = HEXA.userinfo,
		fireworks = HEXA.fireworks,
		parms = HEXA.parms,
		login = HEXA.login,

		tapLayer,

		onCompletion;

	function show (callback) {
		var content = '<ul id="gameover"><li class="logoG">G</li><li class="logoA">A</li><li class="logoM">M</li><li class="logoE">E</li><li class="logoO">O</li><li class="logoV">V</li><li class="logoE">E</li><li class="logoR">R</li></ul>',
			currentScore = scoreboard.getScore(),
			highScore = userinfo.getHighScore(),
			width, height;

		onCompletion = function () { setTimeout(callback, 300); };

		if ( currentScore !== 0 ) userinfo.completeGame();

		content += '<div id="gameResult">Your final score is <strong>' + utils.formatNumber(currentScore) + '</strong>!<br>';

		if ( currentScore > highScore ) {
			content += 'Congratulations, this is your best result so far.';
			userinfo.setHighScore(currentScore);
		} else if ( currentScore === 0 ) {
			content += 'Oh c\'mon, you did\'t even try!';
		} else if ( currentScore == highScore ) {
			content += 'You matched your best score, try again!';
		} else {
			content += 'Your best score is ' + utils.formatNumber(highScore) + ', try again!';
		}

		content += '<br><div id="gameoverClose" class="button action">' + ( userinfo.isLogged() && currentScore > highScore ? 'Send Your New Record' : 'Continue' ) + '</div></div>';

		if ( parms.platform == 'desktop' ) {
			width = 840;
			height = 400;
		} else {
			width = 768;
			height = 400;
		}

		popup.show({
			width: width,
			height: height,
			content: content,
			duration: 800,
			easing: HEXA.easing.bounce,
			onCompletion: function () {
				var button = $.id('gameoverClose');
				tapLayer = new HEXA.Tap(button);
				utils.bind(button, 'tap', exit);

				if ( currentScore > highScore ) {
					fireworks.start();
				}
			}
		});
	}

	function exit () {
		utils.unbind($.id('gameoverClose'), 'tap', exit);
		tapLayer.destroy();
		tapLayer = null;

		fireworks.stop();

		userinfo.verify(function () {
			var savedScore = userinfo.getScoreDelivery();

			// Save score for later
			if ( !savedScore || savedScore.score < scoreboard.getScore() ) {
				userinfo.setScoreDelivery({
					score: scoreboard.getScore(),
					words: scoreboard.getWords(),
					letters: scoreboard.getLetters(),
					level: scoreboard.getLevel(),
					language: userinfo.getLocale()
				});
			}

			if ( userinfo.isLogged() ) {
				utils.ajax('req/sendScore.php', {
					post: userinfo.getScoreDelivery(true),
					callback: function (result) {
						result = w.JSON.parse(result);
						if ( result.status == 'success' ) {
							userinfo.setScoreDelivery();	// Clear the saved score
							userinfo.setHighScore(result.score);
						}
					}
				});

				popup.hide(onCompletion);
			} else {
				// If user is not logged, request sign in
				popup.hide(function () {
					login.show(onCompletion);
				});
			}
		});
	}

	return {
		show: show
	};
})(this);