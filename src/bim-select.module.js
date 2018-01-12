const angular = require('angular');

const component = require('./bim-select.component.js');
const provider = require('./bim-select-config.provider.js');

module.exports = angular
    .module('bim.select', ['vs-repeat'])
    .component(component.name, component.impl)
    .provider(provider.name, provider.impl)
    .name;
