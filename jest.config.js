// jest.config.js

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src/'],
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['**/__tests__/**/*.+(ts|js)'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
};
