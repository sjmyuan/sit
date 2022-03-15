module.exports.webpack = (config) =>
  Object.assign(config, {
    // target: 'electron11.5-renderer',
    resolve: {
      fallback: { fs: false },
    },
  });

module.exports.exportPathMap = () => ({
  '/cropper': { page: '/cropper' },
  '/main': { page: '/main' },
  '/preferences': { page: '/preferences' },
  '/worker': { page: '/worker' },
});
