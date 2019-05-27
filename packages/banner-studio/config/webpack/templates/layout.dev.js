/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const getThirdParty = require('./get-third-party');

module.exports = template => opts => {
  const { dimensions, thirdParty } = opts;

  const thirdPartyInject = getThirdParty(thirdParty);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name=viewport content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <title>banner</title>

    <style>
      body {
        margin: 0;
        padding: 0;
        height: 100%;
        font-family: sans-serif;
        font-size: 16px;
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }

      .container {
        position: relative;
        width: ${dimensions.responsive ? '100%' : `${dimensions.width}px`};
        height: ${dimensions.height}px;
        cursor: pointer;
      }

      .main {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <div class="container" id="banner">
      <div class="main" id="click-area">
        ${template}
      </div>
    </div>

    ${thirdPartyInject}
  </body>
</html>`;
};
