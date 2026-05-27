/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/unit/**/*.test.js"],
  clearMocks: true,
  restoreMocks: true,
  coverageDirectory: "<rootDir>/coverage/unit",
  coverageReporters: ["text", "lcov"],
  testPathIgnorePatterns: ["/node_modules/"],
};
