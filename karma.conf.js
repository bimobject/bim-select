'use strict';

// Set the path to the bundled chrome in puppeteer.
process.env.CHROME_BIN = require('puppeteer').executablePath();

const ALL = process.argv.includes('--all');

const BROWSERS = ['ChromeHeadless', 'Edge', 'IE', 'Firefox'];
const HEADLESS = ['ChromeHeadless'];
const CI = !!process.env.CI;

let browsers = CI
    ? HEADLESS
    : ALL
        ? BROWSERS
        : HEADLESS;

const webpackConfig = require('./webpack.dev.js');
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

        webpack: webpackConfig
    });
};
