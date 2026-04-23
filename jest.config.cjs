/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'js', 'hbs'],
  moduleNameMapper: {
    '^(.*)\\.hbs\\?raw$': '$1.hbs',
    '\\.css$': '<rootDir>/tools/jest-empty-module.cjs',
  },
  transform: {
    '^.+\\.hbs$': '<rootDir>/tools/jest-hbs-string.cjs',
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.jest.json',
      },
    ],
  },
};
