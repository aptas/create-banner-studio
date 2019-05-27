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
const inquirer = require('inquirer');
const yaml = require('js-yaml');
const _ = require('lodash');

const paths = require('../config/paths');
const config = require('../config/config');
const indentOutput = require('../utils/indentOutput');
const generator = require('./generator');

// 1. Ask for name.
// 2. Ask for dimensions.
// 3. Ask for parent.
//   - If parent presented, check if it actually exists. Then copy provider/settings. (skip to 8.)
// 5. Ask for provider.
// 6. Ask for inline. (maybe default to true and print how to change?)
// 7. Ask for thirdParty. (maybe check already created and copy?)
// 8. Write to config.
// 9. Run generate (silent).

const questions = [
  {
    type: 'input',
    name: 'name',
    message: 'Please give this banner a name. (e.g. master)',
    validate: value =>
      (value.trim().length > 0 &&
        config.banners.filter(b => b.name === value).length === 0) ||
      `Not a valid name. Make sure there's not already a banner called "${value}" in your set.`,
    filter: value => _.kebabCase(value),
  },
  {
    type: 'confirm',
    name: 'notResponsive',
    message: 'Does this banner have a fixed width? (not responsive)',
  },
  {
    type: 'input',
    name: 'width',
    message: 'What is the width of this banner?',
    default: 980,
    validate: value => !isNaN(parseInt(value, 10)) || 'Please enter a number',
    filter: value => parseInt(value, 10),
    when: answers => answers.notResponsive,
  },
  {
    type: 'input',
    name: 'height',
    message: 'What is the height of this banner?',
    default: 300,
    validate: value => !isNaN(parseInt(value, 10)) || 'Please enter a number',
    filter: value => parseInt(value, 10),
  },
  {
    type: 'confirm',
    name: 'hasSizeLimit',
    message: 'Is there a size limit to this banner?',
  },
  {
    type: 'input',
    name: 'sizeLimit',
    message: 'Please specify the limit in KB.',
    default: 150,
    validate: value => !isNaN(parseInt(value, 10)) || 'Please enter a number',
    filter: value => parseInt(value, 10),
    when: answers => answers.hasSizeLimit,
  },
  {
    type: 'confirm',
    name: 'shouldExtend',
    message: 'Would you like this banner to extend another banner?',
  },
  {
    type: 'list',
    name: 'parent',
    message: 'Which banner would you like to extend?',
    choices: config.banners.map(banner => banner.src),
    filter: value => config.banners.find(banner => banner.src === value),
    when: answers => answers.shouldExtend,
  },
  {
    type: 'list',
    name: 'provider',
    message: 'Which provider would you like to use for this banner?',
    choices: [
      {
        name: 'AdForm',
      },
      {
        name: 'DoubleClick',
      },
    ],
    filter: value => value.toLowerCase(),
    when: answers => !answers.parent,
  },
  {
    type: 'checkbox',
    name: 'inline',
    message:
      'Would you like to inline your JavaScript or CSS (or both) within the output HTML?',
    choices: [
      {
        name: 'Styles',
        checked: true,
      },
      {
        name: 'Scripts',
        checked: true,
      },
    ],
    filter: value => value.map(val => val.toLowerCase()),
    when: answers => !answers.parent,
  },
  {
    type: 'checkbox',
    name: 'thirdParty',
    message: 'Would you like to load some third-party libraries from CDN?',
    choices: [
      {
        name: 'GSAP',
        checked: true,
      },
      {
        name: 'jQuery',
      },
      {
        name: 'seenthis',
      },
      {
        name: 'three.js',
      },
    ],
    filter: value => value.map(val => val.toLowerCase()),
    when: answers => !answers.parent,
  },
];

(async function() {
  try {
    const answers = await inquirer.prompt(questions);

    const {
      name,
      notResponsive,
      width,
      height,
      sizeLimit,
      shouldExtend,
      parent,
      provider,
      inline,
      thirdParty,
    } = answers;

    const banner = {
      name: name,
      dimensions: {
        width,
        height,
        responsive: !notResponsive,
      },
      sizeLimit: sizeLimit,
    };

    if (shouldExtend) {
      banner.extends = parent.src;
      banner.provider = parent.provider;
      banner.inline = parent.inline;
      banner.thirdParty = parent.thirdParty;
    } else {
      banner.provider = provider;
      banner.inline =
        inline.length === 0
          ? false
          : {
              js: inline.indexOf('scripts') !== -1,
              css: inline.indexOf('styles') !== -1,
            };
      banner.thirdParty = thirdParty;
    }

    config.banners.push(banner);

    // fs.writeFileSync(
    //   paths.config,
    //   JSON.stringify(
    //     {
    //       banners: config.banners,
    //       options: config.options,
    //     },
    //     null,
    //     2
    //   )
    // );

    await fs.writeFile(paths.config, yaml.safeDump(config));

    console.log('');
    indentOutput(`Wrote ${chalk.cyan(name)} to ${chalk.cyan('formula.yml')}`);

    await generator([
      Object.assign({}, banner, {
        src: `${banner.dimensions.width}x${banner.dimensions.height}${
          banner.name ? `_${banner.name}` : ''
        }`,
        dest: `${banner.dimensions.width}x${banner.dimensions.height}${
          banner.name ? `_${banner.name}` : ''
        }`,
      }),
    ]);
  } catch (err) {
    console.log(err);
  }
})();
