'use strict'

var jwt = require('jwt-simple')
var moment = require('moment')
var secret = "secret-key-to-generate-the-token-8989"

exports.authenticated = (req, res, next) => {
   //-- Comprobar si llega autorización
	if(!req.headers.authorization){
		return res.status(403).send({
			status: 'Error',
			message: 'La petición no tiene la cabecera de authorization!'
		})
	}
	//-- Limpiar el token y quitar comillas
	var token = req.headers.authorization.replace(/['"]+/g, '')
	
	try{
		//-- Decodificar token
		var payload = jwt.decode(token, secret)
		//-- Comprobar si el token ha expirado
		if(payload.exp <= moment().unix()){
			return res.status(404).send({
				status: 'Error',
				message: 'El token ha expirado!'
			})
		}
	}catch(ex){
		return res.status(404).send({
			status: 'Error',
			message: 'El token no es valido!',
			token:token
		})
	}
	//-- Adjuntar usuario identificando a request
	req.user = payload

	//-- Pasar a la acción

   next()
}