const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotsFolder: "cypress/screenshots",
    videosFolder: "cypress/videos",
    retries: {
      runMode: 2,
      openMode: 0,
    },
    setupNodeEvents(on, config) {
      require("@cypress/code-coverage/task")(on, config);
      return config;
    },
    experimentalInteractiveRunEvents: true, // Required for newer Cypress versions to track coverage
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
  env: {
    coverage: true, // Enables coverage tracking
  },
});
