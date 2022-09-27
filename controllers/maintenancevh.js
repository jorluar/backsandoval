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
			//-- Crear objeto de mantenimiento de vehículo
            const {mant_nombre, mant_descripcion} = params;
            const query = `
                INSERT INTO cstb_maintenancevh (mant_nombre, mant_descripcion) VALUES (?, ?);
            `
            mysqlConnection.query(query, [mant_nombre, mant_descripcion], (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar mantenimiento de vehículo!",
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
				status: "Error",
				message: "Datos vacíos, intente de nuevo!"
			}) 
		}
	},
    update: (req, res) => {
		//--Recoger datos del mantenimiento de vehículo
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
            //--Comprobar si nuevo mantenimiento de vehículo existe en base de datos--//
            mysqlConnection.query("SELECT * FROM cstb_maintenancevh WHERE mant_id = "+params.mant_id+";", (err, mantvh, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al buscar mantenimiento de vehículo específico!"
                    })  
                }
                if (mantvh.length > 0) {
                    //-- Si existe --//
                    //-- Crear objeto de mantenimiento de vehículo
                    const {mant_nombre, mant_descripcion, mant_id} = params;
                    const query = `
                        UPDATE cstb_maintenancevh SET mant_nombre=?, mant_descripcion=? WHERE mant_id=?;
                    `;
                    //--Actualizar información del mantenimiento de vehículo--//
                    mysqlConnection.query(query, [mant_nombre, mant_descripcion, mant_id], (err, rows, fields)=>{
                        if(err){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al actualizar mantenimiento de vehículo!",
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
                        message: "El mantenimiento de vehículo "+params.mant_id+" no está registrado!"
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
		mysqlConnection.query("SELECT mant_id, mant_nombre, mant_descripcion FROM cstb_maintenancevh ORDER BY mant_nombre;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar mantenimiento de vehículos!"
                })  
            }
            return res.status(200).send({
                status: "success",
                maintenance: rows
            });        
        })
    },
    showg: (req, res) => {
		mysqlConnection.query("SELECT * FROM cstb_maintenancevh ORDER BY mant_nombre;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar mantenimiento de vehículos!"
                })  
            }
            return res.status(200).send({
                status: "success",
                maintenance: rows
            });        
        })
    }
}

module.exports = controller;