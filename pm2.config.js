module.exports = {
  apps: [
    {
      name: 'FLOZABLE',
      script: 'app.js',
      env: {
        COMMON_VARIABLE: 'value',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
};