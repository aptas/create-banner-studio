/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const fs = require('fs-extra');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

class DeleteTargetsWebpackPlugin {
  constructor(options) {
    if (!Array.isArray(options.targets)) {
      throw new Error(
        'DeleteTargetsWebpackPlugin targets must be an array of regexp strings'
      );
    }

    this.targets = options.targets.map(target => new RegExp(target, 'i')) || [];
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('DeleteAssets', compilation => {
      const hook = HtmlWebpackPlugin.getHooks(compilation).afterEmit;

      hook.tapAsync('DeleteAssets', (data, callback) => {
        Object.keys(compilation.assets).forEach(asset => {
          if (this.targets.every(t => !t.test(asset))) return;

          const fullPath = path.resolve(compilation.compiler.outputPath);
          const filename = path.join(fullPath, asset);

          delete compilation.assets[asset];

          fs.exists(filename).then(() => {
            fs.remove(filename);
          });
        });

        callback();
      });
    });
  }
}

module.exports = DeleteTargetsWebpackPlugin;
