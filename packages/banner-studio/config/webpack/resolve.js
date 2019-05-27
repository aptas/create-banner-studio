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

module.exports = (prod, src) => ({
  modules: [
    // These paths are treated as module roots. Which enables you to import
    // files from here without the ../../../ hell.
    // e.g. import Module from 'Module'; will make webpack look for the module in
    // assets/client/scripts/Module.js, if it doesnt find it, it will look in styles
    // and then finally in node_modules.
    path.join(src, 'scripts'),
    path.join(src, 'styles'),
    path.join(src, 'media'),
    'node_modules',
  ],
  // Tell webpack to automatically look for modules with the following extensions.
  // This makes it possible to do import styles from './styles' without having to specify './styles.css'.
  extensions: ['.js', '.json', '.css'],
  // This section is useful for aliasing modules which aren't directly available for import.
  // e.g. TweenLite: path.resolve(__dirname, 'node_modules', 'gsap', 'src', 'uncompressed', 'TweenLite.js'),
  // will make it possible to do: import TweenLite from 'TweenLite'; within your scripts.
  alias: {},
});
