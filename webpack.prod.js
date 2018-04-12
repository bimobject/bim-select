const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    output: {
        filename: 'bim-select.min.js',
    },
    mode: 'production',
    devtool: 'source-map',
});
