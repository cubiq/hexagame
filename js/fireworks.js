HEXA.fireworks = (function () {
	var	// Libs
		utils = HEXA.utils,
		render = HEXA.render,
		parms = HEXA.parms,

		// Helpers
		RAND = function (v) { return Math.floor(Math.random() * v); },

		particles = [],

		active = true;

	function fireworks () {
		var i,
			canvas = $.id('popup'),
			x = canvas.offsetLeft + RAND(canvas.offsetWidth),
			y = canvas.offsetTop + RAND(canvas.offsetHeight),
			color = ['fff', 'ffa', 'aff', 'faf', 'aff'][RAND(4)],
			count = 50 + RAND(parms.isGoodBrowser ? 50 : 0),
			size = 15 + RAND(5),
			angle,
			vel,
			el,
			wrapper = $.id('game');
		
		particles = [];
		active = true;

		for ( i = 0; i < count; i++ ) {
			el = utils.create('div');
			el.className = 'firework';
			el.innerHTML = '*';
			el.style.color = '#' + color;

			angle = Math.PI * 2 * Math.random();
			vel = (8 + RAND(2)) * Math.random();

			particles.push({
				el: el,
				x: x,
				y: y,
				vx: vel * Math.cos(angle),
				vy: vel * Math.sin(angle),
				size: (size + RAND(10)) / 10,
				decay: 0.94 + RAND(4) / 100
			});

			wrapper.appendChild(el);
		}

		function explode () {
			var i = 0,
				l = particles.length,
				x, y,
				particle,
				size,
				duration = 2000;

			if ( !l ) {
				render.removeKeyframeFn(explode);

				particles = $.all('#game .firework');
				l = particles.length;
			
				for ( i = 0; i < l; i++ ) {
					particles[i].parentNode.removeChild(particles[i]);
				}

				particles = [];

				if ( active ) fireworks();
				return;
			}

			for ( ; i < l; i++ ) {
				particle = particles[i];

				if ( particle ) {
					particle.x += particle.vx;
					particle.y += particle.vy + 0.9;		// Give a little gravity here
					particle.vx *= particle.decay;
					particle.vy *= particle.decay;
					particle.size *= particle.decay;

					utils.translate(particle.el, particle.x + 100, particle.y, particle.size);

					if ( particle.size < 0.3 ) {
						utils.translate(particle.el, -9999, 0);
						particles.splice(i, 1);
					}
				}
			}
		}

		render.addKeyframeFn(explode, 'fireworks');
		render.start();
	}

	function stop () {
		var i = 0,
			l = particles.length;

		active = false;

		if ( !l ) return;
		
		render.removeKeyframesByContext('fireworks');

		for ( ; i < l; i++ ) {
			particles[i].el.parentNode.removeChild(particles[i].el);
		}

		particles = [];
	}

	return {
		start: fireworks,
		stop: stop
	};

})();