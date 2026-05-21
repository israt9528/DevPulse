import { pool } from ".";

export const createSchema = async () => {
  await pool.query(`
       CREATE TABLE IF NOT EXISTS users(
       id SERIAL PRIMARY KEY,
       name VARCHAR(25) NOT NULL,
       email VARCHAR(250) UNIQUE NOT NULL,
       password TEXT NOT NULL,
       role VARCHAR(25) NOT NULL DEFAULT 'contributor',

       created_at TIMESTAMP NOT NULL DEFAULT NOW(),
       updated_at TIMESTAMP NOT NULL DEFAULT NOW()
       ) 
        `);
  await pool.query(`
        CREATE TABLE IF NOT EXISTS issues(
       id SERIAL PRIMARY KEY,
       title VARCHAR(150) NOT NULL,
       description TEXT NOT NULL CHECK (char_length(description) >= 20),
       type VARCHAR(20) NOT NULL,
       status VARCHAR(20) NOT NULL DEFAULT 'open',
       reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

       created_at TIMESTAMP NOT NULL DEFAULT NOW(),
       updated_at TIMESTAMP NOT NULL DEFAULT NOW()
       ) 
            `);
};
