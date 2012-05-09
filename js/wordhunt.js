HEXA.wordhunt = (function () {
	var // Libs
		utils = HEXA.utils,
		parms = HEXA.parms,
		dict = HEXA.dictionary,
		scoreboard = HEXA.scoreboard,
		countdown = HEXA.countdown,
		audio = HEXA.audio,

		// Elements
		boardwrapperEl,
		wordhuntEl,
		buttonEl,
		wordlistEl,

		tiles = [],
		wordsFound = {},

		tutorialTapLayer,
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
		wordhuntEl.style.opacity = '0';

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

		HEXA.wordhunt.tiles = tiles;

		utils.bind(window, 'orientationchange', orientationChange);

		utils.animate(wordhuntEl, {
			from: { opacity: 0 },
			to: { opacity: 1 },
			duration: 400,
			callback: setReady
		});
		//setReady();
	}

	function setReady () {
		setTimeout(function () {
			if ( HEXA.userinfo.getLevel() > 1 || HEXA.userinfo.getHighScore() > 999 || scoreboard.getLevel() > 2 ) {
				utils.readyGo(function () {
					isGameReady = true;
					isGameOver = false;
					countdown.start();
				});
			} else {
				HEXA.popup.show({
					width: 720,
					height: 600,
					content: '<div id="tutorial"><h1>Welcome to the Word Hunt mini-game!</h1><p>Collect as many words as you can in the given time frame<br>1. Drag tiles from the bottom to the top row<br>2. Hit the blue button to confirm</p><p><video autoplay="autoplay" controls="controls" loop="loop" tabindex="0" width="320" height="240" id="tutorialVideo"><source src="video/tut-3.mp4" type=\'video/mp4; codecs="avc1.42E01E, mp4a.40.2"\' /><source src="video/tut-3.webm" type=\'video/webm; codecs="vp8, vorbis"\' /><source src="video/tut-3.ogv" type=\'video/ogg; codecs="theora, vorbis"\' /></video></p><p><div id="tut-close" class="button action">Good Hunting!</div></p></div>',
					duration: 500,
					easing: HEXA.easing.quadraticOut,
					onCompletion: function () {
						var button = $.id('tut-close');
						tutorialTapLayer = new HEXA.Tap(button);
						utils.bind(button, 'tap', tutClose);
					}
				});
			}
		}, 300);
	}

	function tutClose () {
		tutorialTapLayer.destroy();
		utils.unbind($.id('tut-close'), 'tap', tutClose);
		$.id('tutorialVideo').pause();

		setTimeout(function () {
			HEXA.popup.hide(function () {
				setTimeout(function () {
					utils.readyGo(function () {
						isGameReady = true;
						isGameOver = false;
						countdown.start();
					});
				}, 100);
			});
		}, 100);
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

			if ( doubles['Q'] > 1 || doubles['K'] > 1 || doubles['J'] > 1 || doubles['U'] > 1 || doubles['X'] > 1 || doubles['Y'] > 1 || doubles['Z'] > 1 || vowelsCount < 3 || (doubles['Q'] && !doubles['U']) ) {
				unbalanced = true;
			}
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

						audio.tileDrop();
					} else {
						tiles[x][y] = null;
						tiles[tile.el.dataset.x][tile.el.dataset.y] = tile;

						audio.tileTap();
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

		audio.correctWord();

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
		audio.wrongWord();

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

		audio.levelUp();

		utils.animate(el, {
			from: { opacity: 1, scale: 0.7 },
			to: { opacity: 0, scale: 1.2 },
			duration: 2000,
			easing: HEXA.easing.quadraticIn,
			callback: function () {
				el.parentNode.removeChild(el);
				utils.animate(wordhuntEl, {
					from: { opacity: 1 },
					to: { opacity: 0 },
					duration: 500,
					callback: function () {
						destroy();
						HEXA.hexagame.restart();
					}
				});
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