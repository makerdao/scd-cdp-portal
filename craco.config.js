const path = require('path');

module.exports = {
  webpack: {
    alias: {
      // Path aliases for fonts and images
      fonts: path.resolve(__dirname, './src/assets/fonts'),
      images: path.resolve(__dirname, './src/assets/images')
    }
  },
  babel: {
    plugins: [
      ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ]
  }
};
