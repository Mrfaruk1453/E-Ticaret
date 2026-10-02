const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Veritabanı bağlantı hatası:', err.message);
  } else {
    console.log('Veritabanı bağlantısı başarılı! Zaman:', res.rows[0].now);
  }
  pool.end();
});
