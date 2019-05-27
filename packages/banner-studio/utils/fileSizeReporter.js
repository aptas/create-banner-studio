/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const filesize = require('filesize');
const stripAnsi = require('strip-ansi');
const gzipSize = require('gzip-size').sync;

const config = require('../config/config');

// Prints a detailed summary of build files.
function printFileSizes(webpackStats, buildFolder) {
  const assets = webpackStats.toJson().assets.map(asset => {
    const fileContents = fs.readFileSync(path.join(buildFolder, asset.name));
    const size = gzipSize(fileContents);
    return {
      folder: path.join(path.basename(buildFolder), path.dirname(asset.name)),
      banner: path.dirname(asset.name),
      name: path.basename(asset.name),
      size: size,
      sizeLabel: filesize(size),
    };
  });

  // assets.sort((a, b) => b.size - a.size);
  assets.sort((a, b) => {
    if (a.folder > b.folder) {
      return -1;
    }

    if (a.folder < b.folder) {
      return 1;
    }

    return 0;
  });

  const longestNameLength = Math.max.apply(
    null,
    assets.map(a => stripAnsi(a.name).length)
  );

  assets
    .reduce((acc, curr) => {
      const banner = curr.banner.replace('.', '') || curr.folder;
      let targetBanner = undefined;

      acc.forEach(a => {
        if (a.name === banner) {
          targetBanner = a;
        }
      });

      if (!targetBanner) {
        targetBanner = {
          name: banner,
          size: 0,
          sizeLabel: 0,
          children: [],
        };

        acc.push(targetBanner);
      }

      targetBanner.size += curr.size;
      targetBanner.sizeLabel = filesize(targetBanner.size);

      targetBanner.children.push(curr);

      return acc;
    }, [])
    .forEach(asset => {
      let label = asset.name;
      const labelLength = label.length;

      if (labelLength < longestNameLength) {
        const rightPadding = ' '.repeat(longestNameLength - labelLength);
        label += rightPadding;
      }

      const bannerConfig = config.banners.find(b => b.src === asset.name);

      let colorFn = chalk.cyan;

      const hasLimit = bannerConfig && !!bannerConfig.sizeLimit;
      let limit = undefined;

      if (hasLimit) {
        limit = bannerConfig.sizeLimit * 1024;

        if (asset.size >= limit) {
          colorFn = chalk.red;
        } else {
          colorFn = chalk.green;
        }
      }

      const printLimit = hasLimit ? chalk.dim(`  (${filesize(limit)})`) : '';

      console.log(
        `  ${colorFn(label)}    ${colorFn(asset.sizeLabel)}${printLimit}`
      );

      asset.children.forEach(child => {
        let name = child.name;
        const nameLength = stripAnsi(name).length;

        if (nameLength < longestNameLength) {
          const rightPadding = ' '.repeat(longestNameLength - nameLength);
          name += rightPadding;
        }

        console.log(`    ${chalk.dim(name)}  ${chalk.dim(child.sizeLabel)}`);
      });
    });
}

function removeFileNameHash(buildFolder, fileName) {
  return fileName
    .replace(buildFolder, '')
    .replace(/\/?(.*)(\.\w+)(\.js|\.css)/, (match, p1, p2, p3) => p1 + p3);
}

// Input: 1024, 2048
// Output: "(+1 KB)"
function getDifferenceLabel(currentSize, previousSize) {
  const FIFTY_KILOBYTES = 1024 * 50;
  const difference = currentSize - previousSize;
  const fileSize = !Number.isNaN(difference) ? filesize(difference) : 0;
  if (difference >= FIFTY_KILOBYTES) {
    return chalk.red('+' + fileSize);
  } else if (difference < FIFTY_KILOBYTES && difference > 0) {
    return chalk.yellow('+' + fileSize);
  } else if (difference < 0) {
    return chalk.green(fileSize);
  } else {
    return '';
  }
}

module.exports = printFileSizes;
