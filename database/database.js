const pg = require('pg');

const pool = new pg.Pool({
    user: 'postgres',
    host: '143.244.222.127',
    database: 'monitors',
    password: 'thisistooeasy',
    port: 5432,
});

module.exports = pool;