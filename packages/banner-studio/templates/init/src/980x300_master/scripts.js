let LOADED = false;

function bootstrap() {
  if (LOADED) return;
  LOADED = true;

  console.log('LOCKED AND LOADED WITH ES6 AND WEBPACK!');
}

document.addEventListener('DOMContentLoaded', bootstrap, false);
window.addEventListener('load', bootstrap, false);
