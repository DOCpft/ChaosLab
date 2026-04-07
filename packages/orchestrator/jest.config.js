module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],  // <-- добавить tests
  testMatch: ['**/*.spec.ts'],
};