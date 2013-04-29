/**
 * Dropdown shows a list of options for navigation.
 * @name Dropdown
 * @class Dropdown
 * @augments ch.Widget
 * @requires ch.Positioner
* @requires ch.Collapsible
 * @requires ch.Closable
 * @see ch.Positioner
 * @memberOf ch
 * @param {Object} [options] Object with configuration properties.
 * @param {Boolean} [options.open] Shows the dropdown open when component was loaded. By default, the value is false.
 * @param {Boolean} [options.reposition]
 * @param {String} [options.points] Sets the points where component will be positioned, specified by configuration or centered by default: "cm cm".
 * @param {Boolean} [options.fx] Enable or disable UI effects. By default, the effects are disable.
 * @returns itself
 * @factorized
 * @exampleDescription Create a new dropdown without configuration.
 * @example
 * var widget = $('.example').dropdown();
 * @exampleDescription Create a new dropdown with configuration.
 * @example
 * var widget = $('.example').dropdown({
 *     'open': true,
 *     'icon': false,
 *     'points': 'lt lt',
 *     'fx': true
 * });
 */
(function (window, $, ch) {
    'use strict';

    if (window.ch === undefined) {
        throw new window.Error('Expected ch namespace defined.');
    }

    function Dropdown($el, options) {

        /**
         * Reference to a internal component instance, saves all the information and configuration properties.
         * @private
         * @type {Object}
         */
        var that = this;

        that.init($el, options);

        /**
         * Triggers when the component is ready to use (Since 0.8.0).
         * @fires ch.Dropdown#ready
         * @since 0.8.0
         * @exampleDescription Following the first example, using <code>widget</code> as dropdown's instance controller:
         * @example
         * widget.on('ready',function () {
         *  this.show();
         * });
         */
        window.setTimeout(function () { that.emit('ready'); }, 50);

    }

    /**
     * Private
     */
    var $document = $(window.document),

        /**
         * Inheritance
         */
        parent = ch.util.inherits(Dropdown, ch.Layer);

    /**
     * Prototype
     */
    Dropdown.prototype.name = 'dropdown';

    Dropdown.prototype.constructor = Dropdown;

    Dropdown.prototype._defaults = $.extend(ch.util.clone(parent._defaults), {
        '_className': 'ch-dropdown ch-box-lite',
        'ariaRole': 'menu',
        'fx': false,
        'open': 'click',
        'close': 'pointers-only',
        'offsetY': -1,
        'skin': false,
        'navigation': true
    });

    Dropdown.prototype.init = function ($el, options) {

        var that = this;

        parent.init.call(this, $el, options);

        //TODO: $trigger should be defined in Popover class.
        this.$trigger = this.$el.addClass('ch-dropdown-trigger');

        ch.util.avoidTextSelection(this.$trigger);

        // Default Skin
        if (this._options.skin) {
            this.$trigger.addClass('ch-dropdown-trigger-skin');
            this.$container.addClass('ch-dropdown-skin');

        // Secondary Skin
        } else {
            this.$trigger.addClass('ch-btn-skin ch-btn-small');
        }

        /**
         * Dropdown navigation.
         * @protected
         * @type {Selector}
         */
        if (this._options.navigation) {
            this._$navigation = this.$el.next().find('a').attr('role', 'menuitem');

            // Keyboard support initialize
            var selected = 0,

                optionsLength = this._$navigation.length;

            // Item selected by mouseover
            $.each(this._$navigation, function (i, e) {
                $(e).on('mouseenter.dropdown', function () {
                    that._$navigation[that._selected = i].focus();
                });
            });

            this.arrowsOn();

        }

        this._options.content = this.$el.next();

        return this;
    };

    Dropdown.prototype._select  = function (key) {
        var selected,
            map = {},
            arrow,
            optionsLength = this._$navigation.length;

            // Validations
            if (!this._shown) { return; }

            // Prevent default behaivor
            ch.util.prevent(event);

            // Sets the arrow that user press
            arrow = key.type;

            // Sets limits behaivor
            if (this._selected === (arrow === 'down_arrow' ? optionsLength - 1 : 0)) { return; }

            // Unselects current option
            if (this._selected !== -1) {
                this._$navigation[this._selected].blur();
            }

            if (arrow === 'down_arrow') { this._selected += 1; } else { this._selected -= 1; }

            // Selects new current option
            this._$navigation[this._selected].focus();

    }

    Dropdown.prototype.show = function (content) {

        if (!this._enabled) {
            return this;
        }

        if (this._shown) {
            return this.hide();
        }

        parent.show.call(this, content);

        // Z-index of trigger over content (secondary / skin dropdown)
        if (this._options.skin) {
            this.$trigger.css('z-index', ch.util.zIndex += 1);
        }

        this._selected = -1;

        return this;
    };

    Dropdown.prototype.hide = function () {
        parent.hide.call(this);

        return this;
    };

    /**
     * Turns on keyboard arrows
     * @protected
     * @Object
     * @memberOf ch.dropdown#arrowsOn
     * @name on
     */

    Dropdown.prototype.arrowsOn = function () {

        this.on(ch.onkeyuparrow, this._select);
        this.on(ch.onkeydownarrow, this._select);

        return this;
    };


    /**
     * Turns off keyboard arrows
     * @protected
     * @Object
     * @memberOf ch.dropdown#arrowsOff
     * @name off
     */
    Dropdown.prototype.arrowsOff = function () {

        this.off(ch.onkeyuparrow, this._select);
        this.off(ch.onkeydownarrow, this._select);

        return this;
    };

    ch.factory(Dropdown);

}(this, this.ch.$, this.ch));
