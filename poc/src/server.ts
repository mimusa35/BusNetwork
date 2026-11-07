import { createSeededStore } from './seed.js';
import { createApp } from './web/app.js';

/**
 * Entry point: `npm start`. Serves the POC on PORT (default 3000) with the
 * seeded demo data held in memory. No external services or credentials.
 */

function readPort(): number {
  const text = process.env.PORT ?? '3000';
  const port = Number(text);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`PORT must be an integer between 1 and 65535, got "${text}"`);
  }
  return port;
}

function main(): void {
  const port = readPort();
  const store = createSeededStore();
  const app = createApp({ store });
  const server = app.listen(port, () => {
    console.log(JSON.stringify({ level: 'INFO', message: `BusNetwork POC listening on http://localhost:${port}` }));
  });
  server.on('error', (error: NodeJS.ErrnoException) => {
    const hint = error.code === 'EADDRINUSE' ? ` Port ${port} is in use; set PORT to another value.` : '';
    console.error(JSON.stringify({ level: 'ERROR', message: `Server failed to start: ${error.message}.${hint}` }));
    process.exit(1);
  });
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({ level: 'ERROR', message: (error as Error).message }));
  process.exit(1);
}
