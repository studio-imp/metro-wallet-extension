const path = require('path');
const webpack = require('webpack')

/*
 
module = {
    rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
    ],
}
 */

module.exports = {
    //target: ['node'],
    resolve: {
    //modules: [...],
    fallback: {
        //fs: false,
        "path": require.resolve('path-browserify'),
        "stream": require.resolve('stream-browserify'),
        "crypto": require.resolve('crypto-browserify'),
    } 
  }, 

  mode: 'production',
  //devtool: false,

  entry: {
      metro_fluid_injector: './src/metro_fluid_injector.js',
      metro_injected_fluids: './src/metro_injected_fluids.js',
      hard_working_metro_worker: './src/hard_working_metro_worker.js',
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, '.././dist/metro-wallet-extension'),
  },

  plugins: [
      new webpack.ProvidePlugin({
          process: 'process/browser',
      }),
  ],

  module: {
    rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
    ],
 }
};