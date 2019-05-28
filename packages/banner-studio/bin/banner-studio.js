#!/usr/bin/env node

/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const spawn = require('cross-spawn');
const command = process.argv[2];
const args = process.argv.slice(3);

function spawnCommand(command) {
  const result = spawn.sync(
    'node',
    [require.resolve('../scripts/' + command)].concat([
      ...args,
      command === 'build' ? 'NODE_ENV=production' : '',
    ]),
    { stdio: 'inherit' }
  );

  if (result.signal) {
    if (result.signal === 'SIGKILL') {
      console.log(
        `The build failed because the process exited too early. This probably means the system ran out of memory or someone called \`kill -9\` on the process.`
      );
    } else if (result.signal === 'SIGTERM') {
      console.log(
        `The build failed because the process exited too early. Someone might have called \`kill\` or \`killall\`, or the system could be shutting down.`
      );
    }
    process.exit(1);
  }

  process.exit(result.status);
}

switch (command) {
  case 'start':
  case 'build':
  case 'create':
  case 'generate':
    spawnCommand(command);
    break;

  default:
    console.log(`
Unknown command ${command}. Known commands are 'start', 'create', 'generate' and 'build'.
`);
    break;
}
