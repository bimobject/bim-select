/* global chai */
chai.use(function(_chai, utils) {
    var Assertion = _chai.Assertion;

    Assertion.addMethod('style', function(property, value) {
        var element = this._obj;

        // Expect generic DOM element. SVG or HTML.
        new Assertion(element).to.be.instanceof(Element);

        var style = getComputedStyle(element);

        if (!this.__flags.negate) {
            this.assert(
                property in style,
                'expected #{this} to have style property ' + utils.inspect(property),
                'expected #{this} to not have style property ' + utils.inspect(property)
            );
        }

        if (arguments.length === 2) {
            this.assert(
                style[property] === value,
                'expected #{this} to have style property ' + utils.inspect(property) + ' with value #{exp} but got #{act}',
                'expected #{this} to not have style property ' + utils.inspect(property) + ' with value #{exp} but got #{act}',
                value,          // expected
                style[property] // actual
            );
        }

        utils.flag(this, 'object', style[property]);
    });

    Assertion.addMethod('dimension', function(width, height) {
        var element = this._obj;

        if (typeof width === 'number') { width = width + 'px'; }
        if (typeof height === 'number') { height = height + 'px'; }

        if (this.__flags.negate) {
            new Assertion(element).to.not.have.style('width', width);
            new Assertion(element).to.not.have.style('height', height);
        } else {
            new Assertion(element).to.have.style('width', width);
            new Assertion(element).to.have.style('height', height);
        }
    });
});
