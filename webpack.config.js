const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, './src/bim-select.module.js'),
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bim-select.js'
    },
    devtool: 'source-map',
    externals: {
        // Assume someone else loaded these.
        angular: 'angular',
        jquery: 'jQuery'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel-loader',
        }, {
            test: /\.less$/,
            use: [{
                loader: "style-loader"
            }, {
                loader: "css-loader", options: {
                    sourceMap: true
                }
            }, {
                loader: "less-loader", options: {
                    sourceMap: true
                }
            }]
        }, {
            test: /\.html$/,
            use: [{
                loader: 'ngtemplate-loader', options: {
                    relativeTo: path.join(__dirname, 'src'),
                    prefix: './bim.select'
                }
            }, {
                loader: 'html-loader'
            }]
        }]
    }
};
