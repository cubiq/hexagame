HEXA.audio = (function (w) {
	var AC = w.AudioContext || w.webkitAudioContext || w.mozAudioContext || w.oAudioContext || w.msAudioContext,
		audioFiles = [
			'audio/tile-tap.mp3',
			'audio/tile-deselect.wav',
			'audio/wrong-word.mp3',
			'audio/correct-word-1.mp3',
			'audio/correct-word-2.mp3',
			'audio/tile-drop.wav',
			'audio/level-up.wav'
		],
		audioContext,
		bufferLoader,
		soundBuffer,

		onReady;

	function BufferLoader (context, urlList, callback) {
		this.context = context;
		this.urlList = urlList;
		this.onload = callback;
		this.bufferList = [];
		this.loadCount = 0;
	}

	BufferLoader.prototype = {
		loadBuffer: function (url, index) {
			var request = new XMLHttpRequest(),
				that = this;
			request.open('GET', url, true);
			request.responseType = 'arraybuffer';

			request.onload = function () {
				that.context.decodeAudioData(
					request.response,
					function(buffer) {
						if ( !buffer ) return;	// Error

						that.bufferList[index] = buffer;
						if ( ++that.loadCount == that.urlList.length ) that.onload(that.bufferList);
					}
				);
			};

			request.send();
		},

		load: function () {
			var i = 0,
				l = this.urlList.length;

			for (; i < l; ++i) this.loadBuffer(this.urlList[i], i);
		}
	};

	function init (callback) {
		if ( !AC ) {
			callback();
			return;
		}

		onReady = callback;
		audioContext = new AC();
		bufferLoader = new BufferLoader(audioContext, audioFiles, start);
		bufferLoader.load();
	}

	function start (buffer) {
		soundBuffer = buffer;

		// Init sound (seems to help)
		var sound = audioContext.createBufferSource();
		sound.buffer = buffer[0];
		sound.connect(audioContext.destination);

		onReady();
	}

	function playSound (i) {
		if ( !AC ) return;

		setTimeout(function () {
			var sound = audioContext.createBufferSource();
			sound.buffer = soundBuffer[i];
			sound.connect(audioContext.destination);
			sound.noteOn(0);
		}, 0);
	}

	function tileTap () {
		playSound(0);
	}

	function tileDeselect () {
		playSound(1);
	}

	function wrongWord () {
		playSound(2);
	}

	function correctWord () {
		playSound( Math.round(Math.random()) + 3 );
	}

	function tileDrop () {
		playSound(5);
	}

	function levelUp () {
		playSound(6);
	}

	return {
		init: init,
		tileTap: tileTap,
		tileDeselect: tileDeselect,
		wrongWord: wrongWord,
		correctWord: correctWord,
		tileDrop: tileDrop,
		levelUp: levelUp
	};
})(window);