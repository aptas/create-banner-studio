/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const minifier = require('html-minifier');

class DecorateHtmlWebpackPlugin {
  apply(compiler) {
    compiler.plugin('compilation', compilation => {
      compilation.plugin('html-webpack-plugin-before-html-processing', data => {
        if (!data.plugin.options.banner) {
          return;
        }

        const { minify, banner } = data.plugin.options;

        const html = require(banner.layout)(data.html)(banner);

        data.html = minify ? minifier.minify(html, minify) : html;
      });
    });
  }
}

module.exports = DecorateHtmlWebpackPlugin;
