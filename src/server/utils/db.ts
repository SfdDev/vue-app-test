// @ts-ignore — типов для 'pg' нет, используем как any
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || process.env.DB_HOST_DOCKER || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
});

pool.on('error', (err: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export function getDbPool() {
  return pool;
}


