import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'pokemon',
    password: '251998',
    port: 5432
})