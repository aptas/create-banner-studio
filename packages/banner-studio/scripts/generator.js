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
const chalk = require('chalk');
const paths = require('../config/paths');
const config = require('../config/config');
const indentOutput = require('../utils/indentOutput');
const _ = require('lodash');

const fileExists = async file => {
  try {
    await fs.access(file);
    return true;
  } catch (e) {
    return false;
  }
};

async function generate(banners) {
  console.log('');

  for (const banner of banners) {
    const bannerExists = await fileExists(path.join(paths.appSrc, banner.src));

    if (bannerExists) {
      indentOutput(`${chalk.cyan(banner.src)} exists, skipping.`);
    } else {
      const parent =
        banner.extends && config.banners.find(b => b.src === banner.extends)
          ? banner.extends
          : undefined;

      const templatePath = parent
        ? path.join(paths.appSrc, parent)
        : path.join(paths.studioRoot, 'templates', 'banner');

      const templateExists = await fs.exists(templatePath);

      if (!templateExists) {
        console.error(
          `Could not locate banner at: ${chalk.green(templatePath)}`
        );
        return;
      }

      await fs.copy(templatePath, path.join(paths.appSrc, banner.src));

      const stylesheetTemplateSrc = path.join(
        paths.studioRoot,
        'templates',
        'styles',
        'styles.css.tmpl'
      );

      const destStylesheet = path.join(paths.appSrc, banner.src, 'styles.css');

      const stylesheetTemplateExists = await fs.exists(stylesheetTemplateSrc);

      if (stylesheetTemplateExists) {
        const stylesheetTemplate = _.template(
          fs.readFileSync(stylesheetTemplateSrc, { encoding: 'utf8' }),
          { parent: parent }
        );

        await fs.writeFile(
          destStylesheet,
          stylesheetTemplate({ parent: parent })
        );
      }

      const scriptTemplateSrc = path.join(
        paths.studioRoot,
        'templates',
        'scripts',
        'scripts.js.tmpl'
      );

      const destScript = path.join(paths.appSrc, banner.src, 'scripts.js');

      const scriptTemplateExists = await fs.exists(scriptTemplateSrc);

      if (scriptTemplateExists) {
        const scriptTemplate = _.template(
          fs.readFileSync(scriptTemplateSrc, { encoding: 'utf8' }),
          { parent: parent }
        );

        await fs.writeFile(destScript, scriptTemplate({ parent: parent }));
      }

      indentOutput(`created ${chalk.cyan(banner.src)}`);
    }
  }

  console.log('');
  indentOutput(chalk.green('Success!'));
}

module.exports = generate;
