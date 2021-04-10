exports.webpack = (config) =>
  Object.assign(config, {
    target: 'electron-renderer',
    devtool: 'cheap-module-source-map',
    plugins: config.plugins.filter(
      (p) => p.constructor.name !== 'UglifyJsPlugin'
    ),
  });

exports.exportPathMap = () => ({
  '/cropper': { page: '/cropper' },
  '/main': { page: '/main' },
  '/preferences': { page: '/preferences' },
  '/worker': { page: '/worker' },
});
