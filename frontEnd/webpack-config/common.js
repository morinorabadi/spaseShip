const path = require("path")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry : "./client/src/main.js",
    output : {
        filename : 'bundele.js',
        path : path.resolve(__dirname, '../../dist')
    },
    plugins: [
        new HtmlWebpackPlugin({
            template : './client/src/index.html'
        }),
        new MiniCssExtractPlugin({
            filename : 'manager.css'
        }),
    ],
    module : {
        rules : [
            {
                test : /\.js/,
                exclude : /node_modules/,
                use : {
                    loader : 'babel-loader',
                    options : {
                        presets : ['@babel/preset-env', '@babel/preset-react' ]
                    }
                }
            },
            {
                test : /\.sass$/,
                use : [MiniCssExtractPlugin.loader,"css-loader","sass-loader"]
            }
        ]
    }
}