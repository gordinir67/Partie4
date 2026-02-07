module.exports = {
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
  },
  preset: 'jest-preset-angular',

  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],

  bail: false,
  verbose: false,

  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/'],

  collectCoverage: true,
coverageDirectory: 'coverage/unit',
coverageReporters: ['html', 'lcov', 'text-summary'],

  collectCoverageFrom: [
    '<rootDir>/src/app/**/*.ts',
    '!<rootDir>/src/main.ts',
    '!<rootDir>/src/polyfills.ts',
    '!<rootDir>/src/**/environment*.ts',
    '!<rootDir>/src/**/*.module.ts',
  ],

  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      lines: 80,
      functions: 80,
    },
  },

  roots: ['<rootDir>'],
  modulePaths: ['<rootDir>'],
  moduleDirectories: ['node_modules'],
};
