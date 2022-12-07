'use strict'

const mysql = require('mysql');

const vhost = 'containers-us-west-148.railway.app'
const vuser = 'root'
const vpasw = '6nhJOvtznYDASaGEYhmP'
const vdatb = 'railway'

const pool = mysql.createConnection({
    connectionLimit : 1000,
    connectTimeout  : 60 * 60 * 1000,
    acquireTimeout  : 60 * 60 * 1000,
    timeout         : 60 * 60 * 1000,
    host: vhost,
    user: vuser,
    password: vpasw,
    database: vdatb,
    port: 6659
});

pool.connect((error)=>{
    if(error){
        console.error('El error de conexión es: ' + error)
        return
    }
    console.log("BD connected successed")
});

module.exports = pool;