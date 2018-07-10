'use strict';

const path = require('path');

// Set the path to the bundled chrome in puppeteer.
process.env.CHROME_BIN = require('puppeteer').executablePath();

const ALL = process.argv.includes('--all');

const BROWSERS = ['ChromeHeadless', 'Edge', 'IE', 'Firefox'];
const HEADLESS = ['ChromeHeadless'];
const COVERAGE = process.argv.includes('--coverage');
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
webpackConfig.module.rules.unshift({
    // enforce: 'post',
    test: /\.js$/,
    use: { loader: 'istanbul-instrumenter-loader' },
    include: path.resolve('src')
});
// https://github.com/vuejs-templates/webpack/issues/646#issuecomment-329324092
webpackConfig.module.rules.unshift({
    test: require.resolve('chai-as-promised'),
    use: 'babel-loader'
});

const getReporters = () => {
    const reps = [];

    if (COVERAGE) {
        reps.push('coverage-istanbul');
    }

    if (CI || process.argv.includes('--text')) {
        reps.push('mocha');
    } else {
        reps.push('dots');
    }

    return reps;
};


module.exports = function(config) {
    const testFile = 'test/index.js';

    config.set({
        frameworks: ['mocha', 'chai-dom', 'chai-as-promised', 'sinon-chai', 'chai'],
        files: [testFile],
        preprocessors: {
            [require.resolve('chai-as-promised')]: ['webpack'],
            [testFile]: ['webpack']
        },

        reporters: getReporters(),

        browsers,
        singleRun: true,

        coverageIstanbulReporter: {
            reports: ['lcov'],
            dir: path.resolve(__dirname, 'coverage')
        },

        webpack: webpackConfig
    });
};
