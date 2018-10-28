const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            warnings: false,
            conditionals: true,
            unused: true,
            comparisons: true,
            sequences: true,
            dead_code: true,
            evaluate: true,
            if_return: true,
            join_vars: true,
          },
          cache: true,
          parallel: true,
          output: {
            comments: /^\**!|@preserve|@license|@cc_on/,
          },
        },
      }),
      new OptimizeCSSAssetsPlugin({}),
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new webpack.BannerPlugin(` 2007-2018 PrestaShop

 NOTICE OF LICENSE

 This source file is subject to the Academic Free License (AFL 3.0)
 that is bundled with this package in the file LICENSE.txt.
 It is also available through the world-wide-web at this URL:
 http://opensource.org/licenses/afl-3.0.php
 If you did not receive a copy of the license and are unable to
 obtain it through the world-wide-web, please send an email
 to license@prestashop.com so we can send you a copy immediately.

 DISCLAIMER

 Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 versions in the future. If you wish to customize PrestaShop for your
 needs please refer to http://www.prestashop.com for more information.

 @author    PrestaShop SA <contact@prestashop.com>
 @copyright 2007-2018 PrestaShop SA
 @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 International Registered Trademark & Property of PrestaShop SA`),
  ],
});
