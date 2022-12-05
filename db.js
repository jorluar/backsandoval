//import { createPool } from "mysql2/promise";
const {createPool} = require('mysql2/promise');

const pool = createPool({
    user: 'root',
    password: '6nhJOvtznYDASaGEYhmP',
    host: 'containers-us-west-148.railway.app',
    port: 6659,
    database: 'railway'
});

/*
const pool = createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dbsandoval'
});*/

module.exports = pool;
