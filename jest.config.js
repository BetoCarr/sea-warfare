
/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',

    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
    },

    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },

    testPathIgnorePatterns: [
        '/node_modules/',
        '/.next/',
    ]
};