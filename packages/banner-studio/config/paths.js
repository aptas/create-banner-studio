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
const fs = require('fs');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());

const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const resolveOwn = relativePath => path.resolve(__dirname, '..', relativePath);

const foo = {
  dotenv: resolveOwn('.env'),
  config: resolveApp('formula.yml'),
  appPath: resolveApp('.'),
  appBuild: resolveApp('dist'),
  appEntry: resolveApp('src/entry.js'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  yarnLockFile: resolveApp('yarn.lock'),
  appNodeModules: resolveApp('node_modules'),
  // publicUrl: getPublicUrl(resolveApp("package.json")),
  // servedPath: getServedPath(resolveApp("package.json")),
  studioRoot: resolveOwn('.'),
  studioNodeModules: resolveOwn('node_modules'),
};

module.exports = foo;
