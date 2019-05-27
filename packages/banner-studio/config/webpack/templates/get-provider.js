/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

module.exports = (provider, width, height) => {
  const output = {
    meta: '',
    head: '',
    body: '',
  };

  const createScript = (fn, name) => `
      <script>
        (function() {
          var LOADED = false;

          ${fn}

          window.addEventListener('load', ${name}, false);
          document.addEventListener('DOMContentLoaded', ${name}, false);
        })();
      </script>`;

  switch (provider) {
    case 'adform':
      output.head = `
    <script>
      (function() {
        var s = document.createElement('script');
        s.src = (window.API_URL || 'https://s1.adform.net/banners/scripts/rmb/Adform.DHTML.js?bv=' + Math.random());
        document.getElementsByTagName('head')[0].appendChild(s);
      })();
    </script>`;

      output.body = createScript(
        `function init() {
            if (LOADED || typeof dhtml === 'undefined') return;

            LOADED = true;

            var clickArea = document.getElementById('click-area');
            var clickTagValue = dhtml.getVar('clickTAG' + (window.customURLAppend || ''), 'http://www.adform.com/');
            var landingPageTarget = dhtml.getVar('landingPageTarget', '_blank');

            function onClickHandler() {
              window.open(clickTagValue, landingPageTarget);
            }

            clickArea.addEventListener('click', onClickHandler, false);
          }`,
        'init'
      );
      break;

    case 'doubleclick':
      output.meta = `    <meta name="ad.size" content="width=${width},height=${height}">`;
      output.head = `    <script src="https://s0.2mdn.net/ads/studio/Enabler.js"></script>
    <script>
      var clickTag = "http://www.google.com";
    </script>`;

      output.body = createScript(
        `function init() {
            if (LOADED) return;

            LOADED = true;

            var clickArea = document.getElementById('click-area');

            function onClickHandler() {
              window.open(window.clickTag, '_blank');
            }

            clickArea.addEventListener('click', onClickHandler, false);
          }`,
        'init'
      );
      break;

    default:
    // no-op
  }

  return output;
};
