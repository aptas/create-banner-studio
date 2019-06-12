/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

module.exports = targets =>
  (typeof targets === 'object'
    ? targets.map(target => {
        switch (target.toLowerCase()) {
          case 'gsap':
            return '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/latest/TweenMax.min.js"></script>';

          case 'jquery':
            return '<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>';

          case 'seenthis':
            return '<script src="https://video.seenthis.se/v2/player/6/player.js"></script>';

          case 'three':
            return '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/104/three.min.js"></script>';

          default:
            return `<script src="${target}"></script>`;
        }
      })
    : []
  ).join('\n      ');
