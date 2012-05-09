HEXA.hexagame = (function () {
	var // Libs
		utils = HEXA.utils,
		parms = HEXA.parms,
		hexmap = HEXA.hexmap,
		dict = HEXA.dictionary,
		countdown = HEXA.countdown,
		scoreboard = HEXA.scoreboard,
		mainmenu = HEXA.mainmenu,
		audio = HEXA.audio,

		tapLayer,
		tutorialTapLayer,
		dragging,

		boardEl,
		boardwrapperEl,
		scoreboardEl,
		hexagameEl,
		bonuswordEl,

		selectedTiles = [],

		bonusWord,
		boardRedraw = false,

		isGameReady = false,
		isGameOver = true;

	function init (seed) {
		if ( !hexagameEl ) {
			hexagameEl = $.id('hexagame');
			boardEl = $.id('board');
			boardwrapperEl = $.id('boardwrapper');
			scoreboardEl = $.id('scoreboard');
			bonuswordEl = $('#sbBonusWord .value');
		}

		hexagameEl.style.left = '0';

		if ( parms.platform == 'desktop' ) {
			utils.translate(boardwrapperEl, -boardwrapperEl.offsetWidth - boardwrapperEl.offsetLeft, 0);
		} else {
			utils.translate(boardwrapperEl, -boardwrapperEl.offsetWidth - boardwrapperEl.offsetLeft, 0);
			//boardwrapperEl.style.opacity = '0';
		}
		
		if ( parms.platform == 'desktop' ) {
			utils.translate(scoreboardEl, scoreboardEl.offsetWidth + 100, 0);
		} else {
			if ( parms.orientation == 'portrait' ) utils.translate(scoreboardEl, 0, -scoreboardEl.offsetHeight - 100);
			else utils.translate(scoreboardEl, scoreboardEl.offsetHeight + 100, 0);
		}

		if ( seed ) utils.randomInit(seed);

		tapLayer = new HEXA.Tap(boardEl, true);
		utils.bind(boardEl, 'tap', tileTap);
		utils.bind(boardEl, 'dragStart', dragStart);

		isGameReady = false;
		isGameOver = false;

		HEXA.hexmap.init();

		countdown.init(180, gameOver);
		scoreboard.init();
		scoreboard.onLevelUp(levelUp);
		updateBonusWord();

		setTimeout(function () {	// This greatily enhance performance on tablet/mobile
			boardSlideIn();
			scoreboardSlideIn();
		}, 100);
	}

	function restart () {
		HEXA.hexmap.init();
		boardEl.style.left = '50%';
		countdown.init(180, gameOver);
		scoreboard.setSwaps(3);
		updateBonusWord();

		hexmap.showTiles(function () {
			isGameReady = false;
			isGameOver = false;
			setReady();
		});
	}

	function boardSlideIn () {
		if ( parms.platform == 'desktop' ) {
			utils.animate(boardwrapperEl, {
				from: { x: utils.getTranslate(boardwrapperEl).x, y: 0 },
				to: { x: 0, y: 0 },
				duration: 700,
				easing: HEXA.easing.quadraticOut,
				callback: function () {
					$.id('homescreen').style.left = '-9999px';
					hexmap.showTiles(setReady);
				}
			});
		} else {
			//boardwrapperEl.style.opacity = '1';
			//$.id('homescreen').style.left = '-9999px';
			
			utils.animate(boardwrapperEl, {
				from: { x: utils.getTranslate(boardwrapperEl).x, y: 0 },
				to: { x: 0, y: 0 },
				duration: 700,
				easing: HEXA.easing.quadraticOut,
				callback: function () {
					$.id('homescreen').style.left = '-9999px';
					hexmap.showTiles(setReady);
				}
			});
		}
	}

	function boardSlideOut () {
		var callback = function () {
			setTimeout(function () {
				hexagameEl.style.left = '-9999px';

				hexmap.destroy();

				utils.unbind(boardEl, 'tap', tileTap);
				utils.unbind(boardEl, 'dragStart', dragStart);

				tapLayer.destroy();
				tapLayer = null;

				mainmenu.init();
				mainmenu.enter();
			}, 100);
		};

		// Be sure the gate is closed
		utils.translate($.id('gateLeft'), 0, 0);
		utils.translate($.id('gateRight'), 0, 0);

//		if ( parms.platform == 'desktop' ) {
			utils.animate(boardwrapperEl, {
				from: { x: 0, y: 0 },
				to: { x: -boardwrapperEl.offsetWidth - boardwrapperEl.offsetLeft, y: 0 },
				duration: 500,
				easing: HEXA.easing.sineInOut,
				callback: callback
			});
/*		} else {
			utils.animate(boardwrapperEl, {
				from: { opacity: 1 },
				to: { opacity: 0 },
				duration: 700,
				easing: HEXA.easing.quadraticIn,
				callback: callback
			});
		}*/
	}

	function scoreboardSlideIn () {
		if (parms.platform == 'desktop' ) {
			utils.animate(scoreboardEl, {
				from: { x: utils.getTranslate(scoreboardEl).x, y: 0 },
				to: { x: 0, y: 0 },
				duration: 700,
				easing: HEXA.easing.quadraticOut
			});
		} else {
			if ( parms.orientation == 'portrait' ) {
				utils.animate(scoreboardEl, {
					from: { x: 0, y: utils.getTranslate(scoreboardEl).y },
					to: { x: 0, y: 0 },
					duration: 700,
					easing: HEXA.easing.quadraticOut
				});
			} else {
				utils.animate(scoreboardEl, {
					from: { x: utils.getTranslate(scoreboardEl).x, y: 0 },
					to: { x: 0, y: 0 },
					duration: 700,
					easing: HEXA.easing.quadraticOut
				});
			}
		}
	}

	function scoreboardSlideOut () {
		if ( parms.platform == 'desktop' ) {
			utils.animate(scoreboardEl, {
				from: { x: 0, y: 0 },
				to: { x: scoreboardEl.offsetWidth + 100, y: 0 },
				duration: 500,
				easing: HEXA.easing.sineInOut
			});
		} else {
			if ( parms.orientation == 'portrait' ) {
				utils.animate(scoreboardEl, {
					from: { x: 0, y: 0 },
					to: { x: 0, y: -scoreboardEl.offsetHeight - 100 },
					duration: 700,
					easing: HEXA.easing.quadraticIn
				});
			} else {
				utils.animate(scoreboardEl, {
					from: { x: 0, y: 0 },
					to: { x: scoreboardEl.offsetWidth + 100, y: 0 },
					duration: 700,
					easing: HEXA.easing.quadraticIn
				});
			}
		}
	}

	function setReady () {
		setTimeout(function () {
			if ( HEXA.userinfo.getHighScore() > 0 || scoreboard.getScore() > 0 ) {
				utils.readyGo(function () {
					countdown.start();
					isGameReady = true;
				});
			} else {
				HEXA.popup.show({
					width: 720,
					height: 570,
					content: '<div id="tutorial"><h1>Welcome to Hexagame!</h1><p>1. Find words by ' + (HEXA.parms.platform == 'desktop' ? 'clicking' : 'tapping') + ' a minimum of 3 nearby tiles<br>2. Hit the last tile twice to confirm the word</p><p><video autoplay="autoplay" controls="controls" loop="loop" tabindex="0" width="320" height="240" id="tutorialVideo"><source src="video/tut-1.mp4" type=\'video/mp4; codecs="avc1.42E01E, mp4a.40.2"\' /><source src="video/tut-1.webm" type=\'video/webm; codecs="vp8, vorbis"\' /><source src="video/tut-1.ogv" type=\'video/ogg; codecs="theora, vorbis"\' /></video></p><p><div id="tut-1-next" class="button action">Continue</div></p></div>',
					duration: 500,
					easing: HEXA.easing.quadraticOut,
					onCompletion: function () {
						var button = $.id('tut-1-next');
						tutorialTapLayer = new HEXA.Tap(button);
						utils.bind(button, 'tap', tutStep2);
					}
				});
			}
		}, 300);
	}


	function tutStep2 () {
		tutorialTapLayer.destroy();
		utils.unbind($.id('tut-1-next'), 'tap', tutStep2);
		$.id('tutorialVideo').pause();

		setTimeout(function () {
//			$.id('tutorialVideo').style.display = 'none';

			HEXA.popup.hide(function () {
				setTimeout(function () {
					HEXA.popup.show({
						width: 720,
						height: 600,
						content: '<div id="tutorial"><h1>Letters can be rearranged!</h1><p>1. To swap letters ' + (HEXA.parms.platform == 'desktop' ? 'click' : 'tap') + '-and-hold on a tile<br>2. Drag it to a nearby tile and release to confirm<br>Note: you have a limited number of swaps, use them wisely.</p><p><video id="tutorialVideo" autoplay="autoplay" controls="controls" loop="loop" tabindex="0" width="320" height="240"><source src="video/tut-2.mp4" type=\'video/mp4; codecs="avc1.42E01E, mp4a.40.2"\' /><source src="video/tut-2.webm" type=\'video/webm; codecs="vp8, vorbis"\' /><source src="video/tut-2.ogv" type=\'video/ogg; codecs="theora, vorbis"\' /></video></p><p><div id="tut-close" class="button action">Start Playing!</div></p></div>',
						duration: 500,
						easing: HEXA.easing.quadraticOut,
						onCompletion: function () {
							var button = $.id('tut-close');
							tutorialTapLayer = new HEXA.Tap(button);
							utils.bind(button, 'tap', tutClose);
						}
					});
				}, 100);
			});
		}, 100);
	}

	function tutClose () {
		tutorialTapLayer.destroy();
		utils.unbind($.id('tut-close'), 'tap', tutClose);
		$.id('tutorialVideo').pause();

		setTimeout(function () {
//			$.id('tutorialVideo').style.display = 'none';

			HEXA.popup.hide(function () {
				setTimeout(function () {
					utils.readyGo(function () {
						countdown.start();
						isGameReady = true;
					});
				}, 100);
			});
		}, 100);
	}


	/**
	*
	* Tap the tile
	*
	*/
	function tileTap (e) {
		if ( !isGameReady || isGameOver ) return;
		
		var tile,
			i,
			l = selectedTiles.length,
			deselect,
			x, y,
			nearby,
			word = '',
			prevTile = l && selectedTiles[l-1];

		tile = hexmap.findTileFromPosition(e.pageX, e.pageY);
		if ( !tile ) return;
		x = tile.x;
		y = tile.y;
		tile = hexmap.tiles[x][y];

		// If you re-tap the last tile, lookup the word
		if ( l && tile == selectedTiles[l-1] ) {
			isGameReady = false;		// Anti flood

			if ( l < 3 ) {
				wrongWord();
				return;
			}
			
			for ( i = 0; i < l; i++ ) word += String.fromCharCode(selectedTiles[i].letter);
			
			if ( dict.lookup(word) ) correctWord();
			else wrongWord();

			return;
		}
		
		// If you tap a previous tile, deselect the followings
		for ( i = 0; i < l; i++ ) {
			if ( deselect ) utils.removeClass(selectedTiles[i].el, 'pressed', true);
			if ( selectedTiles[i] == tile ) deselect = i+1;
		}

		if ( deselect ) {
			selectedTiles = selectedTiles.slice(0, deselect);
			audio.tileTap();
			return;
		}

		// If the tile is not adjacent to the last selected, deselect them all
		if ( prevTile && !hexmap.findDirection(+prevTile.el.dataset.x, +prevTile.el.dataset.y, x, y)) {
			for ( i = 0; i < l; i++ ) utils.removeClass(selectedTiles[i].el, 'pressed');
			selectedTiles = [];
			audio.tileDeselect();
			return;
		}

		if ( l < 8 ) {
			utils.addClass(tile.el, 'pressed', true);
			selectedTiles.push(tile);
			audio.tileTap();
		}
	}

	/**
	*
	* The word is wrong!
	*
	*/
	function wrongWord () {
		var i = 0,
			l = selectedTiles.length;

		for ( ; i < l; i++ ) {
			utils.removeClass(selectedTiles[i].el, 'pressed');
			utils.addClass(selectedTiles[i].el, 'wrong');
		}

		audio.wrongWord();
		
		setTimeout(function () {
			var els = $.all('#board .wrong');

			for ( i = 0, l = els.length ; i < l; i++ ) {
				utils.removeClass(els[i], 'wrong');
			}

			selectedTiles = [];
			isGameReady = true;
		}, 250);
	}


	/**
	*
	* The word is correct, calculate points and load new tiles
	*
	*/
	function correctWord () {
		var i = 0,
			l = selectedTiles.length,
			score = 0,
			letter = '',
			prevLetter = '',
			word = '',
			special = 0,
			timebonus = 0,
			levelupbonus = 0,
			isBonusWord = false,
			blackTile = 0,
			prevLevel = scoreboard.getLevel();
		
		// Find the word value
		for ( ; i < l; i++ ) {
			letter = String.fromCharCode(selectedTiles[i].letter);
			score += dict.getLetterValue(letter) * (prevLetter == letter ? 2 : 1);
			prevLetter = letter;
			word += letter;
			if ( selectedTiles[i].special == 1 ) special++;
			else if ( selectedTiles[i].special == 2 ) timebonus++;
			else if ( selectedTiles[i].special == 3 ) levelupbonus++;
			else if ( selectedTiles[i].special == 4 ) blackTile++;
		}
		// multiply the value by the number of letters (over the third letter)
		score = score * ( l - 2 );

		// bonus word grants super bonus
		if ( word == bonusWord ) {
			isBonusWord = true;
			special = 0;		// bonuses do not sum up
			blackTile = 0;
			timebonus = 0;
			levelupbonus = 0;
			score = score * 10;
			utils.floatMessage(selectedTiles[l-1].el, 'Bonus Word', -60, 1500);
			//updateBonusWord();

			HEXA.levelup.add( HEXA.levelup.getRemaining()-1 );
		}

		scoreboard.addLetters(l);		// Update the number of letters, available swaps, and level progress
		countdown.add(l * ( l - 3 ));	// grant the user a bonus time if the word is longer than 3 letters

		// Black tile zeros other bonuses
		if ( blackTile ) {
			special = 0;
			timebonus = 0;
			levelupbonus = 0;

			utils.floatMessage(selectedTiles[l-1].el, 'Black Tile!', -60, 1500);
			if ( scoreboard.getLevel() == prevLevel ) {
				countdown.pause();
				boardRedraw = true;
			}
		}

		// special tiles grant special bonus
		if ( special ) {
			special = Math.min(special * 3, 9);
			score = score * special;
			utils.floatMessage(selectedTiles[l-1].el, 'Score x' + special, -60, 1500);
		}

		// special tiles grant special bonus
		if ( timebonus ) {
			utils.floatMessage(selectedTiles[l-1].el, 'Bonus Time', 60, 1500);
			countdown.add(15);
		}

		// Level up bonus
		if ( levelupbonus ) {
			utils.floatMessage(selectedTiles[l-1].el, 'Level Up Bonus', -80, 1800);
			HEXA.levelup.add( l * 3 );
		}

		if ( scoreboard.getLevel() == prevLevel ) audio.correctWord();
		scoreboard.addScore(score);

		// Show the score
		if ( !blackTile && !isBonusWord && !timebonus && !special && !levelupbonus ) utils.floatMessage(selectedTiles[l-1].el, score, -50, 1000);

		// Find new tiles
		setTimeout(updateTiles, 10);
	}

	function updateTiles () {
		var i = 0,
			l = selectedTiles.length,
			tile,
			delay = 0,
			special,
			vowels = dict.getVowels().join(''),
			level = HEXA.scoreboard.getLevel(),
			newTile = function (el) {
				var tile = hexmap.tiles[el.dataset.x][el.dataset.y],
					oldLetter;

				utils.translate(tile.el, 0, 0, 1);

				tile.special = false;
				if ( !special ) {
					special = utils.rnd(parms.mapWidth * parms.mapHeight) + 1;
					if ( special == 1 ) {
						tile.special = special;
						special = true;
					} else if ( special == 2 && level > 2 ) {
						tile.special = special;
						special = true;
					} else if ( special == 3 && level > 4 ) {
						tile.special = special;
						special = true;
					} else if ( special == 4 && level > 6 ) {
						tile.special = special;
						special = true;
					} else {
						special = false;
					}
				}

				tile.variant = tile.special ? tile.special + 3 : utils.rnd(1, 3);

				oldLetter = tile.letter;

				while ( oldLetter == tile.letter ) {
					if ( parms.mapWidth * parms.mapHeight / hexmap.getVowels() > 3 ) {
						tile.letter = !utils.rnd(Math.round(parms.mapWidth * parms.mapHeight * 2)) ? 63 : dict.getVowel();
					}
					tile.letter = !utils.rnd(Math.round(parms.mapWidth * parms.mapHeight * 2)) ? 63 : dict.getLetter();
				}

				tile.el.innerHTML = String.fromCharCode(tile.letter);
				tile.el.className = 'tile ' + 'variant' + tile.variant;
				tile.el.offsetHeight;

				if ( tile.el.innerHTML != '?' && vowels.match(tile.el.innerHTML) ) {
					hexmap.addVowel();
				}

				utils.animate(tile.el, {
					from: { opacity: 0, scale: 0.5 },
					to: { opacity: 1, scale: 1 },
					duration: 300,
					easing: HEXA.easing.quadraticOut,
					callback: function (el) {
						el.style.opacity = '';

						if ( tile == selectedTiles[l-1] ) {
							if ( boardRedraw ) {
								boardRedraw = false;
								hexmap.redraw(function () {
									countdown.start();
									isGameReady = true;
								});
							} else {
								isGameReady = true;
							}

							selectedTiles = [];
						}
					}
				});
			};

		for ( ; i < l; i++ ) {
			tile = hexmap.tiles[selectedTiles[i].el.dataset.x][selectedTiles[i].el.dataset.y];

			if ( tile.el.innerHTML != '?' && vowels.match(tile.el.innerHTML) ) {
				hexmap.removeVowel();
			}

			utils.animate(tile.el, {
				from: { opacity: 1, scale: 1 },
				to: { opacity: 0, scale: 2 },
				duration: 400,
				delay: i * 50,
				easing: HEXA.easing.quadraticOut,
				callback: newTile
			});
		}
	}


	/**
	*
	* Drag the tile
	*
	*/
	function dragStart (e) {
		if ( !isGameReady || isGameOver || scoreboard.getSwaps() < 1 ) return;

		var tile = hexmap.findTileFromPosition(e.pageX, e.pageY),
			i, l,
			x, y;

		if ( !tile ) return;

		isGameReady = false;

		// Deselect previously selected tiles
		for ( i = 0, l = selectedTiles.length; i < l; i++) utils.removeClass(selectedTiles[i].el, 'pressed');
		selectedTiles = [];

		x = tile.x;
		y = tile.y;
		tile = hexmap.tiles[x][y].el;

		dragging = new HEXA.DragDrop(boardEl, tile, hexmap.findNearby(+tile.dataset.x, +tile.dataset.y), e.pageX, e.pageY,
			function ( drop ) {
				dragging = null;
				isGameReady = true;

				audio.tileDrop();

				if ( !drop ) return;

				var oldTile = hexmap.tiles[x][y],
					newTile = hexmap.tiles[drop.dataset.x][drop.dataset.y],
					tmpLetter = oldTile.letter,
					tmpVariant = oldTile.variant,
					tmpSpecial = oldTile.special;

				// Update remaining swaps
				scoreboard.addSwaps(-1);

				// Swap the tiles values
				oldTile.letter = newTile.letter;
				newTile.letter = tmpLetter;

				oldTile.variant = newTile.variant;
				newTile.variant = tmpVariant;
				
				oldTile.special = newTile.special;
				newTile.special = tmpSpecial;

				tile.className = tile.className.replace(/variant[0-9]/, 'variant' + oldTile.variant);
				drop.className = drop.className.replace(/variant[0-9]/, 'variant' + newTile.variant);

				oldTile.el.innerHTML = String.fromCharCode(oldTile.letter);
				newTile.el.innerHTML = String.fromCharCode(newTile.letter);
			},
			// is hex map?
			true
		);
	}


	/**
	*
	* Get a new bonus word
	*
	*/
	function updateBonusWord () {
		bonusWord = dict.pickRandom('1');
		bonuswordEl.innerHTML = bonusWord.toLowerCase();
	}


	/**
	*
	* Get a new bonus word
	*
	*/
	function levelUp () {
		var el = utils.create('div');

		// Pause game
		countdown.pause();
		isGameReady = false;
		isGameOver = true;

		el.className = 'levelUp';
		utils.translate(el, 0, 0, 0.7);
		boardwrapperEl.appendChild(el);

		audio.levelUp();

		utils.animate(el, {
			from: { opacity: 1, scale: 0.7 },
			to: { opacity: 0, scale: 1.2 },
			duration: 2000,
			easing: HEXA.easing.quadraticIn,
			callback: function () {
				boardwrapperEl.removeChild(el);
				HEXA.checkpoint.show();
			}
		});
	}

	/**
	*
	* Game Over
	*
	*/
	function gameOver () {
		isGameReady = false;
		isGameOver = true;

		if ( dragging ) {
			dragging.interrupt();
			dragging = null;
		}

		HEXA.gameover.show(function () {
			$.id('homescreen').style.left = '0';
			boardSlideOut();
			scoreboardSlideOut();
		});
	}

	return {
		init: init,
		restart: restart
	};
})();