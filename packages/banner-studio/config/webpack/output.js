/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

module.exports = (prod, dest, target) => ({
  // Output destination.
  path: prod ? `${dest}/${target.dest}` : dest,
  // Public path.
  publicPath: prod ? '' : `/`,
  filename: `${prod ? '[contenthash:5]' : '[name]app'}.js`,
});
