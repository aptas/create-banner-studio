/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const path = require('path');

module.exports = (prod, src, target) => {
  return prod
    ? { [target.dest]: path.join(src, target.src, 'entry.js') }
    : Object.assign(
        ...target.map(banner => ({
          [`${banner.dest}/`]: prod
            ? path.join(src, banner.src, 'entry.js')
            : [
                path.join(src, banner.src, 'entry.js'),
                require.resolve('webpack-hot-middleware/client') +
                  '?reload=true',
              ],
        }))
      );
};
