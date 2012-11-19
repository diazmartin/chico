/**
* Positioner lets you centralize and manage changes related to positioned elements. Positioner returns an utility that resolves positioning for all widget.
* @name Positioner
* @class Positioner
* @memberOf ch
* @param {Object} conf Configuration object with positioning properties.
* @param {String} conf.element Reference to the DOM Element to be positioned.
* @param {String} [conf.context] It's a reference to position and size of element that will be considered to carry out the position. If it isn't defined through configuration, it will be the viewport.
* @param {String} [conf.points] Points where element will be positioned, specified by configuration or centered by default.
* @param {String} [conf.offset] Offset in pixels that element will be displaced from original position determined by points. It's specified by configuration or zero by default.
* @param {Boolean} [conf.reposition] Parameter that enables or disables reposition intelligence. It's disabled by default.
* @requires ch.Viewport
* @see ch.Viewport
* @returns {Function} The Positioner returns a Function that it works in 3 ways: as a setter, as a getter and with the "refresh" parameter refreshes the position.
* @exampleDescription
* Instance the Positioner It requires a little configuration.
* The default behavior place an element centered into the Viewport.
*
* @example
* var positioned = ch.positioner({
*     element: "#element1",
* });
* @exampleDescription 1. Getting the current configuration properties.
* @example
* var configuration = positioned()
* @exampleDescription 2. Updates the current position with <code>refresh</code> as a parameter.
* @example
* positioned("refresh");
* @exampleDescription 3. Define a new position
* @example
* positioned({
*     element: "#element2",
*     context: "#context2",
*     points: "lt rt"
* });
* @exampleDescription <strong>Offset</strong>: The positioner could be configurated with an offset.
* This example show an element displaced horizontally by 10px of defined position.
* @example
* var positioned = ch.positioner({
*     element: "#element3",
*     context: "#context3",
*     points: "lt rt",
*     offset: "10 0"
* });
* @exampleDescription <strong>Reposition</strong>: Repositionable feature moves the postioned element if it can be shown into the viewport.
* @example
* var positioned = ch.positioner({
*     element: "#element4",
*     context: "#context4",
*     points: "lt rt",
*     reposition: true
* });
*/

(function (window, $, ch) {
	'use strict';

	if (ch === undefined) {
		throw new window.Error('Expected ch namespace defined.');
	}

	var $window = $(window);


	// calcula las coordenadas y devuelve un objeto, el contexto va a ser coords
	function calcCoords(side, aligned, data) {
		console.log(data)
		if(this[side]){
			return this[side];
		}


		// take the side and calculate the alignment and make the CSSpoint
		if (side === 'centered') {
			// calculates the coordinates related to the center side to locate the target
			this.centered = {
				top: (data.target.offset.top + (data.reference.height / 2 - data.target.height / 2)),
				left: (data.target.offset.left + (data.reference.width / 2 - data.target.width / 2))
			};

			return {
				'top': this.centered.top,
				'left': this.centered.left
			}

		} else if (side === 'top' || side === 'bottom') {
			// calculates the coordinates related to the top or bottom side to locate the target
			this.top = this.bottom = {
				left: data.target.offset.left,
				centered: (data.target.offset.left + (data.reference.width / 2 - data.target.width / 2)),
				right: (data.target.offset.left + data.reference.width - data.target.width),
				top: data.target.offset.top - data.target.height,
				bottom: (data.target.offset.top + data.reference.height)
			};

			return {
				'top': this.top[side],
				'left': this.top[aligned]
			}

		} else {
			// calculates the coordinates related to the right or left side to locate the target
			this.right = this.left = {
				top: data.target.offset.top,
				centered: (data.target.offset.top + (data.reference.height / 2 - data.target.height / 2)),
				bottom: (data.target.offset.top + data.reference.height - data.target.height),
				right: (data.target.offset.left + data.reference.width),
				left: (data.target.offset.left - data.target.width)
			};

			return {
				'top': this.right[aligned],
				'left': this.right[side]
			}
		}
	}

	function Positioner(options) {

		this.$reference = options.reference;
		this.$target = options.target;
		this.$context = this.$reference.offsetParent();
		this.offset = options.offset || this.offset;



		// sets position absolute before doing the calcs to avoid calcs with the element making space
		this.$target.css('position', 'absolute');
		//this.init(options);

		this.updateData()
		// this.locate() > getter / setter
		// this.data
		this.init(options)


		return this;
	}

	Positioner.prototype.updateData = function(){
		var data = {
			'context': {
				'$element': this.$context,
				'height': this.$context.outerHeight(),
				'width': this.$context.outerWidth(),
				'offset': this.$context.offset(),
				'isPositioned': (ch.util.getStyles(this.$target.offsetParent()[0], 'position') !== 'static'),
				'border': {
					'top': parseInt(this.$reference.offsetParent().css('border-top-width'), 10),
					'left': parseInt(this.$reference.offsetParent().css('border-left-width'), 10)
				}
			},
			'reference': {
				'$element': this.$reference,
				'height': this.$reference.outerHeight(),
				'width': this.$reference.outerWidth(),
				'offset': this.$reference.offset()
			},
			'target': {
				'$element': this.$target,
				'height': this.$target.outerHeight(),
				'width': this.$target.outerWidth(),
				'offset': {}
			}
		}

		if ( data.context.isPositioned ) {
			data.target.offset.top = (data.reference.offset.top - data.context.border.top - data.context.offset.top);
			data.target.offset.left = (data.reference.offset.left - data.context.border.left - data.context.offset.left);
		} else {
			data.target.offset.top = (data.reference.offset.top - data.context.border.top);
			data.target.offset.left = (data.reference.offset.left - data.context.border.left);
		}

		this.data = data;

		return this;

	}

	Positioner.prototype.init = function (options) {

		var that = this,
			side = options.side,
			aligned = options.aligned,
			setOffset,
			// the object that stores the top, left reference to set to the target
			CSSPoint = {},
			// the object that stores the alignments related to the location's side
			coordinates = {};
			// the offsets to the parent, if where relative or absolute
			//offsetParent = target.offset;


		/// this.setData()

		/// llamar a calcCoords pasarle como contexto la variable que guarda las coordenadas para ESTA instancia
		var CSSPoint = calcCoords.apply(this.coords, [side, aligned, this.data]);

		console.log(CSSPoint);

		// add offset if there is any
		if(this.offset !== ''){
			setOffset = this.offset.split(' ');
			CSSPoint.top = (CSSPoint.top + (parseInt(setOffset[0], 10) || 0));
			CSSPoint.left = (CSSPoint.left + (parseInt(setOffset[1], 10) || 0));
		}

		this.$target.css(CSSPoint);
		return this;
	}

	Positioner.prototype.locate = Positioner.prototype.init;

	Positioner.prototype.offset = '';
	Positioner.prototype.coords = {};

	Positioner.prototype.name = 'positioner';
	Positioner.prototype.constructor = Positioner;

	ch.Positioner = Positioner;

}(this, this.jQuery, this.ch));