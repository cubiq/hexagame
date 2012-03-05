HEXA.wordhunt = (function () {
	var // Libs
		utils = HEXA.utils,
		parms = HEXA.parms,
		dict = HEXA.dictionary,
		scoreboard = HEXA.scoreboard,
		countdown = HEXA.countdown,

		// Elements
		boardwrapperEl,
		wordhuntEl,
		buttonEl,
		wordlistEl,

		tiles = [],
		wordsFound = {},

		tapLayer,
		dragging,

		distanceX,
		distanceY,

		isGameOver = true,
		isGameReady = false;
	
	function init () {
		var x,
			y,
			el,
			offsetY,
			tile;

		wordlistEl = $.id('wordlist');

		distanceX = Math.round(parms.tileWidth / 4) * 3;
		distanceY = parms.tileHeight;
		
		wordsFound = {};

		boardwrapperEl = $.id('boardwrapper');
		wordhuntEl = $.id('wordhunt');

		// Create the drop slots
		for ( x = 0; x < 8; x++ ) {
			offsetY = x % 2 ? Math.round(parms.tileHeight / 2) : 0;

			tiles[x] = [];
			tiles[x][0] = null;

			el = utils.create('div');
			el.className = 'tile slot';
			if ( !('dataset' in el) ) el.dataset = {};
			el.dataset.x = x;
			el.dataset.y = 0;
			el.style.left = x * distanceX + 'px';
			el.style.top = offsetY + 'px';

			wordhuntEl.appendChild(el);
		}

		// Button
		buttonEl = utils.create('div');
		buttonEl.className = 'tileButton';
		buttonEl.style.left = x * distanceX + 'px';
		buttonEl.style.top = '0px';
		buttonEl.innerHTML = '&#10003;';
		if ( !('dataset' in el) ) buttonEl.dataset = {};
		buttonEl.dataset.x = x;
		buttonEl.dataset.y = 0;
		wordhuntEl.appendChild(buttonEl);

		// Create the letters
		for ( x = 0; x < 9; x++ ) {
			offsetY = x % 2 ? Math.round(parms.tileHeight / 2) : 0;

			if ( !tiles[x] ) tiles[x] = [];

			el = utils.create('div');
			tile = {};
			tile.el = el;

			el.className = 'tile variant' + utils.rnd(1, 3);
			if ( !('dataset' in el) ) el.dataset = {};
			el.dataset.x = x;
			el.dataset.y = 2;
			el.style.left = x * distanceX + 'px';
			el.style.top = 2 * distanceY + offsetY + 'px';

			tiles[x][2] = tile;

			wordhuntEl.appendChild(el);
		}

		findLetters();

		wordhuntEl.style.left = '50%';

		tapLayer = new HEXA.Tap(wordhuntEl, true, 0);
		utils.bind(buttonEl, 'tap', confirmWord);
		utils.bind(wordhuntEl, 'dragStart', dragStart);

		countdown.init(60, gameOver);
		setReady();

		HEXA.wordhunt.tiles = tiles;

		utils.bind(window, 'orientationchange', orientationChange);
	}

	function setReady () {
		utils.readyGo(function () {
			isGameReady = true;
			isGameOver = false;

			countdown.start();
		});
	}

	function findLetters () {
		var x,
			vowels = dict.getVowels().join(''),
			letter,
			doubles = {},
			vowelsCount = 0,
			unbalanced = true,
			tmp;

		while ( unbalanced ) {
			unbalanced = false;
			doubles = {};
			vowelsCount = 0;

			for ( x = 0; x < 9; x++ ) {
				letter = dict.getLetter();

				tiles[x][2].letter = letter;
				letter = String.fromCharCode(letter);
				tiles[x][2].el.innerHTML = letter;

				doubles[letter] = doubles[letter] ? doubles[letter] + 1 : 1;
				if ( doubles[letter] > 2 ) { unbalanced = true; break; }
				if ( vowels.match(letter) ) vowelsCount++;
				if ( vowelsCount > 4 ) { unbalanced = true; break; }
			}

			if ( doubles['J'] > 1 || doubles['U'] > 1 || doubles['X'] > 1 || doubles['Y'] > 1 || doubles['Z'] > 1 || vowelsCount < 3 || (doubles['Q'] && !doubles['U']))
				unbalanced = true;
		}
	}

	function dragStart (e) {
		if ( !isGameReady || isGameOver || !utils.hasClass(e.target, 'tile') ) return;

		var tile = HEXA.hexmap.findTileFromPosition(e.pageX, e.pageY, wordhuntEl),
			x, y;

		if ( !tile ) return;

		x = tile.x;
		y = tile.y;

		if ( !tiles[x][y] ) return;

		tile = tiles[x][y];

		isGameReady = false;

		dragging = new HEXA.DragDrop(wordhuntEl, tile.el, findDroppables(), e.pageX, e.pageY,
			function ( drop ) {
				var i, l;

				if ( drop ) {
					if ( drop.y === 0 ) {
						tiles[drop.x][drop.y] = tile;
						tiles[x][y] = null;

						x = drop.x * distanceX;
						y = drop.x % 2 ? Math.round(parms.tileHeight / 2) : 0;
						utils.translate(tile.el, 0, 0);
						tile.el.style.left = x + 'px';
						tile.el.style.top = y + 'px';
					} else {
						tiles[x][y] = null;
						tiles[tile.el.dataset.x][tile.el.dataset.y] = tile;
					}
				}

				isGameReady = true;
			}
		);
	}

	function findDroppables () {
		var i = 0,
			droppable = [];

		for ( ; i < 8; i++ ) {
			droppable[i] = tiles[i][0];
		}

		return droppable;
	}

	function confirmWord () {
		if ( !isGameReady || isGameOver ) return;

		isGameReady = false;

		var i = 0,
			word = '';

		for ( ; i < 8; i++ ) {
			word += tiles[i][0] ? String.fromCharCode(tiles[i][0].letter) : '_';
		}

		word = word.replace(/_+$/g, '');

		if ( /_/.test(word) || word.length < 3 || wordsFound[word] || !dict.lookup(word) ) wrongWord();
		else correctWord(word);
	}

	function correctWord (word) {
		var i, l,
			score = 0,
			prevLetter,
			el;

		wordsFound[word] = true;

		el = utils.create('li');
		el.innerHTML = word.toLowerCase();
		wordlistEl.appendChild(el);

		word = word.split('');

		// Find the word value
		for ( i = 0, l = word.length; i < l; i++ ) {
			score += dict.getLetterValue(word[i]) * (prevLetter == word[i] ? 2 : 1);
			prevLetter = word[i];
		}
		score = score * ( l - 2 ) * 2;
		//scoreboard.addScore(score);

		//utils.floatMessage(buttonEl, score, -50, 800);

		resetTiles(function (el) {
			if ( el.dataset.last ) {
				utils.floatMessage(el, score, -50, 800);
				scoreboard.addScore(score);
				delete el.dataset.last;
				isGameReady = true;
			}
		});
	}

	function wrongWord () {
		resetTiles(function (el) {
				setTimeout(function () {
					utils.removeClass(el, 'wrong');
					if ( el.dataset.last ) {
						isGameReady = true;
						delete el.dataset.last;
					}
				}, 200);
			}, 'wrong');
	}

	function resetTiles (callback, className) {
		var i = 0,
			x, y,
			tile,
			offsetTop, offsetLeft, offsetY;
		
		for ( ; i < 8; i++ ) {
			if ( tiles[i][0] ) {
				tile = tiles[i][0];

				if ( className ) utils.addClass(tile.el, className);

				offsetY = +tile.el.dataset.x % 2 ? Math.round(parms.tileHeight / 2) : 0;
				x = tile.el.dataset.x * distanceX;
				y = 2 * distanceY + offsetY;
				
				offsetTop = tile.el.offsetTop;
				offsetLeft = tile.el.offsetLeft;
				tiles[i][0].el.style.left = x + 'px';
				tiles[i][0].el.style.top = y + 'px';
				x = -(tile.el.offsetLeft - offsetLeft);
				y = -(tile.el.offsetTop - offsetTop);
				utils.translate(tile.el, x, y);
				tile.el.offsetHeight;

				utils.animate(tile.el, {
					from: { x: x, y: y },
					to: { x: 0, y: 0 },
					duration: 150,
					delay: 10,
					easing: HEXA.easing.sineInOut,
					callback: callback
				});

				tiles[tile.el.dataset.x][2] = tile;
				tiles[i][0] = null;
			}
		}

		if ( tile ) tile.el.dataset.last = '1';
		else isGameReady = true;
	}

	function gameOver () {
		var el = utils.create('div');

		if ( dragging ) {
			dragging.interrupt();
			dragging = null;
		}

		// Pause game
		countdown.pause();
		isGameReady = false;
		isGameOver = true;

		el.className = 'timesUp';
		utils.translate(el, 0, 0, 0.7);
		boardwrapperEl.appendChild(el);

		utils.animate(el, {
			from: { opacity: 1, scale: 0.7 },
			to: { opacity: 0, scale: 1.2 },
			duration: 2000,
			easing: HEXA.easing.quadraticIn,
			callback: function () {
				el.parentNode.removeChild(el);
				destroy();
				HEXA.hexagame.restart();
			}
		});
	}

	function destroy () {
		utils.unbind(buttonEl, 'tap', confirmWord);
		utils.unbind(wordhuntEl, 'dragStart', dragStart);
		tapLayer.destroy();
		tapLayer = null;

		utils.unbind(window, 'orientationchange', orientationChange);

		var removeEl = $.all('#wordhunt .tile, #wordhunt .tileButton, #wordlist li'),
			i = 0, l = removeEl.length;
		
		wordhuntEl.style.left = '-9999px';

		// remove elements
		for ( ; i < l; i++ ) {
			removeEl[i].style[parms.transform] = '';
			removeEl[i].parentNode.removeChild(removeEl[i]);
		}

		tiles = [];
		wordsFound = {};
	}

	function orientationChange () {
		var x,
			offsetY,
			tilesEl = $.all('#wordhunt .tile, #wordhunt .tileButton'),
			l = tilesEl.length,
			tile;

		distanceX = Math.round(parms.tileWidth / 4) * 3;
		distanceY = parms.tileHeight;

		// Update the slots position
		for ( x = 0; x < l; x++ ) {
			offsetY = +tilesEl[x].dataset.x % 2 ? Math.round(parms.tileHeight / 2) : 0;

			tilesEl[x].style.left = +tilesEl[x].dataset.x * distanceX + 'px';
			tilesEl[x].style.top = +tilesEl[x].dataset.y * distanceY + offsetY + 'px';
		}
	}

	return {
		init: init
	};
})();