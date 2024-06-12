const CamundaModelerWebpackPlugin = require('camunda-modeler-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './client/client.js',
  output: {
    path: require('path').join(__dirname, './client'),
    filename: 'client-bundle.js',
  },
  plugins: [
    new CamundaModelerWebpackPlugin({
      type: 'react'
    })
  ]
};