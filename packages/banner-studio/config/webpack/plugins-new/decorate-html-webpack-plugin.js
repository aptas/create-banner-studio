/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');
const minifier = require('html-minifier');

class DecorateHtmlWebpackPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('DecorateHtml', compilation => {
      const hook = HtmlWebpackPlugin.getHooks(compilation).beforeEmit;

      hook.tapAsync('DecorateHtml', data => {
        // Skip if the plugin configuration didn't set any layout
        if (!data.plugin.options.banner) {
          return;
        }

        const { minify, banner } = data.plugin.options;

        console.log('DECORATE HTML PLUGIN IS RUNNING');

        const html = require(banner.layout)(data.html)(banner);

        data.html = minify ? minifier.minify(html, minify) : html;
      });
    });
  }
}

module.exports = DecorateHtmlWebpackPlugin;
