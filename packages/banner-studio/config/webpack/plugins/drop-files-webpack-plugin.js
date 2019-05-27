/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const flattenDeep = require('lodash/flattenDeep');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

class DropFilesWebpackPlugin {
  constructor(options) {
    if (
      options.test &&
      !(typeof options.test === 'string' || Array.isArray(options.test))
    ) {
      throw new Error(
        'DropFilesWebpackPlugin test must be a regexp string or an array of regexp strings'
      );
    }

    this.test = options.test
      ? flattenDeep([options.test]).map(target => new RegExp(target, 'i'))
      : null;
  }

  apply(compiler) {
    compiler.plugin('after-emit', (compilation, callback) => {
      Object.keys(compilation.assets).forEach(asset => {
        if (!this.test || this.test.every(t => !t.test(asset))) return;

        delete compilation.assets[asset];

        const fullPath = path.resolve(compilation.compiler.outputPath);
        const filename = path.join(fullPath, asset);

        const exists = fs.existsSync(filename);

        if (exists) {
          fs.unlinkSync(filename);
        }
      });

      callback();
    });

    // compiler.hooks.compilation.tap('DeleteAssets', compilation => {
    //   const hook = HtmlWebpackPlugin.getHooks(compilation).afterEmit;

    //   hook.tapAsync('DeleteAssets', (data, callback) => {
    //     Object.keys(compilation.assets).forEach(asset => {
    //       if (!this.test || this.test.every(t => !t.test(asset))) return;

    //       delete compilation.assets[asset];

    //       const fullPath = path.resolve(compilation.compiler.outputPath);
    //       const filename = path.join(fullPath, asset);

    //       const exists = fs.existsSync(filename);

    //       if (exists) {
    //         fs.unlinkSync(filename);
    //       }
    //     });

    //     callback();
    //   });
    // });
  }
}

module.exports = DropFilesWebpackPlugin;
