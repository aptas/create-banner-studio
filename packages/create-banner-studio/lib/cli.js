/**
 * Create Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const validateProjectName = require('validate-npm-package-name');
const chalk = require('chalk');
const commander = require('commander');
const fs = require('fs-extra');
const path = require('path');
const execSync = require('child_process').execSync;
const spawn = require('cross-spawn');
const semver = require('semver');
const dns = require('dns');
const tmp = require('tmp');
const unpack = require('tar-pack').unpack;
const hyperquest = require('hyperquest');

const pkg = require('../package.json');

let projectName;

/**
 * Splits a multiline text and indents each line
 */
const indentOutput = (output, indent = 2) =>
  output.split('\n').forEach(line => {
    console.log(`${' '.repeat(indent)} ${line.trim()}`); // eslint-disable-line no-console
  });

const program = new commander.Command(pkg.name)
  .version(pkg.version)
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action(name => {
    projectName = name;
  })
  .option('--verbose', 'print additional logs')
  .on('--help', () => {
    indentOutput(`
      Only ${chalk.green('<project-directory>')} is required.

      If you have any problems, do not hesitate to file an issue:

      ${chalk.cyan('https://github.com/aptas/create-banner-studio/issues/new')}

    `);
  })
  .parse(process.argv);

if (typeof projectName === 'undefined') {
  console.error('  Please specify the project directory:'); // eslint-disable-line no-console
  indentOutput(`
    ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}

    For example:

    ${chalk.cyan(program.name())} ${chalk.green('my-new-banner-studio')}

    Run ${chalk.cyan(`${program.name()} --help`)} to see all options.
  `);
  process.exit(1);
}

function printValidationResults(results) {
  if (typeof results !== 'undefined') {
    results.forEach(error => {
      console.error(`  ${chalk.red(`  *  ${error}`)}`); // eslint-disable-line no-console
    });
  }
}

/**
 * Runs the CLI
 */
function createBannerStudio(name, verbose, version) {
  const root = path.resolve(name);
  const appName = path.basename(root);

  checkAppName(appName);
  fs.ensureDirSync(name);

  if (!isSafeToCreateProjectIn(root)) {
    indentOutput(`
      The directory ${chalk.green(name)} contains files that could conflict.
      Try using a new directory name.
    `);
    process.exit(1);
  }

  indentOutput(`
    Creating a new banner studio in ${chalk.green(root)}.

  `);

  const packageJson = {
    name: appName,
    version: '0.1.0',
    private: true,
  };

  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  const originalDirectory = process.cwd();
  process.chdir(root);

  const useYarn = shouldUseYarn();

  run(root, appName, version, verbose, originalDirectory, useYarn);
}

function shouldUseYarn() {
  try {
    execSync('yarn --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function install(useYarn, dependencies, verbose) {
  return new Promise((resolve, reject) => {
    let command;
    let args;
    if (useYarn) {
      command = 'yarn';
      args = ['add', '--exact'].concat(dependencies);
    } else {
      command = 'npm';
      args = ['install', '--save', '--save-exact'].concat([dependencies]);
    }

    if (verbose) {
      args.push('--verbose');
    }

    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', code => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`,
        });
        return;
      }
      resolve();
    });
  });
}

function initBannerStudio(
  root,
  appName,
  verbose,
  originalDirectory,
  packageName
) {
  // console.log(
  //   "initBannerStudio",
  //   `root ${root}`,
  //   `appName ${appName}`,
  //   `verbose ${verbose}`,
  //   `originalDirectory ${originalDirectory}`,
  //   `packageName ${packageName}`
  // );
  const scriptsPath = path.resolve(
    process.cwd(),
    'node_modules',
    packageName,
    'scripts',
    'init.js'
  );
  const init = require(scriptsPath);
  return init(root, appName, verbose, originalDirectory);
}

/**
 * Runs the installation process
 */
async function run(
  root,
  appName,
  version,
  verbose,
  originalDirectory,
  useYarn
) {
  const packageToInstall = getInstallPackage(version);

  indentOutput('Installing packages. This might take a couple minutes.');

  try {
    const packageName = await getPackageName(packageToInstall);
    console.log(packageName);

    indentOutput(`
        Installing ${chalk.cyan(packageName)}...

      `);

    await install(useYarn, packageToInstall, verbose);

    checkNodeVersion(packageName);

    await initBannerStudio(
      root,
      appName,
      verbose,
      originalDirectory,
      packageName
    );
  } catch (err) {
    indentOutput(`
      Aborting installation.
    `);
    console.log(err);

    if (err.command) {
      indentOutput(`  ${chalk.cyan(err.command)} has failed.`);
    } else {
      indentOutput(`
        ${chalk.red('Unexpected error. Please report it as a bug:')}
        ${err}
      `);
    }

    // On 'exit' we will delete these files from target directory.
    const knownGeneratedFiles = [
      'package.json',
      'npm-debug.log',
      'yarn-error.log',
      'yarn-debug.log',
      'node_modules',
    ];

    const currentFiles = fs.readdirSync(path.join(root));

    currentFiles.forEach(file => {
      knownGeneratedFiles.forEach(fileToMatch => {
        // This will catch `(npm-debug|yarn-error|yarn-debug).log*` files
        // and the rest of knownGeneratedFiles.
        if (
          (fileToMatch.match(/.log/g) && file.indexOf(fileToMatch) === 0) ||
          file === fileToMatch
        ) {
          indentOutput(`  Deleting generated file... ${chalk.cyan(file)}`);
          fs.removeSync(path.join(root, file));
        }
      });
    });

    const remainingFiles = fs.readdirSync(path.join(root));

    if (!remainingFiles.length) {
      // Delete target folder if empty
      indentOutput(
        `Deleting ${chalk.cyan(`${appName} /`)} from ${chalk.cyan(
          path.resolve(root, '..')
        )}`
      );
      process.chdir(path.resolve(root, '..'));
      fs.removeSync(path.join(root));
    }
    indentOutput('Done.');
    process.exit(1);
  }
}

