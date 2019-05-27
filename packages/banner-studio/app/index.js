/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('../config/webpack.config');

const config = require('../config/config.js');

const port = process.env.PORT || 3000;

const app = express();

app.set('views', path.join(path.join(__dirname, '/views')));

app.set('twig options', {
  strict_variables: false,
});

const compiler = webpack(webpackConfig);

const devMiddleware = webpackDevMiddleware(compiler, {
  publicPath: '/',
  logLevel: 'silent',
  // writeToDisk: path => /.html$/.test(path),
  // writeToDisk: true,
  stats: {
    display: 'none',
  },
});

app.use(devMiddleware);
app.use(webpackHotMiddleware(compiler));

app.get('/', (req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    // Transform query param banners into array of integers
    const banners = req.query.banners
      ? req.query.banners
          .split(',')
          .map(num => parseInt(num, 10))
          .filter(num => num != req.query.remove)
      : false;

    // Filter all banners into array of selected banners
    const show = banners
      ? config.banners.filter((item, index) => banners.indexOf(index) > -1)
      : [];

    res.render('index.twig', {
      allBanners: config.banners,
      banners: banners,
      show: show,
    });
  } else {
    next();
  }
});

app.listen(port, err => {
  if (err) console.log(err);

  console.log('Server running on port %s', port);
});
