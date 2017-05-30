'use strict';

const DEBUG = process.argv.includes('--debug');
const ALL = process.argv.includes('--all');

const BROWSERS = ['Nightmare', 'Edge', 'IE', 'Firefox', 'Chrome'];
const HEADLESS = ['Nightmare'];

module.exports = function(config) {
    config.set({
        frameworks: ['mocha', 'chai-dom', 'chai-as-promised', 'sinon-chai', 'chai'],
        files: [
            'bower_components/jquery/dist/jquery.js',
            'bower_components/es6-promise/es6-promise.auto.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-vs-repeat/src/angular-vs-repeat.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'lib/style-assertions.js',
            'src/*.js'
        ],

        browsers: ALL ? BROWSERS : HEADLESS,
        singleRun: true,

        nightmareOptions: {
            show: DEBUG,
            openDevTools: DEBUG,
            width: 1000,
            height: 600,
            title: 'Unit test runner'
        }
    });
};
