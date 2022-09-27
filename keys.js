//--Parametros de Heroku
const vhost = process.env.HRKU_HOST
const vuser = process.env.HRKU_USR
const vpasw = process.env.HRKU_PWD
const vdatb = process.env.HRKU_DB

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