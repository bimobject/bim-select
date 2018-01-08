/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// .outerWidth requires jQuery.
__webpack_require__(10);

__webpack_require__(7);

var templateUrl = __webpack_require__(6);
var itemTemplateUrl = __webpack_require__(5);

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
exports.name = 'bimSelect';

exports.component = {
    bindings: {
        adapter: '<',
        diacritics: '<',
        itemTemplateUrl: '<',
        items: '<',
        onChange: '&'
    },
    require: {
        model: 'ngModel'
    },
    templateUrl: templateUrl,
    controller: BimSelectController
};

BimSelectController.$inject = ['$document', '$element', '$timeout', '$scope', '$attrs'];

function BimSelectController($document, $element, $timeout, $scope, $attrs) {
    var $ctrl = this;
    var defaultItemTemplateUrl = itemTemplateUrl;
    var ul = $element[0].querySelector('ul');

    var Keys = {
        Escape: 27,
        Up: 38,
        Down: 40,
        Enter: 13
    };

    var currentJoinedInternalIds = null;

    $ctrl.internalItems = [];
    $ctrl.defaultPlaceholder = 'No selection';

    $scope.$on('$destroy', function () {
        $document.off('mousedown touchstart pointerdown', outsideClick);
    });

    // ANGULAR METHODS

    $ctrl.$onInit = function () {
        $ctrl.internalItemTemplateUrl = $ctrl.itemTemplateUrl || defaultItemTemplateUrl;
        renderSelection();
        $ctrl.model.$render = renderSelection;
        $ctrl.adapter = $ctrl.adapter || function (item) {
            return {
                text: item.text,
                id: item.id
            };
        };
        setWidth();
    };

    $ctrl.$doCheck = function () {
        var adaptedItems = adaptItems();
        var ids = adaptedItems.map(function (item) {
            return item.id;
        }).join('$');

        if (ids !== currentJoinedInternalIds) {
            currentJoinedInternalIds = ids;
            $ctrl.internalItems = adaptedItems;
            updateMatches();
            return;
        }
    };

    // TEMPLATE METHODS

    $ctrl.activateHandler = function (event) {
        event && event.stopPropagation();
        $ctrl.inputValue = '';

        open();
    };

    $ctrl.toggleHandler = function () {
        if ($ctrl.active) {
            $ctrl.close();
        } else {
            // For some reason the .focus below does not trigger activateHandler
            // when running in a normal browser window, so invoke it manually.
            $ctrl.activateHandler();
            $element.find('input').focus();
        }
    };

    $ctrl.close = function () {
        $document.off('mousedown touchstart pointerdown', outsideClick);
        $ctrl.active = false;
        renderSelection();
    };

    $ctrl.select = function (event, match) {
        event && event.preventDefault();
        if (match.id !== 'bim-select-message') {
            setSelection(match);
            $ctrl.onChange({ selected: match.model });
            $ctrl.close();
        }
    };

    $ctrl.clear = function () {
        $ctrl.model.$setViewValue(null);
        $ctrl.onChange({ selected: null });
        $ctrl.close();
    };

    $ctrl.keydownHandler = function (event) {
        if (event.which === Keys.Escape) {
            $ctrl.close();
        }

        if (event.which === Keys.Down) {
            event.preventDefault();
            var newIndex = Math.min($ctrl.activeIndex + 1, $ctrl.matches.length - 1);
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
                var item = $ctrl.matches[$ctrl.activeIndex];
                $ctrl.select(null, item);
            }
        }
    };

    $ctrl.inputValueChangeHandler = function () {
        updateMatches();
        ul.scrollTop = 0;
        if (!$ctrl.active) {
            open();
        }
    };

    $ctrl.isRequired = function () {
        return !!$attrs.required;
    };

    $ctrl.isDisabled = function () {
        return !!$attrs.disabled;
    };

    $ctrl.isClearable = function () {
        return $ctrl.model.$modelValue !== undefined && $ctrl.model.$modelValue !== null && !$ctrl.isRequired();
    };

    $ctrl.placeholderText = function () {
        return $attrs.placeholder || $ctrl.defaultPlaceholder;
    };

    // INTERNAL HELPERS

    function ensureVisibleItem() {
        $timeout(function () {
            var li = ul.querySelector('li.active');

            if (li) {
                var itemHeight = li.clientHeight;
                var listHeight = ul.clientHeight;
                var offsetTop = li.offsetTop;

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
            $timeout(function () {
                // Force rerender of virtual scroll. Needed for at least IE11.
                $scope.$broadcast('vsRepeatResize');
            });
        }
    };

    function updateMatches() {
        $ctrl.activeIndex = -1;
        var query = $ctrl.inputValue || '';
        $ctrl.matches = $ctrl.internalItems.filter(function (item) {
            var text = normalize(item.text);
            return text.indexOf(normalize(query)) >= 0;
        });
        // Workaround to expose real index for each item since
        // vs-repeat modifies it.
        $ctrl.matches.forEach(function (match, index) {
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
        var externalItems = $ctrl.items || [];
        return externalItems.map(function (item) {
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
        var elm = event.target;
        while (elm && elm !== $element[0]) {
            elm = elm.parentNode;
        }

        if (!elm) {
            // We hit document, and not any element within the directive
            $scope.$apply(function () {
                ul.scrollTop = 0;
                $ctrl.close();
            });
        }
    }

    var NORMALIZE_MAP = {
        'å': 'a',
        'ä': 'a',
        'é': 'e',
        'è': 'e',
        'ö': 'o',
        'ø': 'o',
        'ü': 'u'
    };

    function normalize(str) {
        var out = str.toLowerCase();

        if ($ctrl.diacritics === 'strip') {
            if (out.normalize) {
                // Most browsers
                out = out.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            } else {
                // IE11
                out = out.split('').map(function (char) {
                    return NORMALIZE_MAP[char] || char;
                }).join('');
            }
        }

        return out;
    }
};

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = angular;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var angular = __webpack_require__(1);

var _require = __webpack_require__(0),
    name = _require.name,
    component = _require.component;

module.exports = angular.module('bim.select', ['vs-repeat']).component(name, component).name;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(true);
// imports


// module
exports.push([module.i, "bim-select {\n  display: block;\n}\nbim-select .bim-select-dropdown {\n  max-height: 300px;\n  overflow: auto;\n}\nbim-select .bim-select-dropdown .active {\n  background: #337ab7;\n  color: white;\n}\nbim-select .bim-select-item {\n  display: block;\n  padding: 3px 20px;\n  line-height: 1.42857143;\n  cursor: pointer;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n", "", {"version":3,"sources":["C:/Development/bim-select/src/C:/Development/bim-select/src/bim-select.less","C:/Development/bim-select/src/bim-select.less"],"names":[],"mappings":"AAAA;EACI,eAAA;CCCH;ADFD;EAIQ,kBAAA;EACA,eAAA;CCCP;ADND;EAUY,oBAAA;EACA,aAAA;CCDX;ADVD;EAiBQ,eAAA;EACA,kBAAA;EACA,wBAAA;EACA,gBAAA;EACA,oBAAA;EACA,iBAAA;EACA,wBAAA;CCJP","file":"bim-select.less","sourcesContent":["bim-select {\n    display: block;\n\n    .bim-select-dropdown {\n        max-height: 300px;\n        overflow: auto;\n\n        .active {\n            // color taken from @dropdown-link-active-*\n            // See: https://git.io/vS8pF\n            background: #337ab7;\n            color: white;\n        }\n    }\n    .bim-select-item {\n        // Padding etc is tken from:\n        // https://git.io/vS8hv\n        display: block;\n        padding: 3px 20px;\n        line-height: 1.42857143;\n        cursor: pointer;\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n    }\n}\n","bim-select {\n  display: block;\n}\nbim-select .bim-select-dropdown {\n  max-height: 300px;\n  overflow: auto;\n}\nbim-select .bim-select-dropdown .active {\n  background: #337ab7;\n  color: white;\n}\nbim-select .bim-select-item {\n  display: block;\n  padding: 3px 20px;\n  line-height: 1.42857143;\n  cursor: pointer;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 4 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 5 */
/***/ (function(module, exports) {

var path = './bim.select/bim-select-item.template.html';
var html = "<span\n    class=\"bim-select-item\"\n    title=\"{{ match.text }}\">{{ match.text }}</span>\n";
window.angular.module('ng').run(['$templateCache', function(c) { c.put(path, html) }]);
module.exports = path;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

var path = './bim.select/bim-select.template.html';
var html = "<div class=\"dropdown\" ng-class=\"{ open: $ctrl.active }\">\n    <div class=\"input-group\">\n        <input class=\"form-control\"\n               type=\"text\"\n               placeholder=\"{{ $ctrl.placeholderText() }}\"\n               ng-keydown=\"$ctrl.keydownHandler($event)\"\n               ng-click=\"$ctrl.activateHandler($event)\"\n               ng-blur=\"$ctrl.deactivateHandler($event)\"\n               ng-focus=\"$ctrl.activateHandler($event)\"\n               ng-change=\"$ctrl.inputValueChangeHandler()\"\n               ng-disabled=\"$ctrl.isDisabled()\"\n               ng-model=\"$ctrl.inputValue\">\n        <span class=\"input-group-btn\">\n            <button class=\"btn btn-default bim-select--clear\"\n                    type=\"button\"\n                    ng-click=\"$ctrl.clear()\"\n                    ng-disabled=\"$ctrl.isDisabled()\"\n                    ng-if=\"$ctrl.isClearable() && !$ctrl.isDisabled()\">\n                <span class=\"fa fa-remove\"></span>\n            </button>\n            <button class=\"btn btn-default bim-select--toggle\"\n                    type=\"button\"\n                    ng-disabled=\"$ctrl.isDisabled()\"\n                    ng-click=\"$ctrl.toggleHandler()\">\n                <span class=\"fa fa-caret-down\"></span>\n            </button>\n        </span>\n    </div>\n    <ul class=\"bim-select-dropdown dropdown-menu\"\n        vs-repeat\n        role=\"listbox\"\n        ng-style=\"{ width: $ctrl.width }\">\n        <li role=\"option\"\n            ng-repeat=\"match in $ctrl.matches track by match.id\"\n            ng-click=\"$ctrl.select($event, match)\"\n            ng-class=\"{ active: match.index === $ctrl.activeIndex }\">\n            <ng-include src=\"$ctrl.internalItemTemplateUrl\"></ng-include>\n        </li>\n    </ul>\n</div>\n";
window.angular.module('ng').run(['$templateCache', function(c) { c.put(path, html) }]);
module.exports = path;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(3);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(8)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js??ref--1-1!../node_modules/less-loader/dist/index.js??ref--1-2!./bim-select.less", function() {
			var newContent = require("!!../node_modules/css-loader/index.js??ref--1-1!../node_modules/less-loader/dist/index.js??ref--1-2!./bim-select.less");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(9);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);

	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 9 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = jQuery;

/***/ })
/******/ ]);
//# sourceMappingURL=bim-select.js.map