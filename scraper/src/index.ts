import { loadConfig } from './config';

/** Punto de entrada: carga la config y muestra lo que haría la ejecución. */
function main(): void {
  const config = loadConfig();

  console.log('GeoFen scraper');
  console.log(`- API: ${config.apiUrl}`);
  console.log(`- Ciudad: ${config.city}`);
  console.log(`- Fuentes: ${config.sources.join(', ')}`);
  console.log(`- Modo: ${config.dryRun ? 'dry run (no envía nada)' : 'envío real'}`);
  console.log(`- Pausa entre peticiones: ${config.requestDelayMs} ms`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
