/* eslint-env mocha */
/* global sinon, bard, expect, $ */

// TODO: switch to use sinon.useFakeTimers instead of all the proimses.

describe('bimSelect', function() {
    var deps;
    var container;
    var scope;

    beforeEach(function() {
        module('app.templates');
        bard.appModule('app.widgets');
        deps = bard.inject('$rootScope', '$compile', '$componentController', '$timeout');
        scope = deps.$rootScope.$new();
    });
    afterEach(function() {
        container && document.body.removeChild(container);
        container = null;
    });

    describe('component', function() {
        beforeEach(function() {
            sinon.spy($.fn, 'dropdown');

            this.open = function(preventCreate) {
                if (!preventCreate) {
                    this.element = createElement();
                }

                angular.element(this.element)
                    .find('input')
                    .focus() // Chrome
                    .click(); // FF and IE

                return new Promise(function(resolve, reject) {
                    // Await debounce
                    setTimeout(resolve, 60);
                });
            };
            this.filter = function(filter) {
                angular
                    .element(this.element)
                    .find('input')
                    // match glenn and Miliam, not Sigyn.
                    .val(filter)
                    // blink, gecko, webkit
                    .trigger('input')
                    // trident (ie11)
                    .trigger('change');

                return new Promise(function(resolve, reject) {
                    // Await debounce
                    setTimeout(resolve, 60);
                });
            };
            this.press = function(which) {
                this.event = $.Event('keydown', {
                    which: which
                });
                sinon.spy(this.event, 'preventDefault');

                angular
                    .element(this.element)
                    .find('input')
                    .trigger(this.event);

                scope.$digest();

                var li = this.element.querySelector('li.active');
                var lis = [].slice.call(this.element.querySelectorAll('li'), 1, -1);
                var index = lis.indexOf(li);

                if (index === -1) {
                    return null;
                }

                var active = angular.element(li.parentNode).scope().$ctrl.matches[index];
                return active.model;
            };

            this.pressUp = function() { return this.press(38); };
            this.pressDown = function() { return this.press(40); };
            this.pressEnter = function() { return this.press(13); };
            this.pressEscape = function() { return this.press(27); };
        });
        afterEach(function() {
            $.fn.dropdown.restore();
        });
        it('renders the items in the list', function() {
            scope.items = [
                { id: 1, name: 'Glenn' },
                { id: 2, name: 'Miliam' }
            ];
            var element = createElement('<bim-select ng-model="value" items="items"></bim-select>');
            // vs-repeat pads with 2. so 4 instead of 2.
            expect(element.querySelectorAll('ul>li')).to.have.length(4);
        });
        it('uses virtual scroll on the list', function() {
            var element = createElement('<bim-select ng-model="value"></bim-select>');
            expect(element.querySelector('ul')).to.have.attribute('vs-repeat');
        });
        context('when items are updated', function() {
            beforeEach(function() {
                scope.items = [
                    { id: 1, name: 'Glenn' },
                    { id: 2, name: 'Miliam' },
                    { id: 3, name: 'Sigyn' }
                ];
                this.element = createElement();
            });
            it('they are rendered', function() {
                expect(this.element.querySelectorAll('li')).to.have.length(5);
                scope.items = scope.items.slice(2); // remove 2
                scope.$digest();
                expect(this.element.querySelectorAll('li')).to.have.length(3);
            });
        });
        context('when list is empty', function() {
            beforeEach(function() {
                scope.items = [];
                scope.change = sinon.stub();
                return this.open();
            });
            it('shows a message to the user', function() {
                // Get first real match.
                var li = this.element.querySelector('li:nth-child(2)');
                expect(li).to.contain.text('No options');
            });
            it('does not allow user to select the message item', function() {
                this.element.querySelector('li:nth-child(2) a').click();
                scope.$digest();
                expect(scope.change).to.not.have.been.called;
            });
            it('does not allow the user to highlight the message item', function() {
                var active = this.pressDown();
                expect(active).to.be.null;
            });
        });
        context('when filtered list is empty', function() {
            beforeEach(function() {
                scope.items = [{ id: 1, name: 'Glenn' }];
                this.open();
                this.filter('Miliam');
            });
            it('shows a message to the user', function() {
                // Get first real match.
                var li = this.element.querySelectorAll('li')[1];
                expect(li).to.contain.text('No matches');
            });
        });
        context('when focus on the input', function() {
            it('opens the dropdown', function(done) {
                this.open().then(function() {
                    var dropdown = this.element.querySelector('.dropdown');
                    expect(dropdown).to.have.class('open');
                    done();
                }.bind(this));
            });
            it('force vs-repeat to rerender', function(done) {
                // And we need to do it when the DOM has rendered ($timeout) so vs-repeat
                // can calculate the height.
                var spy = sinon.spy();
                this.open().then(function() {
                    var $element = angular.element(this.element);
                    $element.find('[vs-repeat]').scope().$on('vsRepeatResize', spy);
                    deps.$timeout.flush();
                    expect(spy).to.have.been.calledOnce;
                    done();
                }.bind(this));
            });
            context('with a selected value', function() {
                beforeEach(function(done) {
                    scope.items = [
                        { id: 1, name: 'Glenn' },
                        { id: 2, name: 'Sigyn' }
                    ];
                    scope.value = scope.items[0];
                    this.open().then(function() {
                        done();
                    });
                });
                it('empties the input field', function() {
                    var input = this.element.querySelector('input');
                    expect(input).to.have.value('');
                });
                context('when leaving the dirty input field', function() {
                    beforeEach(function() {
                        this.filter('sig');
                        angular.element(document).trigger('mousedown');
                        scope.$digest();
                    });
                    it('closes the dropdown', function() {
                        expect(this.element.querySelector('.dropdown')).to.not.have.class('open');
                    });
                    it('shows the selected model text', function() {
                        expect(this.element.querySelector('input')).to.have.value(scope.value.name);
                    });
                });
                context('when pressing escape', function() {
                    beforeEach(function() {
                        this.open();
                        this.pressEscape();
                    });
                    it('closes the dropdown', function() {
                        expect(this.element.querySelector('.dropdown')).to.not.have.class('open');
                    });
                    it('shows the selected model text', function() {
                        expect(this.element.querySelector('input')).to.have.value(scope.value.name);
                    });
                });
            });
            context('when key pressed is', function() {
                beforeEach(function() {
                    scope.items = [
                        { id: 1, name: 'Glenn' },
                        { id: 2, name: 'Miliam' },
                        { id: 3, name: 'Sigyn' }
                    ];
                });
                context('up arrow', function() {
                    it('prevents standard text box navigation', function() {
                        this.open();
                        this.filter('l');
                        this.pressDown();
                        expect(this.event.preventDefault).to.have.been.calledOnce;
                        this.pressUp();
                        expect(this.event.preventDefault).to.have.been.calledOnce;
                    });
                    context('when no item is highlighted', function() {
                        beforeEach(function() {
                            this.open();
                        });
                        it('does not highlight any item', function() {
                            var active = this.pressUp();
                            expect(active).to.be.null;
                        });
                    });
                    context('when first item is highlighted', function() {
                        beforeEach(function() {
                            this.open();
                            this.pressDown();
                        });
                        it('does not change the highlighted item', function() {
                            var active = this.pressUp();
                            expect(active).to.have.property('name', 'Glenn');
                        });
                    });
                    context('when second item is highlighted', function() {
                        beforeEach(function() {
                            this.open();
                            this.pressDown();
                            this.pressDown();
                        });
                        it('highlights the first item', function() {
                            var active = this.pressUp();
                            expect(active).to.have.property('name', 'Glenn');
                        });
                    });
                });
                context('down arrow', function() {
                    it('prevents standard text box navigation');
                    context('when no item is highlighted', function() {
                        beforeEach(function() {
                            this.open();
                        });
                        it('highlights the first item', function() {
                            var active = this.pressDown();
                            expect(active).to.have.property('name', 'Glenn');
                        });
                    });
                    context('when first item is highlighted', function() {
                        beforeEach(function() {
                            this.open();
                            this.pressDown();
                        });
                        it('highlights the second', function() {
                            var active = this.pressDown();
                            expect(active).to.have.property('name', 'Miliam');
                        });
                    });
                    context('when last item is highlighted', function() {
                        it('does not change the highlighted item', function() {
                            this.open();
                            this.pressDown();
                            this.pressDown();
                            this.pressDown();
                            var active = this.pressDown();
                            expect(active).to.have.property('name', 'Sigyn');
                        });
                        context('in a filtered list', function() {
                            beforeEach(function() {
                                this.open();
                                // match Glenn and Miliam, not Sigyn.
                                this.filter('l');
                                this.pressDown();
                                this.pressDown();
                            });
                            it('it does not change the highlight', function() {
                                var active = this.pressDown();
                                expect(active).to.have.property('name', 'Miliam');
                            });
                        });
                    });
                    context('after already pressed down a twice and then filtered', function() {
                        beforeEach(function() {
                            this.open();
                            this.pressDown();
                            this.pressDown();
                            // match Glenn and Miliam, not Sigyn.
                            this.filter('l');
                        });
                        it('highlights the first item', function() {
                            var active = this.pressDown();
                            expect(active).to.have.property('name', 'Glenn');
                        });
                    });
                });
                context('when enter', function() {
                    it('prevents default navigation or form posting', function() {
                        this.open();
                        this.pressEnter();
                        expect(this.event.preventDefault).to.have.been.calledOnce;
                    });
                    context('and no item it highlighted', function() {
                        it('does not select any item', function() {
                            scope.change = sinon.stub();
                            this.open();
                            this.pressEnter();
                            expect(scope.change).to.not.have.been.called;
                        });
                    });
                    context('when first item is highlighted', function() {
                        it('selects that item', function() {
                            scope.change = sinon.stub();
                            this.open();
                            this.pressDown();
                            this.pressEnter();
                            expect(scope.change).to.have.been.calledOnce;
                            expect(scope.change.firstCall).to.have.been
                                .calledWith(sinon.match({ name: 'Glenn' }));
                        });
                    });
                });
            });
        });
        context('with initial model value', function() {
            beforeEach(function() {
                scope.items = [
                    { id: 1, name: 'Glenn' },
                    { id: 2, name: 'Miliam' },
                    { id: 3, name: 'Sigyn' }
                ];
                scope.value = scope.items[1];
            });
            it('renders the model value', function() {
                var element = createElement();
                expect(element.querySelector('input')).to.have.value('Miliam');
            });
        });
        context('without initial model value', function() {
            beforeEach(function() {
                scope.items = [
                    { id: 1, name: 'Glenn' }
                ];
                scope.value = null;
            });
            it('render an empty string', function() {
                var element = createElement();
                expect(element.querySelector('input')).to.have.value('');
            });
        });
        context('when clicking first item', function() {
            beforeEach(function() {
                this.click = function(markup) {
                    scope.items = [
                        { id: 1, name: 'Glenn' },
                        { id: 2, name: 'Miliam' },
                        { id: 3, name: 'Sigyn' }
                    ];
                    this.element = createElement(markup);
                    // vs-repeat pads with 1 <li> before
                    this.element.querySelector('li:nth-child(2) a').click();
                    scope.$digest();
                };
            });
            it('updates the model value', function() {
                this.click();
                expect(scope).to.have.property('value', scope.items[0]);
            });
            it('renders the visual string', function() {
                this.click();
                expect(this.element.querySelector('input')).to.have.value('Glenn');
            });
            describe('on-change handler', function() {
                beforeEach(function() {
                    scope.handler = sinon.stub();
                    this.click('<bim-select on-change="handler(selected)" ng-model="value" items="items"></bim-select>');
                });
                it('is invoked', function() {
                    expect(scope.handler).to.have.been.calledOnce;
                });
                it('is invoked with the model value', function() {
                    var glenn = scope.items[0];
                    expect(scope.handler).to.have.been.calledWith(glenn);
                });
            });
        });
        context('when opening, filtering, closing and opening again', function() {
            beforeEach(function() {
                scope.items = [
                    { id: 1, name: 'Glenn' },
                    { id: 2, name: 'Miliam' },
                    { id: 3, name: 'Sigyn' }
                ];
                this.open();
                // 2 and 3 included, 1 is out.
                this.filter('i');
                angular.element(document).trigger('mousedown');
                scope.$digest();
                this.open();
            });
            it('will show all items', function() {
                var lis = [].slice.call(this.element.querySelectorAll('ul>li'), 1, -1);
                var texts = lis.map(function(li) {
                    return li.textContent.trim();
                });
                expect(texts).to.deep.equal(['Glenn', 'Miliam', 'Sigyn']);
            });
        });
        context('when opening, closing and opening and closing again', function() {
            beforeEach(function() {
                this.open();
                angular.element(document).trigger('mousedown');
                scope.$digest();
                this.open();
                angular.element(document).trigger('mousedown');
                scope.$digest();
            });
            it('is is closed', function() {
                expect(this.element.querySelector('.dropdown')).to.not.have.class('open');
            });
        });
        context('when pressing escape and starts typing again', function() {
            beforeEach(function() {
                return this.open();
            });
            beforeEach(function() {
                return this.filter('gle');
            });
            beforeEach(function() {
                this.pressEscape();
                return this.filter('glen');
            });
            beforeEach(function() {
                deps.$timeout.flush();
            });
            it('opens', function() {
                expect(this.element.querySelector('.dropdown')).to.have.class('open');
            });
        });
    });

    describe('controller', function() {
        beforeEach(function() {
            this.element = createElement();
            this.controller = angular.element(this.element).controller('bimSelect');
        });
        describe('init', function() {
            it('sets the min-width of the popup', function() {
                var group = this.element.querySelector('.input-group');
                group.style.width = '400px';
                var ul = this.element.querySelector('ul');
                expect(ul).to.not.have.style('min-width', '400px');

                this.controller.$onInit();
                scope.$digest();

                expect(ul).to.have.style('min-width', '400px');
            });
        });
        describe('.select()', function() {
            beforeEach(function() {
                this.event = {
                    preventDefault: sinon.stub()
                };
                this.controller.select(this.event, { model: {} });
            });
            it('prevents navigation for link clicks', function() {
                expect(this.event.preventDefault).to.have.been.calledOnce;
            });
        });
    });

    function createElement(markup) {
        if (!container) {
            container = document.createElement('div');
            document.body.appendChild(container);
        }

        markup = markup || '<bim-select ng-model="value" items="items" on-change="change(selected)"></bim-select>';
        var elm = deps.$compile(markup)(scope);
        container.appendChild(elm[0]);
        scope.$digest();

        return elm[0];
    };
});
