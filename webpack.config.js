const path = require('path');

module.exports = {
  entry: './src/index.js', // Adjust this to your actual entry point
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/, // This regex matches all .css files
        use: ['style-loader', 'css-loader'], // Use these loaders for CSS files
      },
    ],
  },
  mode: 'development', // Set to 'production' for production builds
};