// Expose jQuery on window as it is normally when
// including with script.
window.jQuery = require('jquery');
require('es6-promise').polyfill();
require('angular');
require('angular-mocks');
require('angular-vs-repeat');

require('./style-assertions.js');

var testsContext = require.context(".", true, /\.spec$/);
testsContext.keys().forEach(testsContext);

