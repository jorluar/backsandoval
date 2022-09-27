'use strict'
const validator = require('validator')
const jwt = require('../services/jwt')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const mysqlConnection = require('../database');

const controller = {
    save: (req, res) => {
		//-- Recoger los parámetros de la petición
		var params = req.body;

		//-- Validar los datos
		try{
            var validate_usuario = !validator.isEmpty(params.usr_usuario);
            var validate_contrasena = !validator.isEmpty(params.usr_contrasena);
            var validate_perfil = !validator.isEmpty(params.usr_perfil);
            var validate_sts = !validator.isEmpty(params.usr_sts);
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
        //--Comprobar validación--//
		if(validate_usuario && validate_contrasena && validate_perfil && validate_sts){
			//--Comprobar si nuevo usuario existe en base de datos--//
            mysqlConnection.query("SELECT * FROM cstb_users WHERE usr_usuario = '"+params.usr_usuario+"';", (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al buscar usuario específico!"
                    })  
                }
                if (rows.length > 0) {
                    //-- Si existe --//
                    return res.status(500).send({
                        status: "exist",
                        message: "El usuario "+params.usr_usuario+" ya está registrado!"
                    })  
                }
            });
            //-- Crear objeto de usuario
            const {usr_usuario, usr_perfil, usr_sts, emp_id} = params;
            const query = `
                INSERT INTO cstb_users (usr_usuario, usr_contrasena, usr_perfil, usr_sts, emp_id) VALUES (?, ?, ?, ?, ?);
            `;
            //--Comprobar si usuario existe
            mysqlConnection.query("SELECT * FROM cstb_users WHERE usr_usuario = '"+params.usr_usuario+"';", (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al buscar usuario específico!"
                    })  
                }
                if (rows.length > 0) {
                    //-- Si existe
					return res.status(500).send({
						status: "Error",
						message: "El usuario "+params.usr_usuario+" ya está registrado!"
					})  
                }else{
                   //-- Si no existe
					//-- Cifrar la contraseña
					bcrypt.hash(params.usr_contrasena, saltRounds).then(function(hash) {
                        //--Registrar nuevo usuario--//
                        mysqlConnection.query(query, [usr_usuario, hash, usr_perfil, usr_sts, emp_id], (err, rows, fields)=>{
                            if(err){
                                return res.status(500).send({
                                    status: "Error",
                                    message: "Error al registrar usuario!",
                                    error: err
                                })  
                            }
                            return res.status(200).send({
                                status: "success",
                                user: rows.insertId
                            });        
                        });
					}); // Close Bcrypt
                }        
            })
		}else{
            return res.status(500).send({
                //--Validación de datos enviados incorrecta--//
				status: "Error",
				message: "Datos vacíos, intente de nuevo!"
			}) 
		}
	},
    update: (req, res) => {
		//--Recoger datos del usuario
		var params = req.body
       
        //-- Validar los datos
		try{
            var validate_usuario = !validator.isEmpty(params.usr_usuario);
            var validate_contrasena = !validator.isEmpty(params.usr_contrasena);
            var validate_perfil = !validator.isEmpty(params.usr_perfil);
            var validate_sts = !validator.isEmpty(params.usr_sts);
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
		if(validate_usuario && validate_contrasena && validate_perfil && validate_sts){
            if(params.usr_contrasena != 'admin123'){
                //console.log('pass cambio')
                //--Obtener la contraseña de la base de datos--//
                mysqlConnection.query("SELECT usr_contrasena FROM cstb_users WHERE usr_id = '"+params.usr_id+"';", (err, rowsu, fields)=>{
                    if(err){
                        return res.status(500).send({
                            status: "Error",
                            message: "Error al buscar usuario específico!"
                        })  
                    }
                    if (rowsu.length > 0) {
                        //-- Si existe --//
                        var passdb = rowsu[0].usr_contrasena;
                        const {usr_usuario, usr_perfil, usr_sts, emp_id, usr_id} = params;
                        //--Comprobar si se cambia la contraseña
                        bcrypt.compare(params.usr_contrasena, passdb, (err, check) => {
                            if(err){
                                return res.status(500).send({
                                    status: "Error",
                                    message: "Error al comparar contraseña"
                                })  
                            }
                            if(check){
                                //console.log('son iguales')
                                //-- Crear objeto de usuario
                                const query = `
                                    UPDATE cstb_users SET usr_usuario=?, usr_perfil=?, usr_sts=?, emp_id=? WHERE usr_id=?;
                                `;
                                //--Actualizar información del usuario--//
                                mysqlConnection.query(query, [usr_usuario, usr_perfil, usr_sts, emp_id, usr_id], (err, rows, fields)=>{
                                    if(err){
                                        return res.status(500).send({
                                            status: "Error",
                                            message: "Error al actualizar usuario!",
                                            error: err
                                        })  
                                    }
                                    return res.status(200).send({
                                        status: "success",
                                        user: rows
                                    });        
                                });
                                
                            }else{
                                //console.log('son diferentes')
                                 //--Cifrar contraseña--//
                                bcrypt.hash(params.usr_contrasena, saltRounds).then(function(hash) {
                                    //-- Crear objeto de usuario
                                    const query = `
                                        UPDATE cstb_users SET usr_usuario=?, usr_contrasena=?, usr_perfil=?, usr_sts=?, emp_id=? WHERE usr_id=?;
                                    `;
                                    //--Actualizar información del usuario--//
                                    mysqlConnection.query(query, [usr_usuario, hash, usr_perfil, usr_sts, emp_id, usr_id], (err, rows, fields)=>{
                                        if(err){
                                            return res.status(500).send({
                                                status: "Error",
                                                message: "Error al actualizar usuario!",
                                                error: err
                                            })  
                                        }
                                        return res.status(200).send({
                                            status: "success",
                                            user: rows
                                        });        
                                    });
                                });
                            }
                        }) 
                    }else{
                        //-- Si existe --//
                        return res.status(500).send({
                            status: "error",
                            message: "No se encontró el usuario en la BD."
                        })  
                    }
                });
            }else{
                //console.log('no cambio..')
                //-- Crear objeto de usuario
                const {usr_usuario, usr_perfil, usr_sts, emp_id, usr_id} = params;
                const query = `
                    UPDATE cstb_users SET usr_usuario=?, usr_perfil=?, usr_sts=?, emp_id=? WHERE usr_id=?;
                `;
                //--Actualizar información del usuario--//
                mysqlConnection.query(query, [usr_usuario, usr_perfil, usr_sts, emp_id, usr_id], (err, rows, fields)=>{
                    if(err){
                        return res.status(500).send({
                            status: "Error",
                            message: "Error al actualizar usuario!",
                            error: err
                        })  
                    }
                    return res.status(200).send({
                        status: "success",
                        user: rows
                    });        
                });
            }
        }else{
            return res.status(500).send({
                //--Validación de datos enviados incorrecta--//
				status: "Error",
				message: "Datos vacíos, intente de nuevo!"
			}) 
		}
	},
    login: (req, res) => {
		// Recoger los parametros de la petición
		var params = req.body
        
		// Validar los datos
		try{
			var validate_usuario = !validator.isEmpty(params.usr_usuario)
			var validate_contrasena = !validator.isEmpty(params.usr_contrasena)
		}catch(err){
			return res.status(200).send({
				status: "Success",
                type: "Empty",
				message: "Faltan datos intente de nuevo!"
			}) 
		}

		if(!validate_usuario && !validate_contrasena){
            //--Comprobar validación--//
			return res.status(200).send({
				message: "Los datos son incorrectos"
			})
		}
		// Buscar usuario que coincidan con el nombre ingresado--//
        mysqlConnection.query("SELECT usr_id, usr_usuario, usr_contrasena, usr_image FROM cstb_users WHERE usr_usuario = '"+params.usr_usuario+"';", (err, user, fields)=>{
            if(err){
                console.log('clavo: '+err)
                console.log(params.usr_usuario)
                return res.status(500).send({
                    status: "Error",
                    message: "Error al buscar usuario específico!"
                })  
            }
            if (user.length > 0) {
                //-- Si existe --//
                //console.log('compara passw: ' + params.usr_contrasena + ' pass bd: ' + passdb)
                var passdb = user[0].usr_contrasena;
                return res.status(200).send({
                    status: "Success",
                    type: "Ok",
                    message: "Login correcto!",
                    token: jwt.createToken(user),
                    usr: user
                })
                //-- Comprobar contraseña
				bcrypt.compare(params.usr_contrasena, passdb, (err, check) => {
					if(err){
                        //console.log(err)
						return res.status(500).send({
							status: "Error",
							message: "Error al comparar contraseña"
						})  
					}
					if(check){
                        //console.log('data user: ' + JSON.stringify(user))
						//--Generar Token de jwt 
						//--Comprobar si llega parametro gettoken
						if(params.gettoken){
							return res.status(200).send({
								status: "Success",
                                type: "Ok",
								message: "Login correcto!",
								token: jwt.createToken(user),
                                usr: user
							})
						}else{
							//--
							return res.status(200).send({
                                status: "Success",
                                type: "Ok",
								message: "Login correcto!",
								user: user
							})
						}
					}else{
                        //console.log('passw no coinciden')
						return res.status(200).send({
							status: "Success",
                            type: "Npassword",
							message: "Contraseña no coincide!"
						})
					}
				});
            }else{
                console.log('usuario no encontrado')
                //-- No existe --//
                return res.status(200).send({
                    status: "Success",
                    type: "Empty",
                    message: "El usuario "+params.usr_usuario+" no está registrado!"
                });
            }
        });
	},
    show: (req, res) => {
		mysqlConnection.query("SELECT * FROM cstb_users As u INNER JOIN cstb_employees As e ON (u.emp_id = e.emp_id) ORDER BY u.usr_usuario;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar usuarios!"
                })  
            }
            return res.status(200).send({
                status: "success",
                users: rows
            });        
        })
    }
} 

module.exports = controller;