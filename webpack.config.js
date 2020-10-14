/**
 * 2007-2020 PrestaShop and Contributors
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License 3.0 (AFL-3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/AFL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * @author    PrestaShop SA <contact@prestashop.com>
 * @copyright 2007-2020 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License 3.0 (AFL-3.0)
 * International Registered Trademark & Property of PrestaShop SA
 */
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: [
    './js/module.js',
  ],
  output: {
    path: './public',
    filename: 'module.js',
  },
  module: {
    loaders: [{
      test: path.join(__dirname, 'js'),
      loader: 'babel',
      query: {
        presets: ['es2015'],
      },
    }, {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract('style', 'css!sass'),
    }, {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract('style', 'css?sourceMap!postcss!sass?sourceMap'),
    }, {
      test: /.(png|woff(2)?|eot|ttf|svg)(\?[a-z0-9=]+)?$/,
      loader: 'file-loader?name=[hash].[ext]',
    }],
  },
  plugins: [
    new ExtractTextPlugin('module.css'),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      compress: {
        sequences: true,
        conditionals: true,
        booleans: true,
        if_return: true,
        join_vars: true,
        drop_console: true,
      },
      output: {
        comments: false,
      },
    }),
  ],
};
