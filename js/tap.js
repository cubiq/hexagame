HEXA.Tap = (function () {
	var // Libs
		parms = HEXA.parms,
		utils = HEXA.utils,

		// Event names
		eventStart,
		eventMove,
		eventEnd,
		eventCancel;

	function Tap (el, drag, delay) {
		// Event names
		eventStart = parms.hasTouch ? 'touchstart' : 'mousedown';
		eventMove = parms.hasTouch ? 'touchmove' : 'mousemove';
		eventEnd = parms.hasTouch ? 'touchend' : 'mouseup';
		eventCancel = parms.hasTouch ? 'touchcancel' : 'mousecancel';

		this.el = el;
		this.delay = delay === undefined ? 300 : delay;
		this.drag = drag;

		utils.bind(this.el, eventStart, this);
		utils.bind(this.el, eventMove, this);
		utils.bind(this.el, eventEnd, this);
		utils.bind(this.el, eventCancel, this);

		//this.el.addEventListener('mouseout', this, false);
	}

	Tap.prototype = {
		initiated: false,
		moved: false,
		timer: null,

		handleEvent: function (e) {
			switch ( e.type ) {
				case eventStart:
					this.start(e);
					break;
				case eventMove:
					this.move(e);
					break;
				case eventEnd:
				case eventCancel:
					this.end(e);
					break;
/*				case 'mouseout':
					this.out();
					break;*/
			}
		},

		start: function (e) {
			if ( e.touches && e.touches.length > 1 ) return;

			var that = this,
				point = parms.hasTouch ? e.touches[0] : e,
				ev;
			
			clearTimeout( this.timer );

			this.initiated = true;
			this.moved = false;
			this.dragging = false;
			this.startX = point.pageX;
			this.startY = point.pageY;
			this.target = e.target;
			utils.addClass(this.target, 'tapPressed');

			if ( this.drag ) {
				this.timer = setTimeout(function () {
					if ( that.delay !== 0 ) that.dragging = true;

					ev = document.createEvent("Event");
					ev.initEvent("dragStart", true, true);
					ev.pageX = that.startX;
					ev.pageY = that.startY;
					that.target.dispatchEvent(ev);
				}, this.delay);
			}
		},

		move: function (e) {
			if ( !this.initiated ) return;

			var x = parms.hasTouch ? e.touches[0].pageX : e.pageX,
				y = parms.hasTouch ? e.touches[0].pageY : e.pageY;

			if ( Math.abs( x - this.startX ) > 10 || Math.abs( y - this.startY ) > 10 ) {
				clearTimeout(this.timer);
				utils.removeClass(this.target, 'tapPressed');
				this.moved = true;
			}
		},
		
/*		out: function () {
			clearTimeout(this.timer);
			if (!this.initiated) return;
		},*/

		end: function (e) {
			//var that = this;

			clearTimeout(this.timer);
			if ( !this.initiated ) return;
			this.initiated = false;
			utils.removeClass(this.target, 'tapPressed');

			if ( !this.moved && !this.dragging ) {
				//e.stopPropagation();
				var ev = document.createEvent("Event");
				ev.initEvent("tap", true, true);
				ev.pageX = parms.hasTouch ? e.changedTouches[0].pageX : e.pageX;
				ev.pageY = parms.hasTouch ? e.changedTouches[0].pageY : e.pageY;
				this.target.dispatchEvent(ev);
			}
		},
		
		destroy: function () {
			utils.unbind(this.el, eventStart, this);
			utils.unbind(this.el, eventMove, this);
			utils.unbind(this.el, eventEnd, this);
			utils.unbind(this.el, eventCancel, this);
			//this.el.removeEventListener('mouseout', this, false);
		}
	};
	
	return Tap;
})();