/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const createEntry = require('./entry');
const createOutput = require('./output');
const createResolve = require('./resolve');
const createPerformance = require('./performance');
const createRules = require('./rules');
const createOptimization = require('./optimization');
const createPlugins = require('./plugins');

module.exports = (prod, src, dest, target) => ({
  name: prod ? target.name : '',
  mode: prod ? 'production' : 'development',
  devtool: prod ? undefined : 'cheap-module-source-map',
  entry: createEntry(prod, src, target),
  output: createOutput(prod, dest, target),
  resolve: createResolve(prod, src),
  module: {
    rules: createRules(prod, target),
  },
  performance: createPerformance(prod),
  optimization: createOptimization(prod, target),
  plugins: createPlugins(prod, src, dest, target),
});
