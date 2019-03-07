<a name="3.2.0"></a>
# [3.2.0](https://github.com/bimobject/bim-select/compare/v3.1.0...v3.2.0) (2019-03-07)


### Features

* **disabling:** disabling elements are now supported ([aff8389](https://github.com/bimobject/bim-select/commit/aff8389))



<a name="3.1.0"></a>
# [3.1.0](https://github.com/bimobject/bim-select/compare/v3.0.0...v3.1.0) (2018-08-13)


### Features

* **validator:** validate component based on selected item. ([f6b521f](https://github.com/bimobject/bim-select/commit/f6b521f))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/bimobject/bim-select/compare/v2.3.1...v3.0.0) (2018-07-11)


### Bug Fixes

* **diacritics:** Fix failing test with diacritical marks in IE11 ([036e17d](https://github.com/bimobject/bim-select/commit/036e17d))
* **ie:** Downgrade chai-as-promised ([036630b](https://github.com/bimobject/bim-select/commit/036630b))


### Features

* **selected item template:** introduces a template for the selected item. ([5534ba9](https://github.com/bimobject/bim-select/commit/5534ba9))


### BREAKING CHANGES

* **selected item template:** the template variable `match` in the bim-select-item
template has changed to `item`. This was done so that the bim-select-item
template can be reused for the bim-select-selected-item template where
the variable name `match` does not really make sense since the selected item
is no longer a match but rather is the selected item after the match item was
selected.



<a name="2.3.1"></a>
## [2.3.1](https://github.com/bimobject/bim-select/compare/v2.3.0...v2.3.1) (2018-04-12)


### Bug Fixes

* **build:** Correctly polyfill for IE ([3020bf3](https://github.com/bimobject/bim-select/commit/3020bf3))



<a name="2.3.0"></a>
# [2.3.0](https://github.com/bimobject/bim-select/compare/v2.2.0...v2.3.0) (2018-01-12)


### Features

* **config:** Allow global configuration ([27246f4](https://github.com/bimobject/bim-select/commit/27246f4)), closes [#8](https://github.com/bimobject/bim-select/issues/8)



<a name="2.2.0"></a>
# [2.2.0](https://github.com/bimobject/bim-select/compare/v2.1.0...v2.2.0) (2018-01-10)


### Features

* **diacritics:** Allow filtering ignoring diacritics ([b798ffe](https://github.com/bimobject/bim-select/commit/b798ffe))
* **sorter:** Allow custom sorting of matched items ([41eb1d9](https://github.com/bimobject/bim-select/commit/41eb1d9)), closes [#9](https://github.com/bimobject/bim-select/issues/9)



<a name="2.1.0"></a>
# [2.1.0](https://github.com/bimobject/bim-select/compare/v2.0.0...v2.1.0) (2017-09-26)


### Bug Fixes

* **html:** Remove unused attribute ([46c11a4](https://github.com/bimobject/bim-select/commit/46c11a4))


### Features

* **placeholder:** Support custom placeholder ([cdde3cf](https://github.com/bimobject/bim-select/commit/cdde3cf))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/bimobject/bim-select/compare/v1.0.1...v2.0.0) (2017-06-12)


### Chores

* **build:** Use webpack to build ([0e4a93c](https://github.com/bimobject/bim-select/commit/0e4a93c)), closes [#5](https://github.com/bimobject/bim-select/issues/5) [#2](https://github.com/bimobject/bim-select/issues/2)


### BREAKING CHANGES

* **build:** Runtime file to be included is moved to `dist/bim-select.js`.
And the CSS file is part of the javascript now, so no need to
include it separately.



<a name="1.0.1"></a>
## [1.0.1](https://github.com/bimobject/bim-select/compare/v1.0.0...v1.0.1) (2017-06-03)

- Fixed: Ensure dropdown has correct size (#1).
- Perf: Speed up open by removing debounce ([034ce6f](https://github.com/bimobject/bim-select/commit/034ce6f)).

<a name="1.0.0"></a>
# [1.0.0](https://github.com/bimobject/bim-select/commits/v1.0.0) (2017-05-30)

Initial public version.