function getInstallPackage(version) {
  let packageToInstall = 'banner-studio';

  const validSemver = semver.valid(version);

  if (validSemver) {
    packageToInstall += `@${validSemver}`;
  } else if (version) {
    // for tar.gz or alternative paths
    packageToInstall = version;
  }

  return packageToInstall;
}

function getTemporaryDirectory() {
  return new Promise((resolve, reject) => {
    // Unsafe cleanup lets us recursively delete the directory if it contains
    // contents; by default it only allows removal if it's empty
    tmp.dir({ unsafeCleanup: true }, (err, tmpdir, callback) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          tmpdir: tmpdir,
          cleanup: () => {
            try {
              callback();
            } catch (ignored) {
              // Callback might throw and fail, since it's a temp directory the
              // OS will clean it up eventually...
            }
          },
        });
      }
    });
  });
}

function extractStream(stream, dest) {
  return new Promise((resolve, reject) => {
    stream.pipe(
      unpack(dest, err => {
        if (err) {
          reject(err);
        } else {
          resolve(dest);
        }
      })
    );
  });
}

// Extract package name from tarball url or path.
async function getPackageName(installPackage) {
  if (installPackage.indexOf('.tgz') > -1) {
    try {
      const obj = await getTemporaryDirectory();

      let stream;

      if (/^http/.test(installPackage)) {
        stream = hyperquest(installPackage);
      } else {
        stream = fs.createReadStream(installPackage);
      }

      await extractStream(stream, obj.tmpdir);

      const packageName = require(path.join(obj.tmpdir, 'package.json')).name;
      obj.cleanup();

      return packageName;
    } catch (err) {
      // The package name could be with or without semver version, e.g. react-scripts-0.2.0-alpha.1.tgz
      // However, this function returns package name only without semver version.
      indentOutput(
        `Could not extract the package name from the archive: ${err.message}`
      );

      const assumedProjectName = installPackage.match(
        /^.+\/(.+?)(?:-\d+.+)?\.tgz$/
      )[1];

      indentOutput(
        `Based on the filename, assuming it is "${chalk.cyan(
          assumedProjectName
        )}"`
      );

      return assumedProjectName;
    }
  }

  if (installPackage.indexOf('git+') === 0) {
    // Pull package name out of git urls e.g:
    // git+https://github.com/mycompany/react-scripts.git
    // git+ssh://github.com/mycompany/react-scripts.git#v1.2.3
    return installPackage.match(/([^\/]+)\.git(#.*)?$/)[1];
  }

  if (installPackage.indexOf('@') > 0) {
    // Do not match @scope/ when stripping off @version or @tag
    return installPackage.charAt(0) + installPackage.substr(1).split('@')[0];
  }

  return installPackage;
}

function checkNodeVersion(packageName) {
  const packageJsonPath = path.resolve(
    process.cwd(),
    'node_modules',
    packageName,
    'package.json'
  );

  const packageJson = require(packageJsonPath);

  if (!packageJson.engines || !packageJson.engines.node) {
    return;
  }

  if (!semver.satisfies(process.version, packageJson.engines.node)) {
    // eslint-disable-next-line no-console
    console.error(
      chalk.red(`
  You are running Node %s.
  create-banner-studio requires Node %s or higher.
  Please update your version of Node.
`),
      process.version,
      packageJson.engines.node
    );

    process.exit(1);
  }
}

function checkAppName(appName) {
  const validationResult = validateProjectName(appName);

  if (!validationResult.validForNewPackages) {
    // eslint-disable-next-line no-console
    console.error(
      `  Could not create a project called ${chalk.red(
        `"${appName}"`
      )} because of npm naming restrictions:`
    );

    printValidationResults(validationResult.errors);
    printValidationResults(validationResult.warnings);

    process.exit(1);
  }
}

// If project only contains files generated by GH, it’s safe.
function isSafeToCreateProjectIn(root) {
  const validFiles = [
    '.DS_Store',
    'Thumbs.db',
    '.git',
    '.gitignore',
    '.idea',
    'README.md',
    'LICENSE',
  ];

  const conflicts = fs
    .readdirSync(root)
    .filter(file => !validFiles.includes(file))
    // IntelliJ IDEA creates module files before CRA is launched
    .filter(file => !/\.iml$/.test(file))
    // Don't treat log files from previous installation as conflicts
    .filter(
      file => !errorLogFilePatterns.some(pattern => file.indexOf(pattern) === 0)
    );

  if (conflicts.length > 0) {
    indentOutput(
      `The directory ${chalk.green(name)} contains files that could conflict:`
    );
    console.log();
    for (const file of conflicts) {
      indentOutput(`  ${file}`);
    }
    console.log();
    indentOutput(
      'Either try using a new directory name, or remove the files listed above.'
    );

    return false;
  }

  return true;
}

async function checkIfOnline(useYarn) {
  if (!useYarn) {
    // Don't ping the Yarn registry.
    // We'll just assume the best case.
    return true;
  }

  return new Promise(resolve => {
    dns.lookup('registry.yarnpkg.com', err => {
      resolve(err === null);
    });
  });
}

// Start CLI
createBannerStudio(
  projectName,
  program.verbose || false,
  program.scriptsVersion
);
