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

module.exports = {
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        useBuiltIns: 'entry',
        modules: false,
        corejs: 3,
        loose: true,
        exclude: ['transform-typeof-symbol'],
      },
    ],
  ],
  plugins: [
    [
      require.resolve('@babel/plugin-proposal-object-rest-spread'),
      {
        useBuiltIns: true,
      },
    ],
    [
      require.resolve('@babel/plugin-proposal-class-properties'),
      {
        loose: true,
      },
    ],
    [
      require.resolve('@babel/plugin-transform-runtime'),
      {
        // regenerator: true,
        corejs: false,
        absoluteRuntime: path.dirname(
          require.resolve('@babel/runtime/package.json')
        ),
      },
    ],
    require.resolve('@babel/plugin-syntax-dynamic-import'),
  ],
};
