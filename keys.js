//--Parametros de Heroku
const vhost = process.env.HRKU_HOST || 'localhost'
const vuser = process.env.HRKU_USR || 'root'
const vpasw = process.env.HRKU_PWD || 'BDcomsandoval23*!'
const vdatb = process.env.HRKU_DB || 'dbsandoval'

module.exports = {
    database: {
        host: vhost,
        user: vuser,
        password: vpasw,
        database: vdatb
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