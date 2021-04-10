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
  '/editor': { page: '/editor' },
  '/preferences': { page: '/preferences' },
  '/browser': { page: '/browser' },
  '/worker': { page: '/worker' },
});
