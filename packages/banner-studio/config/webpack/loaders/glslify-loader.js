/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const glslify = require('glslify');
const path = require('path');

module.exports = function(source) {
  const basedir = path.dirname(this.resourcePath);

  const callback = this.async();
  this.cacheable(true);

  try {
    const comp = glslify.compile(source, {
      inline: true,
      basedir,
      transform: [require('glslify-import')],
    });
    callback(null, comp);
  } catch (e) {
    callback(e, '');
  }
};
