HEXA.DragDrop = (function () {
	var	// Libs
		utils = HEXA.utils,
		parms = HEXA.parms,
		hexmap = HEXA.hexmap,
		render = HEXA.render,

		// Event names
		eventMove,
		eventEnd,
		eventCancel;

	/**
	*
	* drag and drop
	*
	*/
	function DragDrop (board, draggable, droppable, pageX, pageY, onCompletion, isHexMap) {
		// Event names
		eventMove = parms.hasTouch ? 'touchmove' : 'mousemove';
		eventEnd = parms.hasTouch ? 'touchend' : 'mouseup';
		eventCancel = parms.hasTouch ? 'touchcancel' : 'mousecancel';

		this.board = board;
		this.draggable = draggable;
		this.droppable = droppable;
		this.isHexMap = isHexMap;

		this.onCompletion = onCompletion;

		var wrapper = this.board;
		this.offsetX = wrapper.offsetLeft;
		this.offsetY = wrapper.offsetTop;

		while ( wrapper = wrapper.offsetParent ) {
			this.offsetX += wrapper.offsetLeft;
			this.offsetY += wrapper.offsetTop;
		}

		this.offsetX += this.draggable.offsetLeft + Math.round(this.draggable.offsetWidth / 2);
		this.offsetY += this.draggable.offsetTop + Math.round(this.draggable.offsetHeight / 2);

		this.__pos(pageX, pageY);

		utils.addClass(this.draggable, 'drag');

		utils.bind(this.board, eventMove, this);
		utils.bind(this.board, eventEnd, this);
		utils.bind(this.board, eventCancel, this);
	}

	DragDrop.prototype = {
		dropCandidate: null,

		handleEvent: function (e) {

			switch (e.type) {
				case eventMove:
					this.__move(e);
					break;
				case eventCancel:
				case eventEnd:
					this.__end(e);
					break;
			}
		},

		destroy: function () {
			utils.removeClass(this.draggable, 'drag');

			utils.unbind(this.board, eventMove, this);
			utils.unbind(this.board, eventEnd, this);
			utils.unbind(this.board, eventCancel, this);
		},

		interrupt: function () {
			var i, l;

			utils.translate(this.draggable, 0, 0);

			if ( this.isHexMap ) {
				for ( i = 0, l = this.droppable.length; i < l; i++ ) {
					utils.translate(this.droppable[i], 0, 0);
				}
			}

			this.destroy();
		},
	
		__pos: function (x, y) {
			x -= this.offsetX + 20;
			y -= this.offsetY + 20;

			utils.translate(this.draggable, x, y);
		},

		__move: function (e) {
			var point = parms.hasTouch ? e.changedTouches[0] : e;

			this.__pos(point.pageX, point.pageY);

			if ( this.isHexMap ) this.__swapTiles(point.pageX, point.pageY);
		},

		__swapTiles: function (x, y) {
			var dropTile,
				dropCandidate,
				i, l = this.droppable.length,
				pos;

			dropTile = hexmap.findTileFromPosition(x, y);
			dropTile = dropTile ? hexmap.tiles[dropTile.x][dropTile.y].el : false;

			for ( i = 0 ; i < l; i++ ) {
				if ( dropTile == this.droppable[i] ) {
					dropCandidate = dropTile;
					break;
				}
			}

			if ( this.dropCandidate == dropCandidate ) return;
			//if ( !dropCandidate ) this.dropCandidate = null;

			if ( this.dropCandidate ) {
				pos = utils.getTranslate(this.dropCandidate);

				if ( this.dropCandidate.animationInstance ) {
					render.removeKeyframeFn(this.dropCandidate.animationInstance);
					delete this.dropCandidate.animationInstance;
				}

				this.dropCandidate.animationInstance = utils.animate(this.dropCandidate, {
					from: { x: pos.x, y: pos.y },
					to: { x: 0, y: 0 },
					duration: 100,
					easing: HEXA.easing.quadraticOut
				});

				this.dropCandidate = undefined;
			}

			if ( dropCandidate ) {
				this.dropCandidate = dropCandidate;

				if ( dropCandidate.animationInstance ) {
					render.removeKeyframeFn(dropCandidate.animationInstance);
					delete dropCandidate.animationInstance;
				}

				pos = utils.getTranslate(dropCandidate);

				dropCandidate.animationInstance = utils.animate(dropCandidate, {
					from: { x: pos.x, y: pos.y },
					to: { x: this.draggable.offsetLeft - dropTile.offsetLeft, y: this.draggable.offsetTop - dropTile.offsetTop },
					duration: 100,
					easing: HEXA.easing.quadraticOut
				});
			}
		},
	
		__end: function (e) {
			var point = parms.hasTouch ? e.changedTouches[0] : e;

			this.destroy();

			if ( this.isHexMap ) this.__hexmapDrop(point.pageX, point.pageY);
			else this.__wordhuntDrop(point.pageX, point.pageY);
		},

		__hexmapDrop: function (x, y) {
			var i = 0,
				l = this.droppable.length,
				dropTile,
				pos,
				licitDrop = false,
				that = this;
			
			dropTile = hexmap.findTileFromPosition(x, y);
			dropTile = dropTile ? hexmap.tiles[dropTile.x][dropTile.y].el : false;

			// Reset droppables position
			for ( i = 0 ; i < l; i++ ) {
				if ( this.droppable[i].animationInstance ) {
					render.removeKeyframeFn(this.droppable[i].animationInstance);
					delete this.droppable[i].animationInstance;
					utils.translate(this.droppable[i], 0, 0);
				}

				if ( this.droppable[i] == dropTile ) licitDrop = true;
			}

			if ( !licitDrop ) {
				pos = utils.getTranslate(this.draggable);
				utils.animate(this.draggable, {
					from: { x: pos.x, y: pos.y },
					to: { x: 0, y: 0 },
					duration: 100,
					easing: HEXA.easing.quadraticOut,
					callback: function () {
						that.onCompletion.call(that);
					}
				});

				return;
			}

			utils.translate(this.draggable, 0, 0);
			this.onCompletion.call(this, dropTile);
		},

		__wordhuntDrop: function (x, y) {
			var dropTile,
				distanceX = Math.round(parms.tileWidth / 4) * 3,
				distanceY = parms.tileHeight,
				offsetTop,
				offsetLeft,
				offsetY,
				pos;
			
			dropTile = hexmap.findTileFromPosition(x, y, this.board);
			pos = utils.getTranslate(this.draggable);

			if ( dropTile && dropTile.y > 0 ) {
				offsetY = +this.draggable.dataset.x % 2 ? Math.round(parms.tileHeight / 2) : 0;

				x = this.draggable.dataset.x * distanceX;
				y = 2 * distanceY + offsetY;
				
				offsetTop = this.draggable.offsetTop;
				offsetLeft = this.draggable.offsetLeft;
				this.draggable.style.left = x + 'px';
				this.draggable.style.top = y + 'px';
				x = pos.x - (this.draggable.offsetLeft - offsetLeft);
				y = pos.y - (this.draggable.offsetTop - offsetTop);
				utils.translate(this.draggable, x, y);

				utils.animate(this.draggable, {
					from: { x: x, y: y },
					to: { x: 0, y: 0 },
					duration: 100,
					easing: HEXA.easing.sineInOut
				});

				this.onCompletion.call(this, dropTile);
				return;
			}

			if ( dropTile ) {
				if ( this.droppable[dropTile.x] === null ) {
					this.onCompletion.call(this, dropTile);
					return;
				}
			}

			utils.animate(this.draggable, {
				from: { x: pos.x, y: pos.y },
				to: { x: 0, y: 0 },
				duration: 100,
				easing: HEXA.easing.quadraticOut
			});
			this.onCompletion.call(this);
		}
	};
	
	return DragDrop;
})();