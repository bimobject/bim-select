const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
module.exports = merge(common, {
    output: {
        filename: 'bim-select.js',
    },
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        contentBase: path.join(__dirname, 'examples'),
        publicPath: '/dist/'
    }
});
