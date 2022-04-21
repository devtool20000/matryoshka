/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testMatch:["**/__tests__/**/*Test.ts"],
  testPathIgnorePatterns:["dist"],
  testEnvironment: 'node',
};
