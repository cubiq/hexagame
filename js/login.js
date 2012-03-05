HEXA.login = (function (w) {
	var // Libs
		utils = HEXA.utils,
		popup = HEXA.popup,
		parms = HEXA.parms,

		tapLayer,

		usernameCheckTimer,
		username = '',

		loginCallback;

	function show (onCompletion) {
		var content = '<div id="login"><h1>Sign in to share your results and access the leaderboards.</h1>';
		content += '<div id="signinButtons"><div id="googleButton" class="button action"><span id="google">Sign In with</span></div>';
		content += '<div id="cancelButton" class="button">No, thanks</div></div>';
		content += '<div class="loadingMsg">Signing In, please wait...</div></div>';

		loginCallback = onCompletion;

		popup.show({
			width: 620,
			height: 400,
			content: content,
			duration: 400,
			easing: HEXA.easing.quadraticOut,
			onCompletion: function () {
				var wrapper = $.id('login');
				tapLayer = new HEXA.Tap(wrapper);
				utils.bind(wrapper, 'tap', tap);
			}
		});
	}

	function tap (e) {
		var target = e.target;

		if ( target.id == 'google' ) {
			$.id('login').className = 'loading';
			googleSignIn();
		} else if ( target.id == 'cancelButton' ) {
			popup.hide(loginCallback);
		}
	}

	function googleSignIn () {
		var url = 'https://accounts.google.com/o/oauth2/auth?response_type=code&redirect_uri=http%3A%2F%2Fhexaga.me%2Fgoauth.php&client_id=976147962803.apps.googleusercontent.com&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&access_type=offline&approval_prompt=auto';
		w.location.href = url;
	}

	return {
		show: show
	};

})(this);