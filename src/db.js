// src/db.js
const { Pool } = require('pg');
require('dotenv').config();

// Check if DATABASE_URL is actually set
const hasDatabaseUrl =
  typeof process.env.DATABASE_URL === 'string' &&
  process.env.DATABASE_URL.trim() !== '';

const useUrl = hasDatabaseUrl;

// SSL config based on env
const ssl =
  process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false } // allow self-signed certs
    : false;                        // no SSL

const config = useUrl
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'modex_user',
      password: process.env.DB_PASSWORD || 'modex_password',
      database: process.env.DB_NAME || 'modex_db',
      ssl,
    };

console.log('DB CONFIG IN USE =>', {
  useUrl,
  host: config.host,
  database: config.database,
  ssl: !!config.ssl,
});

const pool = new Pool(config);

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
  process.exit(1);
});

module.exports = {
  pool,
};
