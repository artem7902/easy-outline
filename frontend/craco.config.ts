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
      webpackConfig.module.rules.push({
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
          configFile: 'tsconfig.json',
        },
      })
      return webpackConfig;
    },
  }
};