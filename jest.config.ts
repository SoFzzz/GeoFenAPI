import type { Config } from 'jest';

/**
 * Configuración de Jest para las pruebas unitarias (*.spec.ts dentro de src/).
 * @nestjs/typeorm es ESM puro y Jest lo carga como CommonJS, por eso se
 * redirige a un sustituto ligero (test/typeorm-shim.ts).
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
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};

export default config;
