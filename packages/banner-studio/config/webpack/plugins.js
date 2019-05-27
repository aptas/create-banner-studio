/**
 * Banner Studio
 *
 * Copyright © 2019 Apt AS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const path = require('path');
const webpack = require('webpack');

const TimeFixPlugin = require('time-fix-plugin');
const WebpackChunkHash = require('webpack-chunk-hash');
const ExtractCssPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');

// const AptWebpackReporterPlugin = require('./plugins/apt-webpack-reporter-plugin');
const DecorateHtmlWebpackPlugin = require('./plugins/decorate-html-webpack-plugin');
const DropFilesWebpackPlugin = require('./plugins/drop-files-webpack-plugin');
const AdformManifestWebpackPlugin = require('./plugins/adform-manifest-webpack-plugin');

module.exports = (prod, src, dest, target) => {
  const plugins = [
    // new AptWebpackReporterPlugin(),
    new webpack.DefinePlugin({
      'process.env': Object.assign({
        NODE_ENV: JSON.stringify(prod ? 'production' : 'development'),
      }),
    }),
  ];

  if (!prod) {
    plugins.push(
      ...target.map(
        banner =>
          new HtmlWebpackPlugin({
            inject: true,
            prod: false,
            banner: {
              ...banner,
              layout: path.join(
                __dirname,
                'templates',
                `layout.${prod ? 'prod' : 'dev'}.js`
              ),
            },
            template: path.join(src, banner.src, 'content.html'),
            filename: `${banner.src}/index.html`,
            chunks: [`${banner.src}/`],
          })
      )
    );
  }

  if (prod) {
    plugins.push(
      ...[
        new HtmlWebpackPlugin({
          inject: true,
          prod: true,
          banner: {
            ...target,
            layout: path.join(
              __dirname,
              'templates',
              `layout.${prod ? 'prod' : 'dev'}.js`
            ),
          },
          template: path.join(src, target.src, 'content.html'),
          filename: `index.html`,
          inlineSource: `${
            !target.inline
              ? ''
              : `.(${
                  typeof target.inline === 'object'
                    ? [
                        `${target.inline.js ? 'js' : ''}`,
                        `${target.inline.css ? 'css' : ''}`,
                      ]
                        .filter(v => !!v)
                        .join('|')
                    : 'js|css'
                })$`
          }`,
          minify:
            target.minify === false ||
            (typeof target.minify === 'object' && target.minify.html === false)
              ? {
                  removeComments: true,
                }
              : {
                  useShortDoctype: true,
                  removeComments: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  removeEmptyAttributes: true,
                  removeScriptTypeAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  minifyJS: true,
                  minifyCSS: true,
                },
        }),
        new webpack.HashedModuleIdsPlugin(),
        new WebpackChunkHash(),
        new ExtractCssPlugin({
          filename: '[contenthash:5].css',
        }),
        new HtmlWebpackInlineSourcePlugin(),
        new DropFilesWebpackPlugin({
          test: !target.inline
            ? null
            : `.(${
                typeof target.inline === 'object'
                  ? [
                      `${target.inline.js ? 'js' : ''}`,
                      `${target.inline.css ? 'css' : ''}`,
                    ]
                      .filter(v => !!v)
                      .join('|')
                  : 'js|css'
              })$`,
        }),
      ]
    );

    if (target.provider === 'adform') {
      plugins.push(
        new AdformManifestWebpackPlugin({
          title: target.dest,
          width: target.dimensions.width,
          height: target.dimensions.height,
        })
      );
    }
  }

  plugins.push(new DecorateHtmlWebpackPlugin());

  if (!prod) {
    plugins.push(
      ...[
        new TimeFixPlugin(),
        new ErrorOverlayPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
      ]
    );
  }

  return plugins;
};
