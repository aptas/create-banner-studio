/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

function recursiveIssuer(m) {
  if (m.issuer) {
    return recursiveIssuer(m.issuer);
  }

  if (m.name) {
    return m.name;
  }

  return false;
}

module.exports = (prod, target) => {
  const optimization = {
    splitChunks: {
      cacheGroups: !prod
        ? Object.assign(
            ...target.map(banner => ({
              [banner.dest]: {
                name: `${banner.dest}/`,
                test: (m, c, entry = `${banner.dest}/`) =>
                  m.constructor.name === 'CssModule' &&
                  recursiveIssuer(m) === entry,
                chunks: 'all',
                enforce: true,
              },
            }))
          )
        : {},
    },
    minimizer: [],
  };

  if (prod) {
    if (
      (typeof target.minify === 'boolean' && target.minify) ||
      (typeof target.minify === 'object' && target.minify.js)
    ) {
      optimization.minimizer.push(
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
            },
            output: {
              comments: false,
            },
          },
          parallel: true,
          cache: true,
        })
      );
    }

    if (
      (typeof target.minify === 'boolean' && target.minify) ||
      (typeof target.minify === 'object' && target.minify.css)
    ) {
      optimization.minimizer.push(new OptimizeCSSAssetsPlugin());
    }
    // optimization.minimizer.push(new OptimizeCSSAssetsPlugin());
  } else {
    optimization.namedModules = true;
  }

  return optimization;
};
