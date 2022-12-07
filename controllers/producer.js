'use strict'

const validator = require('validator')
//const mysqlConnection = require('../db');
const mysqlConnection = require('../database');

const controller = { 
    save: (req, res) => {
		//-- Recoger los parámetros de la petición
		var params = req.body

		//-- Validar los datos
		try{
            var validate_nombre = !validator.isEmpty(params.prod_nombre);
            var validate_telefono = !validator.isEmpty(params.prod_telefono);
            var validate_identidad = !validator.isEmpty(params.prod_identidad);
            var validate_rtn = !validator.isEmpty(params.prod_rtn);
            var validate_sts = !validator.isEmpty(params.prod_sts);
            var validate_tipo = !validator.isEmpty(params.prod_tipo);          
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
		if(validate_nombre && validate_telefono && validate_identidad && validate_rtn && validate_sts && validate_tipo){
			//-- Crear objeto de productor
            const {prod_nombre, prod_telefono, prod_identidad, prod_rtn, prod_sts, prod_tipo, prod_clave, prod_libro, add_id} = params;
            const query = `
                INSERT INTO cstb_producers (prod_nombre, prod_telefono, prod_identidad, prod_rtn, prod_sts, prod_saldo, prod_tipo, prod_clave, prod_libro, add_id) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?);
            `
            mysqlConnection.query(query, [prod_nombre, prod_telefono, prod_identidad, prod_rtn, prod_sts, prod_tipo, prod_clave, prod_libro, add_id], (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar productor!",
                        error: err
                    })  
                }
                return res.status(200).send({
                    status: "success",
                    producer: rows.insertId
                });        
            });
		}else{
			return res.status(500).send({
				status: "Error",
				message: "Datos vacíos, intente de nuevo!"
			}) 
		}
	},
    update: (req, res) => {
		//--Recoger datos del productor
		var params = req.body;

        //-- Validar los datos
        try{
            var validate_nombre = !validator.isEmpty(params.prod_nombre);
            var validate_telefono = !validator.isEmpty(params.prod_telefono);
            var validate_identidad = !validator.isEmpty(params.prod_identidad);
            var validate_rtn = !validator.isEmpty(params.prod_rtn);
            var validate_sts = !validator.isEmpty(params.prod_sts);
            var validate_tipo = !validator.isEmpty(params.prod_tipo);           
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
        if(validate_nombre && validate_telefono && validate_identidad && validate_rtn && validate_sts && validate_tipo){
            //--Comprobar si nuevo productor existe en base de datos--//
            mysqlConnection.query("SELECT * FROM cstb_producers WHERE prod_id = "+params.prod_id+";", (err, producer, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al buscar productor específico!"
                    })  
                }
                if (producer.length > 0) {
                    //-- Si existe --//
                    //-- Crear objeto de productor
                    const {prod_nombre, prod_telefono, prod_identidad, prod_rtn, prod_sts, prod_tipo, prod_clave, prod_libro, add_id, prod_id} = params;
                    const query = `
                        UPDATE cstb_producers SET prod_nombre=?, prod_telefono=?, prod_identidad=?, prod_rtn=?, prod_sts=?, prod_tipo=?, prod_clave=?, prod_libro=?, add_id=? WHERE prod_id=?;
                    `;
                    //--Actualizar información del productor--//
                    mysqlConnection.query(query, [prod_nombre, prod_telefono, prod_identidad, prod_rtn, prod_sts, prod_tipo, prod_clave, prod_libro, add_id, prod_id], (err, rows, fields)=>{
                        if(err){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al actualizar productor!",
                                error: err
                            })  
                        }
                        return res.status(200).send({
                            status: "success",
                            producer: rows
                        });        
                    }); 
                }else{
                    return res.status(500).send({
                        status: "Empty",
                        message: "El productor "+params.prod_id+" no está registrado!"
                    });  
                }
            });
        }else{
            return res.status(500).send({
                //--Validación de datos enviados incorrecta--//
				status: "Error",
				message: "Datos vacíos, intente de nuevo!"
			}); 
		}
    },
    show: (req, res) => {
		mysqlConnection.query("SELECT prod_id, prod_nombre FROM cstb_producers WHERE prod_sts = 'Habilitado' ORDER BY prod_nombre;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar productores!"
                })  
            }
            return res.status(200).send({
                status: "success",
                producers: rows
            });        
        })
    },
    showg: (req, res) => {
		mysqlConnection.query("SELECT * FROM cstb_producers WHERE prod_sts = 'Habilitado' ORDER BY prod_nombre;", (err, rows, fields)=>{
            if(err){
                console.log('upss: ' + JSON.stringify(err))
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar productores!",
                    error: err
                })  
            }
            return res.status(200).send({
                status: "success",
                producers: rows
            });        
        })
    },
    showp: (req, res) => {
        var idprod = req.params.id;
		mysqlConnection.query("SELECT p.prod_id, p.prod_nombre, p.prod_saldo, c.pres_fecha_pres, c.pres_monto, c.pres_motivo, c.pres_descripcion FROM cstb_producers As p INNER JOIN cstb_prestamos As c On p.prod_id=c.client_id WHERE p.prod_id = " + idprod + " and c.pres_tipo='Productor' and c.pres_sts = 'Activo' ORDER BY p.prod_nombre;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al buscar productor!"
                })  
            }
            if(rows.length > 0){
                return res.status(200).send({
                    status: "success",
                    prestamos: rows
                }); 
            }else{
                return res.status(200).send({
                    status: "empty",
                    message: "Productor sin deuda actualmente!"
                }); 
            }
                   
        })
    },
    showpre: (req, res) => {	
        mysqlConnection.query("SELECT distinct p.prod_id, p.prod_nombre, p.prod_saldo FROM cstb_producers As p INNER JOIN cstb_prestamos As c On p.prod_id=c.client_id WHERE c.pres_tipo='Productor' and c.pres_sts = 'Activo' ORDER BY p.prod_nombre;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al buscar productor!"
                })  
            }
            
            if(rows.length > 0){
                return res.status(200).send({
                    status: "success",
                    prestamos: rows
                }); 
            }else{
                return res.status(200).send({
                    status: "empty",
                    message: "Productor sin deuda actualmente!"
                }); 
            }
                   
        })
    }
}

module.exports = controller;