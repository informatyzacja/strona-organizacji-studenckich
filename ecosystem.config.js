module.exports = {
  apps: [
    {
      name: "app",
      script: "node_modules/.bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
