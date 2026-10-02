const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'postgres', // Connect to default DB
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect()
  .then(() => client.query('CREATE DATABASE eticaret_db'))
  .then(() => {
    console.log('Database eticaret_db created successfully.');
    client.end();
  })
  .catch(err => {
    console.error('Error creating database:', err.message);
    client.end();
  });
