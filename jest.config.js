module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{ts}"],
  coverageDirectory: "coverage",
  coverageReporters: ["json-summary", "text", "text-summary", "lcov"],
  errorOnDeprecated: true,
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json"
    }
  },
  moduleFileExtensions: ["ts", "js"],
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*\\.test\\.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  }
};
