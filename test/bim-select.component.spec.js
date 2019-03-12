/* eslint-env mocha */
/* global sinon, expect */
const angular = require('angular');

require('../src/bim-select.module.js');

describe('bimSelect', function() {
    let $rootScope;
    let $compile;
    let $templateCache;
    let $timeout;
    let container;
    let styles;
    let scope;
    let config;

    beforeEach(function() {
        config = {};
        angular.mock.module('bim.select', {
            bimSelectConfig: config
        });
        angular.mock.inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $compile = $injector.get('$compile');
            $templateCache = $injector.get('$templateCache');
            $timeout = $injector.get('$timeout');
        });
        scope = $rootScope.$new();
    });
    afterEach(function() {
        container && document.body.removeChild(container);
        container = null;
    });

    describe('component', function() {
        beforeEach(function() {
            this.open = function(preventCreate) {
                if (!preventCreate) {
                    this.element = createElement();
                }

                angular.element(this.element)
                    .find('input')
                    .focus() // Chrome
                    .click(); // FF and IE
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
            };
            this.lis = function() {
                return Array.prototype.slice.call(this.element.querySelectorAll('li'), 1, -1);
            };
            this.press = function(which) {
                this.event = angular.element.Event('keydown', {
                    which
                });
                sinon.spy(this.event, 'preventDefault');

                angular
                    .element(this.element)
                    .find('input')
                    .trigger(this.event);

                scope.$digest();

                const li = this.element.querySelector('li.active');
                const lis = [].slice.call(this.element.querySelectorAll('li'), 1, -1);
                const index = lis.indexOf(li);

                if (index === -1) {
                    return null;
                }

                const active = angular.element(li.parentNode).scope().$ctrl.matches[index];
                return active.model;
            };
            this.texts = function() {
                return this.lis().map(function(li) {
                    return li.textContent.trim();
                });
            };

            this.pressUp = function() { return this.press(38); };
            this.pressDown = function() { return this.press(40); };
            this.pressEnter = function() { return this.press(13); };
            this.pressEscape = function() { return this.press(27); };
        });
        it('renders the items in the list', function() {
            scope.items = [
                { id: 1, text: 'Glenn' },
                { id: 2, text: 'Miliam' }
            ];
            const element = createElement('<bim-select ng-model="value" items="items"></bim-select>');
            // vs-repeat pads with 2. so 4 instead of 2.
            expect(element.querySelectorAll('ul>li')).to.have.length(4);
        });
        it('uses virtual scroll on the list', function() {
            const element = createElement('<bim-select ng-model="value"></bim-select>');
            expect(element.querySelector('ul')).to.have.attribute('vs-repeat');
        });
        it('does not modify the item object', function() {
            scope.items = [Object.freeze({ id: 1, text: 'Glenn' })];
            expect(function() {
                createElement();
            }).to.not.throw();
        });
        it('filters case insensitive', function() {
            scope.items = [
                { id: 1, text: 'Glenn' }
            ];
            this.element = createElement();
            this.filter('g');
            expect(this.texts()).to.deep.equal(['Glenn']);
        });
        context('when clicking the arrow', function() {
            beforeEach(function() {
                this.element = createElement();
                this.click = function() {
                    angular.element(this.element)
                        .find('.bim-select--toggle')
                        .triggerHandler('click');
                    scope.$digest();
                };
            });
            it('opens the popup', function() {
                this.click();
                expect(this.element.querySelector('.dropdown')).to.have.class('open');
            });
            it('toggles', function() {
                this.click();
                this.click();
                expect(this.element.querySelector('.dropdown')).to.not.have.class('open');
            });
            it('set focus to the input', function() {
                const input = this.element.querySelector('input');
                this.click();
                expect(document.activeElement).to.equal(input);
            });
            it('clears the input text', function() {
                scope.items = [{ id: 'id', text: 'Glenn' }];
                scope.value = scope.items[0];
                this.click();
                expect(this.element.querySelector('input')).to.be.empty;
            });
            context('with a preselected value', function() {
                beforeEach(function() {
                    scope.items = [
                        { id: 1, text: 'Glenn' },
                        { id: 2, text: 'Miliam' },
                        { id: 3, text: 'Sigyn' }
                    ];
                    scope.value = scope.items[0];
                    this.element = createElement();
                });
                it('renders all items', function() {
                    this.click();
                    expect(this.lis()).to.have.length(3);
                });
            });
        });
        context('when items are updated', function() {
            beforeEach(function() {
                scope.items = [
                    { id: 1, text: 'Glenn' },
                    { id: 2, text: 'Miliam' },
                    { id: 3, text: 'Sigyn' }
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
                this.open();
            });
            it('shows a message to the user', function() {
                // Get first real match.
                const li = this.element.querySelector('li:nth-child(2)');
                expect(li).to.contain.text('No options');
            });
            context('when user clicks the message', function() {
                beforeEach(function() {
                    this.element.querySelector('li:nth-child(2) .bim-select-item').click();
                    scope.$digest();
                });
                it('does not allow user to select the message item', function() {
                    expect(scope.change).to.not.have.been.called;
                });
                it('does not render any text value', function() {
                    expect(this.element.querySelector('input')).to.have.property('value', '');
                });
            });
            it('does not allow the user to highlight the message item', function() {
                const active = this.pressDown();
                expect(active).to.be.null;
            });
        });
        context('when filtered list is empty', function() {
            beforeEach(function() {
                scope.items = [{ id: 1, text: 'Glenn' }];
                this.open();
                this.filter('Miliam');
            });
            it('shows a message to the user', function() {
                // Get first real match.
                const li = this.element.querySelectorAll('li')[1];
                expect(li).to.contain.text('No matches');
            });
        });
        context('when focus on the input', function() {
            it('opens the dropdown', function() {
                this.open();
                const dropdown = this.element.querySelector('.dropdown');
                expect(dropdown).to.have.class('open');
            });
            it('force vs-repeat to rerender', function() {
                // And we need to do it when the DOM has rendered ($timeout) so vs-repeat
                // can calculate the height.
                const spy = sinon.spy();
                this.open();
                const $element = angular.element(this.element);
                $element.find('[vs-repeat]').scope().$on('vsRepeatResize', spy);
                $timeout.flush();
                expect(spy).to.have.been.calledOnce;
            });
            context('with a selected value', function() {
                beforeEach(function() {
                    scope.items = [
                        { id: 1, text: 'Glenn' },
                        { id: 2, text: 'Sigyn' }
                    ];
                    scope.value = scope.items[0];
                    this.open();
                });
                it('empties the input field', function() {
                    const input = this.element.querySelector('input');
                    expect(input).to.have.value('');
                });
                context('when leaving the dirty input field', function() {
                    beforeEach(function() {
                        this.filter('sig');
                        angular.element(document).trigger('mousedown');
                        scope.$digest();
                    });
                    it('closes the dropdown', function() {
                        expect(this.element.querySelector('.dropdown'))
                            .to.not.have.class('open');
                    });
                    it('shows the selected model text', function() {
                        expect(this.element.querySelector('input'))
                            .to.have.value(scope.value.text);
                    });
                });
                context('when pressing escape', function() {
                    beforeEach(function() {
                        this.open();
                        this.pressEscape();
                    });
                    it('closes the dropdown', function() {
                        expect(this.element.querySelector('.dropdown'))
                            .to.not.have.class('open');
                    });
                    it('shows the selected model text', function() {
                        expect(this.element.querySelector('input'))
                            .to.have.value(scope.value.text);
                    });
                });
            });
            context('when key pressed is', function() {
                beforeEach(function() {
                    scope.items = [
                        { id: 1, text: 'Glenn' },
                        { id: 2, text: 'Miliam' },
                        { id: 3, text: 'Sigyn' }
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
                            const active = this.pressUp();
                            expect(active).to.be.null;
                        });
                    });
                    context('when first item is highlighted', function() {
                        beforeEach(function() {
                            this.open();
                            this.pressDown();
                        });
                        it('does not change the highlighted item', function() {
                            const active = this.pressUp();
                            expect(active).to.have.property('text', 'Glenn');
                        });
                    });
                    context('when second item is highlighted', function() {
                        beforeEach(function() {
                            this.open();
                            this.pressDown();
                            this.pressDown();
                        });
                        it('highlights the first item', function() {
                            const active = this.pressUp();
                            expect(active).to.have.property('text', 'Glenn');
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
                            const active = this.pressDown();
                            expect(active).to.have.property('text', 'Glenn');
                        });
                    });
                    context('when first item is highlighted', function() {
                        beforeEach(function() {
                            this.open();
                            this.pressDown();
                        });
                        it('highlights the second', function() {
                            const active = this.pressDown();
                            expect(active).to.have.property('text', 'Miliam');
                        });
                    });
                    context('when last item is highlighted', function() {
                        it('does not change the highlighted item', function() {
                            this.open();
                            this.pressDown();
                            this.pressDown();
                            this.pressDown();
                            const active = this.pressDown();
                            expect(active).to.have.property('text', 'Sigyn');
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
                                const active = this.pressDown();
                                expect(active).to.have.property('text', 'Miliam');
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
                            const active = this.pressDown();
                            expect(active).to.have.property('text', 'Glenn');
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
                                .calledWith(sinon.match({ text: 'Glenn' }));
                        });
                    });
                });
            });
        });
        context('with scrolling items', function() {
            beforeEach(function() {
                scope.items = new Array(500).map(function(_item, index) {
                    return {
                        id: index,
                        text: `Item ${index + 1}`
                    };
                });
                this.open();
            });
            context('when scrolled down', function() {
                beforeEach(function() {
                    this.element.querySelector('ul').scrollTop = 200;
                });
                context('when narrowing search', function() {
                    beforeEach(function() {
                        this.filter('I'); // filter that still has a scrollbar
                    });
                    it('resets the scrolling', function() {
                        expect(this.element.querySelector('ul'))
                            .to.have.property('scrollTop', 0);
                    });
                });
                context('when closing and opening again', function() {
                    beforeEach(function() {
                        angular.element(document).trigger('mousedown');
                        this.open();
                    });
                    it('resets the activeIndex', function() {
                        const controller = angular.element(this.element).controller('bimSelect');
                        expect(controller).to.have.property('activeIndex', -1);
                    });
                    it('resets the scrolling', function() {
                        expect(this.element.querySelector('ul')).to.have.property('scrollTop', 0);
                    });
                });
            });
            context('when arrowing to highlight an item outside of the scroll area', function() {
                beforeEach(function(done) {
                    for (let i = 0; i < 15; i++) {
                        this.pressDown();
                        $timeout.flush();
                    }
                    done();
                });
                it.skip('should be visible', function() {
                    // Skipped since it does not scroll down.
                    // TODO: Somewhere there is a hold up in the testing,
                    // implementation works it seems.
                    const ul = this.element.querySelector('ul');
                    const li = this.element.querySelector('li.active');

                    expect(li).to.contain.text('15');
                    expect(li.offsetTop).to.be.greater.than(ul.scrollTop);
                });
            });
        });
        context('with initial model value', function() {
            beforeEach(function() {
                scope.items = [
                    { id: 1, text: 'Glenn' },
                    { id: 2, text: 'Miliam' },
                    { id: 3, text: 'Sigyn' }
                ];
                scope.value = scope.items[1];
            });
            it('renders the model value', function() {
                const element = createElement();
                expect(element.querySelector('input')).to.have.value('Miliam');
            });
        });
        context('with initial model value of', function() {
            beforeEach(function() {
                scope.items = [
                    { id: 1, text: 'Glenn' }
                ];
                scope.value = null;
            });
            it('null render an empty control', function() {
                scope.value = null;
                const element = createElement();
                expect(element.querySelector('input')).to.have.value('');
            });
            it('undefined render an empty control', function() {
                scope.value = undefined;
                const element = createElement();
                expect(element.querySelector('input')).to.have.value('');
            });
        });
        context('when clicking first item', function() {
            beforeEach(function() {
                this.click = function(markup) {
                    scope.items = [
                        { id: 1, text: 'Glenn' },
                        { id: 2, text: 'Miliam' },
                        { id: 3, text: 'Sigyn' }
                    ];
                    this.element = createElement(markup);
                    // vs-repeat pads with 1 <li> before
                    this.element.querySelector('li:nth-child(2) .bim-select-item').click();
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
                    const glenn = scope.items[0];
                    expect(scope.handler).to.have.been.calledWith(glenn);
                });
            });
        });
        context('when opening, filtering, closing and opening again', function() {
            beforeEach(function() {
                scope.items = [
                    { id: 1, text: 'Glenn' },
                    { id: 2, text: 'Miliam' },
                    { id: 3, text: 'Sigyn' }
                ];
                this.open();
                // 2 and 3 included, 1 is out.
                this.filter('i');
                angular.element(document).trigger('mousedown');
                scope.$digest();
                this.open();
            });
            it('will show all items', function() {
                const lis = [].slice.call(this.element.querySelectorAll('li'), 1, -1);
                const texts = lis.map(function(li) {
                    return li.textContent.trim();
                });
                expect(texts).to.deep.equal(['Glenn', 'Miliam', 'Sigyn']);
            });
        });
        context('when opening, closing, resizing and opening again', function() {
            beforeEach(function() {
                this.open();
                const group = this.element.querySelector('.input-group');
                group.style.width = '400px';

                angular.element(document).trigger('mousedown');
                scope.$digest();

                group.style.width = '600px';
            });
            it('is correctly sized', function() {
                const ul = this.element.querySelector('ul');
                expect(ul).to.not.have.style('width', '600px');

                this.open(true);

                expect(ul).to.have.style('width', '600px');
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
                this.open();
                this.filter('gle');
                this.pressEscape();
                this.filter('glen');
                $timeout.flush();
            });
            it('opens', function() {
                expect(this.element.querySelector('.dropdown')).to.have.class('open');
            });
        });
        context('with an adapter', function() {
            it('allows for any data structure', function() {
                scope.items = [
                    { birthday: new Date(2017, 3, 1), name: 'April fool' },
                    { birthday: new Date(2016, 11, 24), name: 'Mr Claus' },
                    { birthday: new Date(1977, 3, 13), name: 'Glenn Jorde' }
                ];
                scope.adapter = function(item) {
                    return {
                        id: item.birthday.getFullYear(),
                        text: item.name.substr(0, 1)
                    };
                };
                this.open();
                expect(this.texts()).to.deep.equal(['A', 'M', 'G']);
            });
            it('uses the adapter to set the input field value', function() {
                scope.items = [{ id: 1, name: 'Glenn' }];
                scope.adapter = function(item) {
                    return {
                        id: item.id,
                        text: item.name
                    };
                };
                this.open();
                this.pressDown();
                this.pressEnter();
                expect(this.element.querySelector('input')).to.have.value('Glenn');
            });
            context('validates the adapted item', function() {
                beforeEach(function() {
                    scope.items = [{}];
                });
                it('for a text property', function() {
                    scope.adapter = function() {
                        return { id: 1 };
                    };
                    expect(function() {
                        this.open();
                    }.bind(this)).to.throw(/text/);
                });
                it('to allow string ids', function() {
                    scope.adapter = function() {
                        return { id: '1', text: 'Glenn' };
                    };
                    expect(function() {
                        this.open();
                    }.bind(this)).to.not.throw();
                });
                it('to allow numeric ids', function() {
                    scope.adapter = function() {
                        return { id: 1, text: 'Glenn' };
                    };
                    expect(function() {
                        this.open();
                    }.bind(this)).to.not.throw();
                });
                it('to disallow date ids', function() {
                    scope.adapter = function() {
                        return { id: new Date(), text: 'Glenn' };
                    };
                    expect(function() {
                        this.open();
                    }.bind(this)).to.throw(/id/);
                });
            });
        });
        context('with a custom item template', function() {
            beforeEach(function() {
                scope.items = [
                    { id: 4, text: 'Glenn' },
                    { id: 5, text: 'Miliam' }
                ];
            });
            it('uses it', function() {
                scope.itemTemplateUrl = 'item.html';
                $templateCache.put('item.html', '<custom>{{ item.text }}</custom>');

                const element = createElement();

                expect(element.querySelectorAll('li custom')).to.have.length(2);
            });
            context('when set in defaults', function() {
                beforeEach(function() {
                    $templateCache.put('default.html', '<strong>{{ item.text }}</strong>');
                    config.itemTemplateUrl = 'default.html';
                });
                it('is used', function() {
                    const element = createElement();
                    expect(element.querySelector('li strong')).to.exist;
                });
            });
        });
        context('when required is not set', function() {
            beforeEach(function() {
                scope.items = [{ id: 1, text: '1' }];
                scope.value = scope.items[0];
                this.element = createElement();
            });
            it('has a clear button', function() {
                expect(this.element.querySelector('.bim-select--clear')).to.exist;
            });
        });
        context('when required', function() {
            beforeEach(function() {
                scope.items = [{ id: 1, text: '1' }];
                scope.value = scope.items[0];
                /* eslint-disable no-multi-str */
                this.element = createElement('\
                    <bim-select class="bim-select-spec" \
                        ng-model="value" \
                        items="items" \
                        ng-required="required" \
                    ></bim-select>');
                /* eslint-enable no-multi-str */
            });
            context('is true', function() {
                beforeEach(function() {
                    scope.required = true;
                    scope.$digest();
                });
                it('has no clear button', function() {
                    expect(this.element.querySelector('.bim-select--clear')).to.not.exist;
                });
            });
            context('is false', function() {
                beforeEach(function() {
                    scope.required = false;
                    scope.$digest();
                });
                it('has a clear button', function() {
                    expect(this.element.querySelector('.bim-select--clear')).to.exist;
                });
            });
        });
        context('when clicking clear', function() {
            beforeEach(function() {
                scope.items = [{ text: 'glenn', id: 1 }];
                scope.change = sinon.stub();
                scope.value = scope.items[0];
                this.open();
                this.element.querySelector('.bim-select--clear').click();
                scope.$digest();
            });
            it('clears the model', function() {
                expect(scope.value).to.be.null;
            });
            it('triggers an on-change handler', function() {
                expect(scope.change).to.have.been.calledWith(null);
            });
            it('closes the list', function() {
                expect(this.element.querySelector('.dropdown')).to.not.have.class('open');
            });
            it('clears the text', function() {
                expect(this.element.querySelector('input')).to.have.value('');
            });
            it('removes the clear button', function() {
                expect(this.element.querySelector('.bim-select--clear')).to.not.exist;
            });
        });
        context('when disabled', function() {
            beforeEach(function() {
                scope.items = [{ id: 1, text: '1' }];
                scope.value = scope.items[0];
                /* eslint-disable no-multi-str */
                this.element = createElement('\
                    <bim-select class="bim-select-spec" \
                        ng-disabled="disabled" \
                        ng-model="value" \
                        items="items" \
                    ></bim-select>');
                /* eslint-enable no-multi-str */
            });
            context('is true', function() {
                beforeEach(function() {
                    scope.disabled = true;
                    scope.$digest();
                });
                it('the input is disabled', function() {
                    expect(this.element.querySelector('input')).to.have.property('disabled', true);
                });
                it('the clear button is removed', function() {
                    scope.$digest();
                    expect(this.element.querySelector('.bim-select--clear')).to.not.exist;
                });
                it('the toggler is disabled', function() {
                    expect(this.element.querySelector('.bim-select--toggle'))
                        .to.have.property('disabled', true);
                });
            });
            context('is false', function() {
                beforeEach(function() {
                    scope.disabled = false;
                    scope.$digest();
                });
                it('the input is enabled', function() {
                    expect(this.element.querySelector('input'))
                        .to.have.property('disabled', false);
                });
                it('the clear button is enabled', function() {
                    expect(this.element.querySelector('.bim-select--clear'))
                        .to.have.property('disabled', false);
                });
                it('the toggler is enabled', function() {
                    expect(this.element.querySelector('.bim-select--toggle'))
                        .to.have.property('disabled', false);
                });
            });
        });
        describe('diacritics', function() {
            beforeEach(function() {
                scope.items = [
                    { id: 1, text: 'Glenn' },
                    { id: 2, text: 'Miliam' },
                    { id: 3, text: 'Sigün' }
                ];
                this.markup = '<bim-select class="bim-select-spec" \
                                      ng-model="value" \
                                      items="items" \
                                      diacritics="diacritics" \
                            ></bim-select>';
            });
            context('when not specified', function() {
                beforeEach(function() {
                    this.element = createElement(this.markup);
                });
                it('only finds exact matches', function() {
                    this.filter('u');
                    expect(this.texts()).to.deep.equal(['No matches']);

                    this.filter('ü');
                    expect(this.texts()).to.deep.equal(['Sigün']);
                });
            });
            context('when set in defaults', function() {
                beforeEach(function() {
                    config.diacritics = 'strip';
                });
                it('finds items with diacritics', function() {
                    const markup = '<bim-select class="bim-select-spec" \
                                      ng-model="value" \
                                      items="items" \
                            ></bim-select>';
                    this.element = createElement(markup);
                    this.filter('u');
                    expect(this.texts()).to.deep.equal(['Sigün']);
                });
                it('allows local override', function() {
                    scope.diacritics = null;
                    this.element = createElement(this.markup);
                    this.filter('u');
                    expect(this.texts()).to.deep.equal(['No matches']);
                });
            });
            context('when "strip"', function() {
                beforeEach(function() {
                    scope.diacritics = 'strip';
                    this.element = createElement(this.markup);
                });
                it('finds items with diacritics', function() {
                    this.filter('u');
                    expect(this.texts()).to.deep.equal(['Sigün']);
                });
                it('finds items without diacritics', function() {
                    this.filter('ë');
                    expect(this.texts()).to.deep.equal(['Glenn']);
                });
                context('when in an env not supporting unicode normalization', function() {
                    beforeEach(function() {
                        this.original = String.prototype.normalize;
                        delete String.prototype.normalize;
                    });
                    afterEach(function() {
                        // Restore native function
                        String.prototype.normalize = this.original;
                    });
                    it('finds items using simple diacritics', function() {
                        scope.items = 'üéèåäöæø'.split('').map(function(letter, index) {
                            return { text: letter, id: index+1 };
                        });

                        this.filter('u');
                        expect(this.texts()).to.deep.equal(['ü']);

                        this.filter('o');
                        expect(this.texts()).to.deep.equal(['ö', 'ø']);

                        this.filter('e');
                        expect(this.texts()).to.deep.equal(['é', 'è']);

                        this.filter('a');
                        expect(this.texts()).to.deep.equal(['å', 'ä']);
                    });
                });
            });
        });
        describe('placeholder', function() {
            context('when not specified', function() {
                it('uses the default', function() {
                    const element = createElement();
                    expect(element.querySelector('input')).to.have.property('placeholder', 'No selection');
                });
            });
            context('when specified locally', function() {
                it('is used', function() {
                    const element = createElement('\
                        <bim-select class="bim-select-spec" \
                            ng-model="value" \
                            placeholder="My string" \
                            items="items" \
                        ></bim-select>');
                    expect(element.querySelector('input')).to.have.property('placeholder', 'My string');
                });
            });
            context('when set in defaults', function() {
                beforeEach(function() {
                    config.placeholder = 'Default';
                });
                it('is used', function() {
                    const element = createElement(`
                        <bim-select class="bim-select-spec"
                            ng-model="value"
                            items="items"
                        ></bim-select>`);
                    expect(element.querySelector('input')).to.have.property('placeholder', 'Default');
                });
                it('allows local override', function() {
                    const element = createElement(`
                        <bim-select class="bim-select-spec"
                            ng-model="value"
                            placeholder="Local"
                            items="items"
                        ></bim-select>`);
                    expect(element.querySelector('input')).to.have.property('placeholder', 'Local');
                });
            });
        });
        describe('custom sorter', function() {
            beforeEach(function() {
                scope.items = [
                    { id: 1, text: 'aa' },
                    { id: 2, text: 'ab' }
                ];
            });
            it('allows custom sorting', function() {
                scope.sorter = function(a, b) {
                    return -a.text.localeCompare(b.text);
                }
                this.element = createElement();
                this.filter('a');
                expect(this.texts()).to.deep.equal(['ab', 'aa']);
            });
            it('does not sort the full list', function() {
                scope.sorter = sinon.stub();
                this.element = createElement();
                // no invoke of this.filter here, so full list.
                expect(scope.sorter).has.not.been.called;
            });
            it('allows usage of the query string', function() {
                scope.sorter = sinon.stub();
                this.element = createElement();
                this.filter('a');
                expect(scope.sorter).has.been.calledWith(sinon.match.any, sinon.match.any, 'a');
            });
            context('when set in defaults', function() {
                beforeEach(function() {
                    scope.items = [
                        { id: 1, text: 'ba' },
                        { id: 2, text: 'ab' }
                    ];
                    // Sort from first letter
                    config.sorter = (a, b) => a.text.localeCompare(b.text);
                });
                it('is used', function() {
                    this.element = createElement(`
                        <bim-select class="bim-select-spec"
                                    ng-model="value"
                                    items="items"
                                ></bim-select>`);
                    this.filter('a');
                    expect(this.texts()).to.deep.equal(['ab', 'ba']);
                });
                it('allows local override', function() {
                    // Sort from 2nd letter
                    scope.sorter = (a, b) => a.text.substr(1).localeCompare(b.text.substr(1));
                    this.element = createElement();
                    this.filter('a');
                    expect(this.texts()).to.deep.equal(['ba', 'ab']);
                });
            });
        });
        describe('selected item template', function() {
            beforeEach(function() {
                scope.items = [
                    { id: 1, text: 'Switzerland' },
                    { id: 2, text: 'Sweden', visibility: 'Hidden'}
                ];
                scope.value = scope.items[1];
                scope.itemTemplateUrl = 'item.html';
                $templateCache.put('item.html',
                    `<span>
                        {{ item.text }}
                        <i ng-if="item.model.visibility === 'Hidden'" class="fa fa-lock fa-fw" title=""></i
                    </span>`
                );
                scope.selectedItemTemplateUrl = 'selected-item.html';
                $templateCache.put('selected-item.html',
                    `<span>This is the selected item template</span>`
                );
                this.element = createElement(`
                    <bim-select class="bim-select-spec"
                                item-template-url="itemTemplateUrl"
                                ng-model="value"
                                items="items"
                            ></bim-select>`);
            });
            it('displays the selected text', function() {
                expect(this.element.querySelector('.bim-select-selected-item'))
                .to.contain.text('Sweden');
            });
            it('displays the lock icon in the template', function() {
                expect(this.element.querySelector('.bim-select-selected-item i.fa-lock'))
                .to.exist;
            });
            it('displays the input when focused', function() {
                this.open(true);
                expect(this.element.querySelector('.bim-select-input')).to.have.class('is-displayed');
            });
            it('selected item input does not exist when the input is displayed', function() {
                this.open(true);
                expect(this.element.querySelector('.bim-select-selected-item')).to.not.exist;
            });
            it('the selected item template overrides the item template', function() {
                this.element = createElement(`
                    <bim-select class="bim-select-spec"
                                item-template-url="itemTemplateUrl"
                                selected-item-template-url="selectedItemTemplateUrl"
                                ng-model="value"
                                items="items"
                            ></bim-select>`);
                expect(this.element.querySelector('.bim-select-selected-item'))
                .to.contain.text('This is the selected item template');
            });
            it('the selected item config template overrides the item template', function() {
                $templateCache.put('config-selected-item.html', '<span>Selected item config template</span>');
                config.selectedItemTemplateUrl = 'config-selected-item.html';
                this.element = createElement(`
                    <bim-select class="bim-select-spec"
                                item-template-url="itemTemplateUrl"
                                ng-model="value"
                                items="items"
                            ></bim-select>`);
                expect(this.element.querySelector('.bim-select-selected-item'))
                .to.contain.text('Selected item config template');
            });
            context('when disabled', function() {
                beforeEach(function() {
                    this.element = createElement(`
                        <bim-select class="bim-select-spec"
                                    item-template-url="itemTemplateUrl"
                                    ng-model="value"
                                    items="items"
                                    ng-disabled="true"
                                ></bim-select>`);
                });
                it('should not display input field when model has a value', function() {
                    expect(this.element.querySelector('.bim-select-input')).to.not.have.class('is-displayed');
                });
                it('should not display input field when model has a value even after opening', function() {
                    this.open(true);
                    expect(this.element.querySelector('.bim-select-input')).to.not.have.class('is-displayed');
                });
                it('should display input field when model does not have a value', function() {
                    scope.value = null;
                    scope.$digest();
                    expect(this.element.querySelector('.bim-select-input')).to.have.class('is-displayed');
                });
                it('selected input template container should also be disabled', function() {
                    expect(this.element.querySelector('.bim-select-selected-item')).to.have.attr('disabled', 'disabled');
                });
            });
        });

        describe('validator', function() {
            beforeEach(function() {
                scope.items = [
                    { id: 1, text: 'Publish' },
                    { id: 2, text: 'Unpublish' }
                ];
                scope.value = scope.items[0];
            });
            it('is invalid when not allowed to publish', function() {
                const isAllowedToPublish = false;
                scope.validator = function(item) {
                    if (item) {
                        if (item.text === 'Publish') {
                            return isAllowedToPublish;
                        }
                    }
                    return true;
                };
                this.element = createElement(`
                    <bim-select class="bim-select-spec"
                                ng-model="value"
                                items="items"
                                validator="validator"
                            ></bim-select>`);
                scope.$digest();
                expect(this.element).to.have.class('ng-invalid');
            });
            it('is not invalid when allowed to publish', function() {
                const isAllowedToPublish = true;
                scope.validator = function(item) {
                    if (item) {
                        if (item.text === 'Publish') {
                            return isAllowedToPublish;
                        }
                    }
                    return true;
                };
                this.element = createElement(`
                    <bim-select class="bim-select-spec"
                                ng-model="value"
                                items="items"
                                validator="validator"
                            ></bim-select>`);
                scope.$digest();
                expect(this.element).to.not.have.class('ng-invalid');
            });
        });
        describe('when disabling elements', function() {
            beforeEach(function() {
                scope.items = [
                    { id: 1, text: 'Published', isDisabled: true },
                    { id: 2, text: 'Unublished', isDisabled: false },
                    { id: 3, text: 'Archived' }
                ];
            });
            it('it has is-disabled class if isDisabled set to true', function() {
                this.element = createElement(`<bim-select items="items" ng-model="value"></bim-select>`);
                scope.$digest();
                expect(this.element.querySelector('ul>li:nth-child(2)')).to.have.class('is-disabled');
            });
            it('it does not have is-disabled class if isDisabled set to false', function() {
                this.element = createElement(`<bim-select items="items" ng-model="value"></bim-select>`);
                scope.$digest();
                expect(this.element.querySelector('ul>li:nth-child(3)')).to.not.have.class('is-disabled');
            });
            it('does not have is-disabled class if isDisabled is not defined', function() {
                this.element = createElement(`<bim-select items="items" ng-model="value"></bim-select>`);
                scope.$digest();
                expect(this.element.querySelector('ul>li:nth-child(4)')).to.not.have.class('is-disabled');
            });

        });
    });

    describe('controller', function() {
        beforeEach(function() {
            this.element = createElement();
            this.controller = angular.element(this.element).controller('bimSelect');
        });
        describe('init', function() {
            it('sets the width of the popup', function() {
                const group = this.element.querySelector('.input-group');
                group.style.width = '400px';
                const ul = this.element.querySelector('ul');
                expect(ul).to.not.have.style('width', '400px');

                this.controller.$onInit();
                scope.$digest();

                expect(ul).to.have.style('width', '400px');
            });
        });
        describe('.select()', function() {
            beforeEach(function() {
                this.event = {
                    preventDefault: sinon.stub()
                };
                this.controller.select(this.event, { model: {text: 'Eric', id: 777} });
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
        if (!styles) {
            styles = document.createElement('style');
            /* eslint-disable no-multi-str */
            styles.innerHTML = '\
                .bim-select-spec .input-group { width: 100px; }\
                .bim-select-spec ul { overflow: auto; height: 100px; outline: 1px solid red; margin: 0; padding: 1px; list-style: none; }\
                .bim-select-spec li.active { outline: 1px solid green; }\
                ';
            /* eslint-enable no-multi-str */
            document.body.appendChild(styles);
        }

        /* eslint-disable no-multi-str */
        markup = markup || '<bim-select class="bim-select-spec" \
                                        ng-model="value" \
                                        items="items" \
                                        on-change="change(selected)" \
                                        item-template-url="itemTemplateUrl" \
                                        adapter="adapter" \
                                        sorter="sorter" \
                            ></bim-select>';
        /* eslint-enable no-multi-str */
        const elm = $compile(markup)(scope);
        container.appendChild(elm[0]);
        scope.$digest();

        return elm[0];
    };
});
