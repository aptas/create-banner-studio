/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// Crash on unhandled rejections.
process.on('unhandledRejection', err => {
  throw err;
});

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// const paths = require("../config/paths");

module.exports = async function(appPath, appName, verbose, originalDirectory) {
  const ownPackageName = require(path.join(__dirname, '..', 'package.json'))
    .name;
  const ownPath = path.join(appPath, 'node_modules', ownPackageName);
  const appPackage = require(path.join(appPath, 'package.json'));
  const useYarn = await fs.exists(path.join(appPath, 'yarn.lock'));

  // console.log("init");
  //
  // console.log(`appPath: ${appPath}`);
  // console.log(`ownPath: ${ownPath}`);
  // console.log(appName);
  //
  // console.log(ownPackageName);
  // console.log(ownPath);
  // console.log(useYarn);

  // Setup the script rules
  appPackage.scripts = {
    start: 'banner-studio start',
    new: 'banner-studio create',
    generate: 'banner-studio generate',
    build: 'banner-studio build',
  };

  // Copy over some of the devDependencies
  appPackage.dependencies = appPackage.dependencies || {};
  appPackage.devDependencies = appPackage.devDependencies || {};

  await fs.writeFile(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2)
  );

  const readmeExists = await fs.exists(path.join(appPath, 'README.md'));

  if (readmeExists) {
    await fs.rename(
      path.join(appPath, 'README.md'),
      path.join(appPath, 'README.old.md')
    );
  }

  // process.exit(1);

  // Copy the files for the user
  const templatePath = path.join(ownPath, 'templates', 'init');

  const templateExists = await fs.exists(templatePath);

  if (!templateExists) {
    // eslint-disable-next-line no-console
    console.error(
      `Could not locate init template: ${chalk.green(templatePath)}`
    );

    return process.exit(1);
  }

  await fs.copy(templatePath, appPath);

  // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
  // See: https://github.com/npm/npm/issues/1862
  try {
    await fs.move(
      path.join(appPath, 'gitignore'),
      path.join(appPath, '.gitignore')
    );
  } catch (err) {
    // Append if there's already a `.gitignore` file there
    if (err.code === 'EEXIST') {
      const data = fs.readFileSync(path.join(appPath, 'gitignore'));
      fs.appendFileSync(path.join(appPath, '.gitignore'), data);
      fs.unlinkSync(path.join(appPath, 'gitignore'));
    } else {
      throw err;
    }
  }

  let command;
  let args;

  if (useYarn) {
    command = 'yarnpkg';
    args = ['add'];
  } else {
    command = 'npm';
    args = ['install', '--save', verbose && '--verbose'].filter(e => e);
  }

  // Install additional template dependencies, if present
  // const templateDependenciesPath = path.join(
  //   appPath,
  //   ".template.dependencies.json"
  // );
  // if (fs.existsSync(templateDependenciesPath)) {
  //   const templateDependencies = require(templateDependenciesPath).dependencies;
  //   args = args.concat(
  //     Object.keys(templateDependencies).map(key => {
  //       return `${key}@${templateDependencies[key]}`;
  //     })
  //   );
  //   fs.unlinkSync(templateDependenciesPath);
  // }

  // Display the most elegant way to cd.
  // This needs to handle an undefined originalDirectory for
  // backward compatibility with old global-cli's.
  let cdpath;

  if (originalDirectory && path.join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }

  // Change displayed command to yarn instead of yarnpkg
  const displayedCommand = useYarn ? 'yarn' : 'npm';

  /* eslint-disable no-console */
  console.log();
  console.log(`Success! Created ${appName} at ${appPath}`);
  console.log('Inside that directory, you can run several commands:');
  console.log();

  console.log(chalk.cyan(`  ${displayedCommand} start`));
  console.log('    Starts the development server.');
  console.log();

  console.log(
    chalk.cyan(`  ${displayedCommand} ${useYarn ? '' : 'run '}build`)
  );
  console.log('    Bundles the app into static files for production.');
  console.log();

  console.log('We suggest that you begin by typing:');
  console.log();
  console.log(chalk.cyan('  cd'), cdpath);
  console.log(`  ${chalk.cyan(`${displayedCommand} start`)}`);

  if (readmeExists) {
    console.log();
    console.log(
      chalk.yellow(
        'You already had a `README.md` file, we renamed it to `README.old.md`'
      )
    );
  }

  console.log();
  console.log('Happy hacking!');
  /* eslint-enable no-console */
};
