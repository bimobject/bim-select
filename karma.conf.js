'use strict';

const DEBUG = process.argv.includes('--debug');
const ALL = process.argv.includes('--all');

const BROWSERS = ['Nightmare', 'Edge', 'IE', 'Firefox', 'Chrome'];
const HEADLESS = ['Nightmare'];
const CI = !!process.env.CI;

let browsers = CI
    ? HEADLESS
    : ALL
        ? BROWSERS
        : HEADLESS;

const webpackConfig = require('./webpack.config.js');
// Do not assume someone else loaded deps in the tests.
// We load them explicitly.
delete webpackConfig.externals;
// Change source map style
webpackConfig.devtool = 'cheap-module-eval-source-map';

module.exports = function(config) {
    const testFile = 'test/index.js';

    config.set({
        frameworks: ['mocha', 'chai-dom', 'chai-as-promised', 'sinon-chai', 'chai'],
        files: [testFile],
        preprocessors: {
            [testFile]: ['webpack']
        },

        reporters: CI ? 'dots' : 'progress',

        browsers,
        singleRun: true,

        nightmareOptions: {
            show: DEBUG,
            openDevTools: DEBUG,
            width: 1000,
            height: 600,
            title: 'Unit test runner'
        },

        webpack: webpackConfig
    });
};
