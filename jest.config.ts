module.exports = {
  clearMocks: true,
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
    "^@src/(.*)$": "<rootDir>/src/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
  },
};
