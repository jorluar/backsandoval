'use strict'

const { promisify } = require('util');
const mysql = require('mysql2');

const vhost = 'monorail.proxy.rlwy.net'
const vuser = 'root'
const vpasw = 'eHFEEg4-Had-6bFedc35f1fE4GcBcHa2'
const vdatb = 'railway'
const vport = '54346'

const pool = mysql.createPool({
    host: vhost,
    user: vuser,
    password: vpasw,
    database: vdatb,
    port: vport 
});

pool.getConnection((err, connection)=>{
    if(err){
        if(err.code == 'PROTOCOL_CONNECTION_LOST'){
            console.error('DATABASE CONNECTION WAS CLOSED.!');
        }
        if(err.code == 'ER_CON_COUNT_ERROR'){
            console.error('DATABASE HAS TO MANY CONNECTIONS');
        }
        if(err.code == 'ECONNREFUSED'){
            console.error('DATABASE CONNECTION WAS REFUSED');
        }
    }
    if(connection) connection.release();
    console.log('DB is connected.!')
    return;
});

//--Promisify Pool Query -- Convertir a promises lo que antes estaba en call back
pool.query = promisify(pool.query);

module.exports = pool;

/*
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dbsandoval'

----------------------------------------
    host: vhost,
    user: vuser,
    password: vpasw,
    database: vdatb,
    port: vport
*/