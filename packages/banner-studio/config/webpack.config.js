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
const path = require('path');
const createConfig = require('./webpack/createConfig');

const { banners } = require('./config');

// console.log(banners);

const prod = process.env.NODE_ENV === 'production';

const src = path.resolve(fs.realpathSync(process.cwd()), 'src');
const dest = path.resolve(fs.realpathSync(process.cwd()), 'dist');

module.exports = prod
  ? banners.map(banner => createConfig(prod, src, dest, banner))
  : createConfig(prod, src, dest, banners);

// module.exports = createConfig(prod, src, dest);
