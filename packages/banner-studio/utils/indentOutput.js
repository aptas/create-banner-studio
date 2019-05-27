/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

/**
 * Splits a multiline text and indents each line
 */
module.exports = (output, indent = 2) =>
  output.split('\n').forEach(line => {
    console.log(`${' '.repeat(indent)} ${line.trim()}`); // eslint-disable-line no-console
  });
