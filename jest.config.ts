import type { Config } from 'jest';

/**
 * Configuración de Jest para las pruebas unitarias (*.spec.ts en src/).
 * Jest no carga @nestjs/typeorm ni @nestjs/config (ESM): se reemplazan por los shims de test/.
 */
const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'src/.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@nestjs/typeorm$': '<rootDir>/test/typeorm-shim.ts',
    '^@nestjs/config$': '<rootDir>/test/config-shim.ts',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};

export default config;
