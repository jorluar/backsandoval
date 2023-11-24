//--Parametros de Heroku
/*const vhost = process.env.HRKU_HOST || 'localhost'
const vuser = process.env.HRKU_USR || 'root'
const vpasw = process.env.HRKU_PWD || 'BDcomsandoval23*!'
const vdatb = process.env.HRKU_DB || 'dbsandoval'
const vhost = 'containers-us-west-148.railway.app'
const vuser = 'cafe'
const vpasw = '6nhJOvtznYDASaGEYhmP23'
const vdatb = 'railway'*/

//--Parametros de Railway
const vhost = 'monorail.proxy.rlwy.net'
const vuser = 'root'
const vpasw = 'eHFEEg4-Had-6bFedc35f1fE4GcBcHa2'
const vdatb = 'railway'
const vport = 54346

module.exports = {
    database: {
        connectTimeout  : 60 * 60 * 1000,
        acquireTimeout  : 60 * 60 * 1000,
        timeout         : 60 * 60 * 1000,
        host: vhost,
        user: vuser,
        password: vpasw,
        database: vdatb,
        port: vport
    }
};

/*
host: vhost,
        user: vuser,
        password: vpasw,
        database: vdatb

 host: 'localhost',
        user: 'root',
        password: '',
        database: 'dbsandoval'
*/
/*
connectionLimit : 1000,
        connectTimeout  : 60 * 60 * 1000,
        acquireTimeout  : 60 * 60 * 1000,
        timeout         : 60 * 60 * 1000,
        host: vhost,
        user: vuser,
        password: vpasw,
        database: vdatb,
        port:6659
*/