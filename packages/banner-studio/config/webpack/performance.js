/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

module.exports = prod => ({
  hints: !prod ? false : 'warning',
  maxAssetSize: 1024 ** 2 * 0.5, // int (in bytes),
  maxEntrypointSize: 1024 ** 2 * 1, // int (in bytes),
});
