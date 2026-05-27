/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/integration/**/*.test.js"],
  clearMocks: true,
  restoreMocks: true,
  coverageDirectory: "<rootDir>/coverage/integration",
  coverageReporters: ["text", "lcov"],
  testPathIgnorePatterns: ["/node_modules/"],
};
