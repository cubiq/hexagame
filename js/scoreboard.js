HEXA.scoreboard = (function () {
	var // Libs
		scoredriver = HEXA.scoredriver,
		levelup = HEXA.levelup,
		
		words,
		wordLengthAvg,
		letters,
		swaps,

		//elements
		swapsEl,
		wordsEl,
		wordLengthAvgEl;
	
	function init () {
		swapsEl = $.all('#swapSlots li');
		wordsEl = $('#sbWords .value');
		wordLengthAvgEl = $('#sbWordLength .value');

		words = 0;
		wordLengthAvg = 0;
		letters = 0;
		swaps = 0;

		wordLengthAvgEl.innerHTML = '0';
		wordsEl.innerHTML = '0';

		scoredriver.init();
		levelup.init();
		setSwaps(3);
	}

	function addScore ( value ) {
		scoredriver.add(value);
	}

	function getScore () {
		return scoredriver.get();
	}

	function addLetters ( value ) {
		// Update words first
		words++;
		wordsEl.innerHTML = words;

		// Update letters
		letters += value;

		// Update the average words length
		wordLengthAvg = Math.round(letters / words * 10) / 10;
		wordLengthAvgEl.innerHTML = wordLengthAvg.toString();

		// Update swaps
		addSwaps( value / 18 );

		// Level up (3 letters words have very little value upon levelling)
		levelup.add(value == 3 ? 2 : value);
	}

	function setSwaps ( value ) {
		swaps = value || 0;
		if ( swaps > 5 ) swaps = 5;
		else if ( swaps < 0 ) swaps = 0;

		_unpdateSwaps();
	}

	function getSwaps () {
		return swaps;
	}

	function addSwaps ( value ) {
		swaps += value || 0;
		if ( swaps > 5 ) swaps = 5;
		else if ( swaps < 0 ) swaps = 0;

		_unpdateSwaps();
	}

	function _unpdateSwaps () {
		for ( var i = 0; i < 5; i++ ) {
			swapsEl[i].className = Math.floor(swaps) > i ? 'active' : '';
		}
	}

	function getLevel () {
		return levelup.get() || 1;
	}

	function onLevelUp (callback) {
		levelup.setCallback(callback);
	}

	function getWordLength () {
		return wordLengthAvg;
	}

	function getLetters () {
		return letters;
	}

	function getWords () {
		return words;
	}

	return {
		init: init,
		addScore: addScore,
		getScore: getScore,
		addLetters: addLetters,
		getWordLength: getWordLength,
		getSwaps: getSwaps,
		setSwaps: setSwaps,
		addSwaps: addSwaps,
		getLevel: getLevel,
		onLevelUp: onLevelUp,
		getLetters: getLetters,
		getWords: getWords
	};
})();