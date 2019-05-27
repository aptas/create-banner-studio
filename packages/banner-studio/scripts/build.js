/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

process.env.NODE_ENV = 'production';

process.on('unhandledRejection', err => {
  throw err;
});

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const webpack = require('webpack');
const flatten = require('lodash/flatten');

const paths = require('../config/paths');
const config = require('../config/config');
const webpackConfig = require('../config/webpack.config');
const indentOutput = require('../utils/indentOutput');

const formatWebpackMessages = require('../utils/formatWebpackMessages');
const checkRequiredFiles = require('../utils/checkRequiredFiles');
const printFileSizes = require('../utils/fileSizeReporter');

// Create the production build and print the deployment instructions.
async function build() {
  const requiredFiles = flatten(
    config.banners.map(banner => [
      path.join(paths.appSrc, banner.src, 'content.html'),
      path.join(paths.appSrc, banner.src, 'entry.js'),
    ])
  );

  // Warn and crash if required files are missing
  const requiredFilesExist = await checkRequiredFiles(requiredFiles);

  if (!requiredFilesExist) {
    process.exit(1);
  }

  console.log('Creating an optimized production build...');

  const compiler = webpack(webpackConfig);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        console.log(err);

        reject(err.message);
        return;
      }

      const messages = formatWebpackMessages(stats.toJson({}, true));

      if (messages.errors.length) {
        reject(new Error(messages.errors.join('\n\n')));
        return;
      }

      resolve({
        stats,
        warnings: messages.warnings,
      });
    });
  });
}

(async function() {
  try {
    await fs.emptyDir(paths.appBuild);

    const {
      stats: { stats },
      warnings,
    } = await build();

    if (warnings.length) {
      indentOutput(`
          ${chalk.yellow('Compiled with warnings.')}
          ${warnings.join('\n\n')}

          Search for the ${chalk.underline(
            chalk.yellow('keywords')
          )} to learn more about each warning.
          To ignore, add ${chalk.cyan(
            '// eslint-disable-next-line'
          )} to the line before.
        `);
    } else {
      console.log(chalk.green('Compiled successfully.\n'));
    }

    console.log('File sizes after gzip:\n');
    stats.forEach(s => printFileSizes(s, s.compilation.outputOptions.path));
    console.log();
  } catch (err) {
    console.log(chalk.red('Failed to compile.\n'));
    console.log((err.message || err) + '\n');
    process.exit(1);
  }
})();
