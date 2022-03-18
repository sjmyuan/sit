module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // config.resolve.fallback.fs = false;
      config.target = 'electron-renderer';
    }

    // config.target = 'electron-renderer';

    return config;
  },

  exportPathMap: () => ({
    '/cropper': { page: '/cropper' },
    '/main': { page: '/main' },
    '/preferences': { page: '/preferences' },
    '/worker': { page: '/worker' },
  }),
};
