/** Jest config for root scripts/ (monorepo default rootDir is packages/). */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/scripts/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
}
