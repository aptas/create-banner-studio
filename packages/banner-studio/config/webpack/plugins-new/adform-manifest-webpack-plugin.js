/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

class AdformManifestWebpackPlugin {
  constructor(options) {
    if (!options.title) {
      throw new Error('AdformManifestWebpackPlugin requires a title');
    }

    if (!options.dest) {
      throw new Error('AdformManifestWebpackPlugin requires a destination');
    }

    if (!options.width) {
      throw new Error('AdformManifestWebpackPlugin requires a width');
    }

    if (!options.height) {
      throw new Error('AdformManifestWebpackPlugin requires a height');
    }

    this.title = options.title;
    this.dest = options.dest;
    this.width = options.width;
    this.height = options.height;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'AdformManifestWebpackPlugin',
      (compilation, callback) => {
        const manifest = `{
  "version": "1.0",

  "title": "${this.title}",
  "description": "",

  "width": "${this.width}",
  "height": "${this.height}",

  "events": {
    "enabled": 1,
    "list": {}
  },

  "clicktags": {
    "clickTAG": "http://www.adform.com/site/"
  },

  "source": "index.html"
}`;

        compilation.assets[`${this.dest}/manifest.json`] = {
          source: () => new Buffer(manifest),
          size: function() {
            return Buffer.byteLength(this.source(), 'utf8');
          },
        };

        callback();
      }
    );
  }
}

module.exports = AdformManifestWebpackPlugin;
