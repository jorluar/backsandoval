'use strict'

const validator = require('validator')
const mysqlConnection = require('../database');

const controller = {
    save: (req, res) => {
		//-- Recoger los parámetros de la petición
		var params = req.body

		//-- Validar los datos
		try{
            var validate_nombre = !validator.isEmpty(params.mant_nombre);
            var validate_descrip = !validator.isEmpty(params.mant_descripcion);                   
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
		if(validate_nombre && validate_descrip){
			//-- Crear objeto de tipo de mantenimiento
            const {mant_nombre, mant_descripcion} = params;
            const query = `
                INSERT INTO cstb_maintenancevh (mant_nombre, mant_descripcion) VALUES (?, ?);
            `
            mysqlConnection.query(query, [mant_nombre, mant_descripcion], (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar tipo de mantenimiento!",
                        error: err
                    })  
                }
                return res.status(200).send({
                    status: "success",
                    maintenance: rows.insertId
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
		//--Recoger datos del tipo de mantenimiento
		var params = req.body;

        //-- Validar los datos
        try{
            var validate_nombre = !validator.isEmpty(params.mant_nombre);
            var validate_descrip = !validator.isEmpty(params.mant_descripcion);                   
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
        if(validate_nombre && validate_descrip){
            //--Comprobar si nuevo tipo de mantenimiento existe en base de datos--//
            mysqlConnection.query("SELECT * FROM cstb_maintenancevh WHERE mant_id = "+params.mant_id+";", (err, mantvh, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al buscar tipo de mantenimiento específico!"
                    })  
                }
                if (mantvh.length > 0) {
                    //-- Si existe --//
                    //-- Crear objeto de tipo de mantenimiento
                    const {mant_nombre, mant_descripcion, mant_id} = params;
                    const query = `
                        UPDATE cstb_maintenancevh SET mant_nombre=?, mant_descripcion=? WHERE mant_id=?;
                    `;
                    //--Actualizar información del tipo de mantenimiento--//
                    mysqlConnection.query(query, [mant_nombre, mant_descripcion, mant_id], (err, rows, fields)=>{
                        if(err){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al actualizar tipo de mantenimiento!",
                                error: err
                            })  
                        }
                        return res.status(200).send({
                            status: "success",
                            maintenance: rows
                        });        
                    }); 
                }else{
                    return res.status(500).send({
                        status: "Empty",
                        message: "El tipo de mantenimiento "+params.mant_id+" no está registrado!"
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
		mysqlConnection.query("SELECT mant_id, mant_nombre FROM cstb_maintenancevh ORDER BY mant_nombre;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar tipo de mantenimientos!"
                })  
            }
            return res.status(200).send({
                status: "success",
                maintenances: rows
            });        
        })
    },
    showg: (req, res) => {
		mysqlConnection.query("SELECT * FROM cstb_maintenancevh ORDER BY mant_nombre;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar tipo de mantenimientoes!"
                })  
            }
            return res.status(200).send({
                status: "success",
                maintenances: rows
            });        
        })
    }
}

module.exports = controller;