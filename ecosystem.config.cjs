module.exports = {
  apps: [
    {
      name: "raid-bot",
      script: "src/index.js",
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
