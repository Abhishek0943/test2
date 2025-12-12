// src/db.js
const { Pool } = require('pg');
require('dotenv').config();

const useUrl = !!process.env.DATABASE_URL;

const pool = new Pool(
  useUrl=  {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'modex_user',
        database: process.env.DB_NAME || 'modex_db',
      }
);
pool.on("connect", ()=>{
  console.log("success")
})
pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
  process.exit(1);
});

module.exports = {
  pool,
};
