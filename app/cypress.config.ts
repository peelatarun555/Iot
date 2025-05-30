import { defineConfig } from "cypress";

function getConfigurationByFile(file: string) {
  const pathToConfigFile = require("path").resolve(
    "..",
    "app",
    "cypress",
    "config",
    `${file}.json`
  );
  return require("fs-extra").readJson(pathToConfigFile);
}

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      const file = config.env["configFile"] || "dev";
      return getConfigurationByFile(file);
    },
  },

  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
    },
    supportFile: "cypress/support/component.ts",
    specPattern: "**/*.cy.ts",
  },
});
