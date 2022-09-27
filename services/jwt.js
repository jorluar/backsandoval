'use strict'

var jwt = require('jwt-simple')
var moment = require('moment')

exports.createToken = (user) =>{
    var payload = {
        sub: user.usr_id,
        usr_usuario: user.usr_usuario,
        usr_perfil: user.usr_perfil,
        usr_sts: user.usr_sts,
        emp_id: user.emp_id,
        iat: moment().unix(), // fecha de creacion de token
        exp: moment().add(10, 'days').unix // fecha de expiracion de token
    }
    return jwt.encode(payload, 'secret-key-to-generate-the-token-8989')
}