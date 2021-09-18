const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'src/index.ts'),

  mode: "production",

  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },

  resolve: {
    extensions: ['.ts', '.js', '.json']
  },

  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
  ]
};