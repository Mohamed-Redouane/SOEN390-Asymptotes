import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node", // Use Node.js as the test environment
    coverage: {
      provider: "v8", // Use the V8 engine for coverage
      reporter: ["text", "json", "html", "lcov"], // Generate coverage reports in multiple formats
      reportsDirectory: "./coverage", // Specify the directory to store coverage reports
      all: true, // Ensure all files are included in the report
      include: ["src/**/*.{js,ts}"], // Specify files/folders to include for coverage
      exclude: ["node_modules", "test", "**/*.test.ts"], // Exclude test files and irrelevant directories
    },
  },
});
