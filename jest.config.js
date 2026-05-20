const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.json");

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(t|j)sx?$": "babel-jest",
  },
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions?.paths || {}, {
      prefix: '<rootDir>/',
    }),
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};