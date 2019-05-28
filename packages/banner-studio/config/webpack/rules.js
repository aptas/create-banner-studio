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
const ExtractCssPlugin = require('mini-css-extract-plugin');

const babelPreset = require('../babel-preset');
const paths = require('../paths');

module.exports = (prod, banner) => {
  /**
   * This loader will match everything except the excluded files. This will
   * make webpack accept all sorts of files without having to specifiy them
   * excplicitly in the file loader.
   */
  const fallbackLoader = {
    /**
     * IMPORTANT:
     * If you add a new loader for a filetype you must add it to
     * this list of excludes as well.
     */
    exclude: [
      /\.(html|ejs)$/,
      /\.js$/,
      /\.css$/,
      /\.json$/,
      /\.ya?ml$/,
      /\.svg$/,
      /\.(gltf|glb|obj)$/,
      /\.(glsl|frag|vert)$/,
    ],
    use: {
      loader: require.resolve('url-loader'),
      options: {
        limit: 1024,
        name: `${prod ? '[hash:5]' : '[name]'}.[ext]`,
      },
    },
  };

  const htmlLoader = {
    test: /\.html$/,
    use: [
      {
        loader: require.resolve('html-loader'),
        options: {
          interpolate: 'require',
        },
      },
    ],
  };

  const preJsLoader = {
    // Transpile javascript with babel.
    test: /\.js$/,
    enforce: 'pre',
    use: [
      {
        loader: require.resolve('webpack-strip-block'),
        options: {
          start: 'dev:start',
          end: 'dev:end',
        },
      },
    ],
  };

  const jsLoader = {
    // Transpile javascript with babel.
    test: /\.js$/,
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: {
          // root: paths.studioRoot,
          babelrc: false,
          ...babelPreset,
          ...(prod
            ? {}
            : {
                cacheDirectory: true,
                highlightCode: true,
              }),
        },
      },
    ],
    exclude: /(node_modules)/,
  };

  const postcssPlugins = () => {
    const plugins = [
      require('postcss-preset-env')({
        stage: 0,
        importFrom: path.resolve(
          paths.appSrc,
          'shared',
          'styles',
          'utils',
          'variables.css'
        ),
      }),
      require('autoprefixer')({}),
    ];

    if (
      prod &&
      ((typeof banner.minify === 'boolean' && banner.minify) ||
        (typeof banner.minify === 'object' && banner.minify.css))
    ) {
      plugins.push(
        require('cssnano')({
          preset: [
            'default',
            {
              discardComments: {
                removeAll: true,
              },
              discardUnused: true,
              autoprefixer: false,
              mergeIdents: true,
              reduceIdents: true,
              zindex: false,
            },
          ],
        })
      );
    }

    return plugins;
  };

  const cssLoader = {
    test: /\.css$/,
    exclude: /\.module\.css$/,
    use: [
      {
        loader: prod
          ? ExtractCssPlugin.loader
          : require.resolve('style-loader'),
      },
      {
        loader: require.resolve('css-loader'),
        options: { importLoaders: 1 },
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          plugins: postcssPlugins,
        },
      },
    ],
  };

  const cssModuleLoader = {
    // Import css files specified with .module as css-modules and process them with postcss.
    // https://github.com/css-modules/css-modules
    test: /\.module\.css$/,
    use: [
      {
        loader: prod
          ? ExtractCssPlugin.loader
          : require.resolve('style-loader'),
      },
      {
        loader: require.resolve('css-loader'),
        options: {
          importLoaders: 1,
          modules: true,
          camelCase: true,
          localIdentName: prod
            ? '[hash:5]'
            : '[name]__[local]--[hash:base64:2]',
        },
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          plugins: postcssPlugins,
        },
      },
    ],
  };

  const svgLoader = {
    test: /\.svg$/,
    use: { loader: require.resolve('svg-inline-loader') },
  };

  const yamlLoader = {
    test: /\.ya?ml$/,
    use: [
      { loader: require.resolve('json-loader') },
      { loader: require.resolve('yaml-loader') },
    ],
    exclude: /(node_modules)/,
  };

  const glslifyLoader = {
    test: /\.(glsl|frag|vert)$/,
    use: [
      { loader: require.resolve('raw-loader') },
      { loader: require.resolve('./loaders/glslify-loader.js') },
    ],
  };

  const modelLoader = {
    test: /\.(gltf|glb|obj)$/,
    use: {
      loader: require.resolve('file-loader'),
      options: {
        name: `${prod ? '[hash:5]' : '[name]'}.[ext]`,
      },
    },
  };

  return [
    fallbackLoader,
    htmlLoader,
    jsLoader,
    cssLoader,
    cssModuleLoader,
    svgLoader,
    yamlLoader,
    glslifyLoader,
    modelLoader,
  ].concat(prod ? [preJsLoader] : []);
};
