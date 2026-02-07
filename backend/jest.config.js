module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  testTimeout: 10000
};