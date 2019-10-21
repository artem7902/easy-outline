const path = require('path');

module.exports = function override(config) {
  config.resolve = {
    ...config.resolve,
    alias: { '@models': path.resolve(__dirname, 'src/models'),
    '@components': path.resolve(__dirname, 'src/components'),
    '@redux': path.resolve(__dirname, 'src/redux'),
    '@api': path.resolve(__dirname, 'src/api'),
    '@config': path.resolve(__dirname, 'src/config')
},
  };

  return config;
};