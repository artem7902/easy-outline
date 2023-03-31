import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

export default {
  webpack: {
    configure: (webpackConfig: any) => {
      if (webpackConfig.resolve.plugins) {
        webpackConfig.resolve.plugins.push(new TsconfigPathsPlugin())
      }
      else {
        webpackConfig.resolve.plugins = [new TsconfigPathsPlugin()]
      }
      return webpackConfig;
    },
  },
};