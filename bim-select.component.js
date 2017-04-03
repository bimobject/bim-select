(function() {
    'use strict';

    /**
     * A combo box/searchable dropdown list with support for millions of
     * items. It is using a virtual scroll to handle the amount of items.
     * It works just as fine with a smaller amount of items.
     *
     * @param {Expression<Array<?>>} items
     *   An angular expression that evaluates to an array of items in it that
     *   should be available to select from in the list by the user.
     *
     *   Each item should have a `name` property that will be used as the
     *   text representing the item in the dropdown.
     * @param {Expression} ngModel
     *   Should evaluate to a property that will contain the currently
     *   selected item in the `items` array.
     * @param {Expression<Function>>} [onChange]
     *   A function that will be notified when the user selects a new item
     *   in the list. Use `selected` in the expression to get hold of the
     *   selected item. The value of `selected` will be the value in the
     *   `items` array that was selected by the user.
     * @param {Expression<Function>>} [adapter]
     *   If each object in `items` does not have a `text` and `id` property
     *   you can use an adapter to transform each item into an object bimSelect
     *   can work with.
     *
     *   This function is invoked once for each item in the `items` list and must
     *   return an object with a `text` (string) and an `id` (string, numeric)
     *   property.
     * @param {Expression<String>>} [itemTemplateUrl]
     *   If you need to specify your own template to be rendered for each match
     *   in the list, set the url to the template here. `match` is available on
     *   the scope and is an object with `id`, `text` and `model` property, and
     *   the `model` property has the item in the `items` array as a value.
     *
     * @example
     * Simple example
     *
     * ```html
     * <bim-select items="vm.items"
     *             ng-model="vm.selected"
     *             on-change="vm.update({ item: selected })">
     * ```
     *
     * @example
     * When using an adapter
     *
     * ```js
     * vm.items = [
     *   { age: 19, name: 'Nineteen' },
     *   { age: 20, name: 'Twenty' }
     * ];
     * vm.adapter = function(item) {
     *   // Convert to a text/id object
     *   return {
     *     id: item.age,
     *     text: item.name
     *   };
     * }
     * ```
     * ```html
     * <bim-select items="vm.items"
     *             ng-model="vm.selected"
     *             adapter="vm.adapter">
     * ```
     *
     * @example
     * Custom template where the text should be "encrypted".
     *
     * ```html
     * <script type="text/ng-template" id="item.html">
     *   <span class="bim-select-item">{{ match.text | rot13 }}</span>
     * </script>
     *
     * <bim-select items="vm.items"
     *             ng-model="vm.selected"
     *             item-template-url="'item.html'"></bim-select>
     */
    angular.module('app.widgets').component('bimSelect', {
        bindings: {
            items: '<',
            onChange: '&',
            adapter: '<',
            itemTemplateUrl: '<'
        },
        require: {
            model: 'ngModel'
        },
        templateUrl: '/src/client/app/widgets/bim-select/bim-select.template.html',
        controller: BimSelectController
    });

    BimSelectController.$inject = ['$document', '$element', '$timeout', '$scope'];

    function BimSelectController($document, $element, $timeout, $scope) {
        var $ctrl = this;
        var open;
        var currentJoinedInternalIds = null;
        var defaultItemTemplateUrl = '/src/client/app/widgets/bim-select/bim-select-item.template.html';

        var Keys = {
            Escape: 27,
            Up: 38,
            Down: 40,
            Enter: 13
        };

        $ctrl.internalItems = [];
        $ctrl.itemTemplateUrl = $ctrl.itemTemplateUrl || defaultItemTemplateUrl;

        $scope.$on('$destroy', function() {
            $document.off('mousedown touchstart pointerdown', outsideClick);
        });

        // OFFICIAL METHODS

        $ctrl.$onInit = function() {
            renderSelection();
            $ctrl.model.$render = renderSelection;
            $ctrl.adapter = $ctrl.adapter || function(item) {
                return {
                    text: item.text,
                    id: item.id
                };
            };
            setWidth();
        };

        $ctrl.$doCheck = function() {
            var adaptedItems = adaptItems();
            var ids = adaptedItems.map(function(item) { return item.id; }).join('$');

            if (ids !== currentJoinedInternalIds) {
                currentJoinedInternalIds = ids;
                $ctrl.internalItems = adaptedItems;
                updateMatches();
                return;
            }
        };

        // TEMPLATE METHODS

        $ctrl.activateHandler = function(event) {
            event.stopPropagation();
            $ctrl.inputValue = '';
            open();
        };

        $ctrl.close = function() {
            $document.off('mousedown touchstart pointerdown', outsideClick);
            $ctrl.active = false;
            renderSelection();
        };

        $ctrl.select = function(event, match) {
            event && event.preventDefault();
            if (match.id !== 'bim-select-message') {
                setSelection(match);
                $ctrl.onChange({ selected: match.model });
                $ctrl.close();
            }
        };

        $ctrl.keydownHandler = function(event) {
            if (event.which === Keys.Escape) {
                $ctrl.close();
            }

            if (event.which === Keys.Down) {
                event.preventDefault();
                var newIndex = Math.min(
                    $ctrl.activeIndex + 1,
                    $ctrl.matches.length - 1
                );
                if ($ctrl.matches[newIndex].id !== 'bim-select-message') {
                    $ctrl.activeIndex = newIndex;
                }
            }

            if (event.which === Keys.Up) {
                event.preventDefault();
                if ($ctrl.activeIndex > -1) {
                    $ctrl.activeIndex = Math.max($ctrl.activeIndex - 1, 0);
                }
            }

            if (event.which === Keys.Enter) {
                event.preventDefault();
                if ($ctrl.activeIndex >= 0) {
                    var item = $ctrl.matches[$ctrl.activeIndex];
                    $ctrl.select(null, item);
                }
            }
        };

        $ctrl.inputValueChangeHandler = function() {
            updateMatches();
            if (!$ctrl.active) {
                open();
            }
        };

        // INTERNAL HELPERS

        open = _.debounce(function open() {
            $scope.$apply(function() {
                $document.on('mousedown touchstart pointerdown', outsideClick);
                $ctrl.active = true;
                updateMatches();
            });
            $timeout(function() {
                // Force rerender of virtual scroll. Needed for at least IE11.
                $scope.$broadcast('vsRepeatResize');
            });
        }, 50);

        function updateMatches() {
            $ctrl.activeIndex = -1;
            var query = $ctrl.inputValue || '';
            $ctrl.matches = $ctrl.internalItems.filter(function(item) {
                var text = item.text.toLowerCase();
                return text.indexOf(query.toLowerCase()) >= 0;
            });

            if ($ctrl.inputValue && $ctrl.matches.length === 0) {
                $ctrl.matches.push({
                    id: 'bim-select-message',
                    text: 'No matches'
                });
            } else if ($ctrl.internalItems.length === 0) {
                $ctrl.matches.push({
                    id: 'bim-select-message',
                    text: 'No options'
                });
            }
        }

        function adaptItems() {
            var externalItems = $ctrl.items || [];
            return externalItems.map(function(item) {
                var adapted = $ctrl.adapter(item);
                if (typeof adapted.text !== 'string') {
                    throw new Error('Adapter did not generate an object with a valid text string property');
                }
                if (typeof adapted.id !== 'string' && typeof adapted.id !== 'number') {
                    throw new Error('Adapter did not generate an object with a valid id string or numeric property');
                }
                adapted.model = item;
                return adapted;
            });
        }

        function setWidth() {
            $ctrl.minWidth = $element.find('.input-group').outerWidth();
        }

        function setSelection(match) {
            $ctrl.model.$setViewValue(match.model);
        }

        function renderSelection() {
            $ctrl.inputValue = $ctrl.model.$modelValue && $ctrl.adapter($ctrl.model.$modelValue).text;
        }

        function outsideClick(event) {
            var elm = event.target;
            while (elm && elm !== $element[0]) {
                elm = elm.parentNode;
            }

            if (!elm) {
                // We hit document, and not any element within the directive
                $scope.$apply(function() {
                    $ctrl.close();
                });
            }
        }
    }
}());
