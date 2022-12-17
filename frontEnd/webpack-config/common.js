const path = require("path")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry : "./frontEnd/src/index.js",
    output : {
        filename : 'bundele.js',
        path : path.resolve(__dirname, '../../dist')
    },
    plugins: [
        new HtmlWebpackPlugin({
            template : './frontEnd/src/index.html'
        }),
        new MiniCssExtractPlugin({
            filename : 'static/styles.css',
        }),
        new CopyPlugin({
            patterns: [
                { 
                    from: "./frontEnd/src/assets",
                    to: path.resolve(__dirname, '../../dist/static')
                },
            ],
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