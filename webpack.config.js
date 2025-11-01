const p = 1;

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackBar = require('webpackbar');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { pages, flatPages } = require('./src/data/pages.js');

const pageEntries = {};
for (const fileName in flatPages) {
  pageEntries[fileName] = `./src/js/pages/${fileName}.js`;
}

const pageHtmlWebpackPlugins = [];
for (const fileName in flatPages) {
  pageHtmlWebpackPlugins.push(new HtmlWebpackPlugin({
      title: flatPages[fileName],
      template: `./src/html/${fileName}.html`,
      filename: `pages/${fileName}.html`,
      chunks: [fileName]
  }));
}

module.exports = {
  entry: {
    index: './src/js/index/script.js',
    ...pageEntries
  },
  output: {
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].chunk.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  optimization: {
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
    splitChunks: {
      chunks: 'all',
      minSize: 5000,
      minChunks: 1,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                exclude: ['transform-exponentiation-operator'],
              }
            ]
          ]
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]'
        }
      },
      {
        test: /.(webmanifest|png|ico)$/,
        include: path.resolve(__dirname, 'assets/favicon'),
        type: 'asset/resource',
        generator: {
          filename: 'assets/favicon/[name][ext]'
        }
      },
      {
        test: /.jpg/,
        include: path.resolve(__dirname, 'assets/images'),
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]'
        }
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' }
      },
      {
        test: /\.mp\.zlib$/,
        use: [
          {
            loader: path.resolve(__dirname, 'mpZlibLoader.js')
          }
        ]
      }
    ]
  },
  plugins: [
    new WebpackBar(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
    new HtmlWebpackPlugin({
      title: '索引',
      template: './src/html/index/index.html',
      filename: 'index.html',
      chunks: ['index'],
      templateParameters: { pages }
    }),
    ...pageHtmlWebpackPlugins
  ],
  resolve: {
    alias: {
      '@css': path.resolve(__dirname, 'src/css'),
      '@js': path.resolve(__dirname, 'src/js'),
      '@data': path.resolve(__dirname, 'src/data'),
      '@assets': path.resolve(__dirname, 'assets')
    },
  },
  mode: p ? 'production' : 'development'
};
