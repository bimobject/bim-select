// .outerWidth requires jQuery.
require('jquery');

require('./bim-select.less');

const templateUrl = require('./bim-select.template.html');
const itemTemplateUrl = require('./bim-select-item.template.html');

exports.name = 'bimSelect';

/**
 * A combo box/searchable dropdown list with support for millions of
 * items. It is using a virtual scroll to handle the amount of items.
 * It works just as fine with a smaller amount of items.
 *
 * Supports [`ngRequired`][ngRequired] and [`ngDisabled`][ngDisabled].
 * Both defaults to false.
 *
 *   [ngRequired]: https://docs.angularjs.org/api/ng/directive/ngRequired
 *   [ngDisabled]: https://docs.angularjs.org/api/ng/directive/ngDisabled
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
 * @param {Expression<String>>} [diacritics]
 *   If set to `'strip'` then all filtering in the dropdown will compare
 *   items using the normalized values stripped of any diacritic marks.
 * @param {Expression<Function>>} [sorter]
 *   It allows the consumer to have a custom order of the matching items.
 *
 *   An expression evaulating to a function reference. This function will
 *   be used as a sorter simliar to the one used when sorting with
 *   `Array.prototype.sort`. Parameters will be `match1`, `match2`, `query`
 *   and the return value should equal that needed for the array sorter.
 *
 *   E.g. if the matches beginning with the search string should be
 *   prioritized, a custom sorter handling this could be added.
 *
 *   Please note: This function is only affects a filtered list.
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
 * When using an custom sorter
 *
 * ```js
 * vm.items = [
 *   { id: 1, name: 'Augustus' },
 *   { id: 3, name: 'Caligula' }
 * ];
 * vm.sorter = function reverse(a, b, query) {
 *     return -a.text.localeCompare(b.text);
 * }
 * ```
 * ```html
 * <bim-select items="vm.items"
 *             ng-model="vm.selected"
 *             sorter="vm.sorter">
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
exports.impl = {
    bindings: {
        adapter: '<',
        diacritics: '<?',
        itemTemplateUrl: '<?',
        items: '<',
        onChange: '&',
        sorter: '<?'
    },
    require: {
        model: 'ngModel'
    },
    templateUrl,
    controller: BimSelectController
};

BimSelectController.$inject = [
    '$document',
    '$element',
    '$timeout',
    '$scope',
    '$attrs',
    'bimSelectConfig'
];

function BimSelectController(
    $document,
    $element,
    $timeout,
    $scope,
    $attrs,
    bimSelectConfig
) {
    const $ctrl = this;
    const defaultItemTemplateUrl = itemTemplateUrl;
    const ul = $element[0].querySelector('ul');

    const Keys = {
        Escape: 27,
        Up: 38,
        Down: 40,
        Enter: 13
    };

    let currentJoinedInternalIds = null;

    $ctrl.internalItems = [];
    $ctrl.defaultPlaceholder = 'No selection';

    $scope.$on('$destroy', function() {
        $document.off('mousedown touchstart pointerdown', outsideClick);
    });

    // ANGULAR METHODS

    $ctrl.$onInit = function() {
        $ctrl.internalItemTemplateUrl = $ctrl.itemTemplateUrl ||
            bimSelectConfig.itemTemplateUrl ||
            defaultItemTemplateUrl;
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
        const adaptedItems = adaptItems();
        const ids = adaptedItems.map(item => item.id).join('$');

        if (ids !== currentJoinedInternalIds) {
            currentJoinedInternalIds = ids;
            $ctrl.internalItems = adaptedItems;
            updateMatches();
        }
    };

    // TEMPLATE METHODS

    $ctrl.activateHandler = function(event) {
        event && event.stopPropagation();
        $ctrl.inputValue = '';

        open();
    };

    $ctrl.toggleHandler = function() {
        if ($ctrl.active) {
            $ctrl.close();
        } else {
            // For some reason the .focus below does not trigger activateHandler
            // when running in a normal browser window, so invoke it manually.
            $ctrl.activateHandler();
            $element.find('input').focus();
        }
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

    $ctrl.clear = function() {
        $ctrl.model.$setViewValue(null);
        $ctrl.onChange({ selected: null });
        $ctrl.close();
    };

    $ctrl.keydownHandler = function(event) {
        if (event.which === Keys.Escape) {
            $ctrl.close();
        }

        if (event.which === Keys.Down) {
            event.preventDefault();
            const newIndex = Math.min(
                $ctrl.activeIndex + 1,
                $ctrl.matches.length - 1
            );
            if ($ctrl.matches[newIndex].id !== 'bim-select-message') {
                $ctrl.activeIndex = newIndex;
                ensureVisibleItem();
            }
        }

        if (event.which === Keys.Up) {
            event.preventDefault();
            if ($ctrl.activeIndex > -1) {
                $ctrl.activeIndex = Math.max($ctrl.activeIndex - 1, 0);
                ensureVisibleItem();
            }
        }

        if (event.which === Keys.Enter) {
            event.preventDefault();
            if ($ctrl.activeIndex >= 0) {
                const item = $ctrl.matches[$ctrl.activeIndex];
                $ctrl.select(null, item);
            }
        }
    };

    $ctrl.inputValueChangeHandler = function() {
        updateMatches();
        ul.scrollTop = 0;
        if (!$ctrl.active) {
            open();
        }
    };

    $ctrl.isRequired = function() {
        return !!$attrs.required;
    };

    $ctrl.isDisabled = function() {
        return !!$attrs.disabled;
    };

    $ctrl.isClearable = function() {
        return $ctrl.model.$modelValue !== undefined &&
            $ctrl.model.$modelValue !== null &&
            !$ctrl.isRequired();
    };

    $ctrl.placeholderText = () => $attrs.placeholder || bimSelectConfig.placeholder || $ctrl.defaultPlaceholder;

    // INTERNAL HELPERS

    function ensureVisibleItem() {
        $timeout(function() {
            const li = ul.querySelector('li.active');

            if (li) {
                const itemHeight = li.clientHeight;
                const listHeight = ul.clientHeight;
                const offsetTop = li.offsetTop;

                // below viewport
                if (offsetTop + itemHeight > ul.scrollTop + listHeight) {
                    ul.scrollTop = offsetTop - listHeight + 2 * itemHeight;
                }
                // above viewport
                if (offsetTop - 5 < ul.scrollTop) {
                    ul.scrollTop = offsetTop - itemHeight;
                }
            }
        });
    }

    function open() {
        if (!$ctrl.active) {
            $ctrl.active = true;
            $document.on('mousedown touchstart pointerdown', outsideClick);
            updateMatches();
            setWidth();
            $timeout(function() {
                // Force rerender of virtual scroll. Needed for at least IE11.
                $scope.$broadcast('vsRepeatResize');
            });
        }
    };

    function updateMatches() {
        $ctrl.activeIndex = -1;
        const query = $ctrl.inputValue || '';
        $ctrl.matches = $ctrl.internalItems.filter(function(item) {
            const text = normalize(item.text);
            return text.indexOf(normalize(query)) >= 0;
        });

        const sorter = 'sorter' in $ctrl ? $ctrl.sorter : bimSelectConfig.sorter;
        if (query && sorter) {
            $ctrl.matches.sort(function(a, b) {
                return sorter(a.model, b.model, query);
            });
        }

        // Workaround to expose real index for each item since
        // vs-repeat modifies it.
        $ctrl.matches.forEach(function(match, index) {
            match.index = index;
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
        const externalItems = $ctrl.items || [];
        return externalItems.map(function(item) {
            const adapted = $ctrl.adapter(item);
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
        $ctrl.width = $element.find('.input-group').outerWidth();
    }

    function setSelection(match) {
        $ctrl.model.$setViewValue(match.model);
    }

    function renderSelection() {
        if ($ctrl.model.$modelValue === undefined || $ctrl.model.$modelValue === null) {
            $ctrl.inputValue = '';
        } else {
            $ctrl.inputValue = $ctrl.model.$modelValue && $ctrl.adapter($ctrl.model.$modelValue).text;
        }
    }

    function outsideClick(event) {
        let elm = event.target;
        while (elm && elm !== $element[0]) {
            elm = elm.parentNode;
        }

        if (!elm) {
            // We hit document, and not any element within the directive
            $scope.$apply(function() {
                ul.scrollTop = 0;
                $ctrl.close();
            });
        }
    }

    var NORMALIZE_MAP = {
        'å': 'a',
        'ä': 'a',
        'ë': 'e',
        'é': 'e',
        'è': 'e',
        'ö': 'o',
        'ø': 'o',
        'ü': 'u'
    };

    function normalize(str) {
        const localPresent = 'diacritics' in $ctrl;
        let out = str.toLowerCase();

        if ((localPresent && $ctrl.diacritics === 'strip') || (!localPresent && bimSelectConfig.diacritics === 'strip')) {
            if (out.normalize) {
                // Most browsers
                out = out.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            } else {
                // IE11
                out = out.split('').map(function(char) {
                    return NORMALIZE_MAP[char] || char;
                }).join('');
            }
        }

        return out;
    }
};
