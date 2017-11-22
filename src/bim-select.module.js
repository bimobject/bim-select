const angular = require('angular');

const { name, component } = require('./bim-select.component.js');

module.exports = angular
    .module('bim.select', ['vs-repeat'])
    .component(name, component)
    .name;
