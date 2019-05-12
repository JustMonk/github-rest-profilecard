const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PATHS = {
   src: path.join(__dirname, '../src'),
   dist: path.join(__dirname, '../build'),
   assets: 'static/' //assets: 'assets/' / 'static'
}

module.exports = {
   externals: {
      paths: PATHS
   },
   entry: {
      app: PATHS.src
   },
   output: {
      filename: `${PATHS.assets}js/[name].js`,
      path: PATHS.dist,
      publicPath: '/'
   },
   module: {
      rules: [{
         test: /\.js$/,
         loader: 'babel-loader',
         exclude: ['/node_modules/', '/tests/']
      }, {
         test: /\.(png|jpg|gif|svg)$/,
         loader: 'file-loader',
         options: {
            name: '[name].[ext]'
         }
      }, {
         test: /\.less$/,
         use: [
            'style-loader',
            MiniCssExtractPlugin.loader,
            {
               loader: 'css-loader',
               options: { sourceMap: true }
            }, {
               loader: 'postcss-loader',
               options: { sourceMap: true, config: { path: `${PATHS.src}/js/postcss.config.js` } }
            }, {
               loader: 'less-loader',
               options: { sourceMap: true }
            }
         ]
      }, {
         test: /\.css$/,
         use: [
            'style-loader',
            MiniCssExtractPlugin.loader,
            {
               loader: 'css-loader',
               options: { sourceMap: true }
            }, {
               loader: 'postcss-loader',
               options: { sourceMap: true, config: { path: `${PATHS.src}/js/postcss.config.js` } }
            }
         ]
      }]
   },
   plugins: [
      new MiniCssExtractPlugin({
         filename: `${PATHS.assets}css/[name].css`,
      }),
      new HtmlWebpackPlugin({
         hash: false,
         template: `${PATHS.src}/index.html`,
         filename: './index.html'
      }),
      new CopyWebpackPlugin([
         { from: `${PATHS.src}/img`, to: `${PATHS.assets}img` },
         { from: `${PATHS.src}/static`, to: '' },
      ])
   ]
}