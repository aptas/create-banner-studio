/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const fs = require('fs-extra');
const chalk = require('chalk');
const yaml = require('js-yaml');
const paths = require('./paths');

const configError = section =>
  chalk.red(`
No ${section} detected.

Please specify atleast one banner in formula.yml at the root of your project.

See https://github.com/aptas/create-banner-studio/ for more info.
`);

let config = null;

try {
  config = yaml.safeLoad(fs.readFileSync(paths.config, 'utf8'));
} catch (error) {
  console.log(error);
  console.error(configError('formula'));
  process.exit(1);
}

if (!config.banners || !config.banners.length) {
  console.error(configError('banners'));
  process.exit(1);
}

config.banners = config.banners.map(banner => ({
  ...banner,
  provider:
    typeof banner.provider !== 'undefined'
      ? banner.provider
      : config.options.provider,
  inline:
    typeof banner.inline !== 'undefined'
      ? banner.inline
      : config.options.inline,
  thirdParty:
    typeof banner.thirdParty !== 'undefined'
      ? banner.thirdParty
      : config.options.thirdParty,
  minify:
    typeof banner.minify !== 'undefined'
      ? banner.minify
      : config.options.minify,
  src: `${banner.dimensions.width}x${banner.dimensions.height}${
    banner.name ? `_${banner.name}` : ''
  }`,
  dest: `${banner.dimensions.width}x${banner.dimensions.height}${
    banner.name ? `_${banner.name}` : ''
  }`,
}));

module.exports = config;
