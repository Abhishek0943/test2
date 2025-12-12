// src/db.js
const { Pool } = require('pg');
require('dotenv').config();

// In your Render + Aiven setup, we ALWAYS use DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // 👇 This is the important part for self-signed certs
  ssl: {
    rejectUnauthorized: false,
  },
});

console.log('Using DATABASE_URL with SSL (rejectUnauthorized: false)');

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
  process.exit(1);
});

module.exports = {
  pool,
};
