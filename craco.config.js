/**
 * CRACO Configuration
 * Override Create React App webpack config to fix CSS order warnings
 * This fixes the "Conflicting order" warnings from mini-css-extract-plugin
 */

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Find MiniCssExtractPlugin and set ignoreOrder to true
      // This prevents CSS order warnings during build
      const miniCssExtractPluginIndex = webpackConfig.plugins.findIndex(
        (plugin) => {
          // Check both constructor name and plugin name
          return (
            plugin.constructor.name === "MiniCssExtractPlugin" ||
            (plugin.constructor && plugin.constructor.name && plugin.constructor.name.includes("MiniCssExtract"))
          );
        }
      );

      if (miniCssExtractPluginIndex !== -1) {
        const plugin = webpackConfig.plugins[miniCssExtractPluginIndex];
        // Set ignoreOrder option to suppress CSS order warnings
        if (plugin.options) {
          plugin.options.ignoreOrder = true;
        } else {
          plugin.options = { ignoreOrder: true };
        }
      }

      // Also check optimization.splitChunks.cacheGroups for CSS
      if (webpackConfig.optimization && webpackConfig.optimization.splitChunks) {
        const splitChunks = webpackConfig.optimization.splitChunks;
        if (splitChunks.cacheGroups) {
          Object.keys(splitChunks.cacheGroups).forEach((key) => {
            const cacheGroup = splitChunks.cacheGroups[key];
            if (cacheGroup.type === "css/mini-extract") {
              // Ensure CSS chunks don't cause order conflicts
              cacheGroup.enforce = true;
            }
          });
        }
      }

      // Ensure webpack dev server uses correct publicPath in development
      // This prevents chunks from being loaded from wrong URL
      if (webpackConfig.output && process.env.NODE_ENV === 'development') {
        // In development, use relative paths or ensure publicPath is correct
        // webpack dev server will handle this automatically, but we ensure it's not overridden
        if (!webpackConfig.output.publicPath || webpackConfig.output.publicPath === 'auto') {
          // Let webpack dev server determine the correct publicPath
          webpackConfig.output.publicPath = '/';
        }
      }

      return webpackConfig;
    },
  },
  devServer: {
    // Ensure dev server is accessible and doesn't proxy static assets incorrectly
    onBeforeSetupMiddleware: (devServer) => {
      if (!devServer) {
        return;
      }
      console.log('✅ Webpack Dev Server running - access app at http://localhost:3000');
      console.log('⚠️  Do NOT access the app from http://localhost:4000 (backend)');
    },
  },
};

