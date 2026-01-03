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

      return webpackConfig;
    },
  },
};

