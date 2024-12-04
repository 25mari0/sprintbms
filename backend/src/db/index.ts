// src/db/index.ts
import pgPromise from 'pg-promise';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Initialize pg-promise instance
const pgp = pgPromise();

// Create a database connection
const db = pgp({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

export default db;
