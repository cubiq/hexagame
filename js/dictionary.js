HEXA.dictionary = (function (w) {
	var // Libs
		parms = HEXA.parms,
		utils = HEXA.utils,

		locale = HEXA.userinfo.getLocale() || 'en_us',

		version = {
			'en_us': '002_EN_US',
			'en_uk': '002_EN_UK',
			'it_it': '002_IT_IT'
		},
		lettersRatio = {
			'en_us': ['E','E','E','S','S','S','A','A','A','R','R','I','I','I','T','T','N','N','O','O','O','L','L','D','D','U','C','G','P','M','H','B','Y','Y','F','K','W','V','Z','X','J','Q'],
			'en_uk': ['E','E','E','S','S','S','A','A','A','I','I','I','R','R','T','T','N','N','O','O','O','L','L','D','D','C','U','G','P','M','H','B','Y','Y','F','K','W','V','Z','X','J','Q'],
			'it_it': ['I','I','I','A','A','A','E','E','E','O','O','O','R','R','T','T','S','S','N','N','C','C','L','M','U','P','D','G','V','B','F','Z','H','Q']
		},
		lettersValue = {
			'en_us': {'?':1,'E':1,'S':2,'A':4,'R':4,'I':4,'T':5,'N':5,'O':5,'L':5,'D':6,'U':6,'C':6,'G':6,'P':7,'M':7,'H':7,'B':7,'Y':7,'F':7,'K':8,'W':8,'V':8,'Z':8,'X':8,'J':8,'Q':8},
			'en_uk': {'?':1,'E':1,'S':2,'A':4,'I':4,'R':4,'T':5,'N':5,'O':5,'L':5,'D':5,'C':6,'U':6,'G':6,'P':6,'M':7,'H':7,'B':7,'Y':7,'F':7,'K':8,'W':8,'V':8,'Z':8,'X':8,'J':8,'Q':8},
			'it_it': {'?':1,'I':1,'A':1,'E':3,'O':3,'R':4,'T':4,'S':5,'N':5,'C':6,'L':6,'M':7,'U':7,'P':7,'D':7,'G':7,'V':7,'B':7,'F':7,'Z':8,'H':8,'Q':8}
		},
		vowels = {
			'en_us': ['E','A','I','O','U','Y'],
			'en_uk': ['E','A','I','O','U','Y'],
			'it_it': ['A','E','I','O','U']
		};

	function createDatabase (onCompletion) {
		utils.ajax('dict/' + locale + '-ls1.txt', {
			callback: function (response) {
				w.localStorage.setItem('dictionary1', response);

				utils.ajax('dict/' + locale + '-ls2.txt', {
					callback: function (response) {
						w.localStorage.setItem('dictionary2', response);
						onCompletion();
					}
				});
			}
		});
	}

	function init (onCompletion) {
		if (	!w.localStorage.getItem('dictionary1') ||
				!w.localStorage.getItem('dictionary2') ||
				w.localStorage.getItem('dictionary1').substr(0,9) != version[locale] ||
				!lookup('AAA') ||
				!lookup('ZZZ') ) {
			createDatabase(onCompletion);
			return;
		}
		
		onCompletion();
	}
	
	function pickRandom (dict) {
		dict = 'dictionary' + (dict || utils.rnd(1,2));
		dict = w.localStorage.getItem(dict).split(';');
	
		var word = utils.rnd(1, dict.length-1);

		while ( !dict[word].match(',') ) {
			word = utils.rnd(1, dict.length-1);
		}
		
		dict = dict[word].replace('!', ',').split(',');
		word = dict[0] + dict[utils.rnd(1, dict.length-1)];
		
		return word;
	}

	function lookup (word) {
		var l = word.length,
			dict = l < 7 ? 'dictionary1' : 'dictionary2';
		
		if ( l > 3 )
			return ((new RegExp(';' + word.substr(0,3).replace(/\?/g, '\\w') + '(\\!|,)([A-Z]*,)*' + word.substr(3).replace(/\?/g, '\\w') + '(,|;)')).test(w.localStorage.getItem(dict)));
		else
			return ((new RegExp(';' + word.replace(/\?/g, '[A-Z]') + '\\!')).test(w.localStorage.getItem(dict)));
	}
	
	/**
	*
	* Get a random letter respecting the language letters balance
	*
	*/
	function getLetter () {
		return lettersRatio[locale][utils.rnd(lettersRatio[locale].length-1)].charCodeAt(0);
	}

	function getVowel () {
		return vowels[locale][utils.rnd(vowels[locale].length-1)].charCodeAt(0);
	}

	function getVowels () {
		return vowels[locale];
	}

	function getLetterValue (letter) {
		return lettersValue[locale][letter];
	}

	return {
		init: init,
		getLetterValue: getLetterValue,
		lookup: lookup,
		pickRandom: pickRandom,
		getLetter: getLetter,
		getVowel: getVowel,
		getVowels: getVowels
	};
})(this);