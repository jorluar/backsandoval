//--Parametros de Heroku
/*const vhost = process.env.HRKU_HOST || 'localhost'
const vuser = process.env.HRKU_USR || 'root'
const vpasw = process.env.HRKU_PWD || 'BDcomsandoval23*!'
const vdatb = process.env.HRKU_DB || 'dbsandoval'*/
const vhost = 'containers-us-west-148.railway.app'
const vuser = 'cafe'
const vpasw = '6nhJOvtznYDASaGEYhmP23'
const vdatb = 'railway'

module.exports = {
    database: {
        connectionLimit : 1000,
        connectTimeout  : 60 * 60 * 1000,
        acquireTimeout  : 60 * 60 * 1000,
        timeout         : 60 * 60 * 1000,
        host: vhost,
        user: vuser,
        password: vpasw,
        database: vdatb,
        port:6659
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