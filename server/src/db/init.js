import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(here, '../../data'), { recursive: true });

const { db } = await import('./index.js');
db.exec(readFileSync(join(here, 'schema.sql'), 'utf8'));
console.log('Database initialised.');
