'use strict'

const validator = require('validator')
const mysqlConnection = require('../database');

const controller = {
    save: (req, res) => {
		//-- Recoger los parámetros de la petición
		var params = req.body

		//-- Validar los datos
		try{
            var validate_tipo = !validator.isEmpty(params.veh_tipo);
            var validate_marca = !validator.isEmpty(params.veh_marca);
            var validate_color = !validator.isEmpty(params.veh_color);
            var validate_placa = !validator.isEmpty(params.veh_placa);                      
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
		if(validate_tipo && validate_marca && validate_color && validate_placa){
			//-- Crear objeto de vehículo
            const {veh_tipo, veh_marca, veh_year, veh_placa, veh_color, veh_fechamt, veh_sts, veh_prop} = params;
            const query = `
                INSERT INTO cstb_vehicles (veh_tipo, veh_marca, veh_year, veh_placa, veh_color, veh_fechamt, veh_sts, veh_prop) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            `
            mysqlConnection.query(query, [veh_tipo, veh_marca, veh_year, veh_placa, veh_color, veh_fechamt, veh_sts, veh_prop], (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar vehículo!",
                        error: err
                    })  
                }
                return res.status(200).send({
                    status: "success",
                    vehicle: rows.insertId
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
		//--Recoger datos del vehículo
		var params = req.body;

        //-- Validar los datos
        try{
            var validate_tipo = !validator.isEmpty(params.veh_tipo);
            var validate_marca = !validator.isEmpty(params.veh_marca);
            var validate_color = !validator.isEmpty(params.veh_color);
            var validate_placa = !validator.isEmpty(params.veh_placa);                        
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
        if(validate_tipo && validate_marca && validate_color && validate_placa){
            //--Comprobar si nuevo vehículo existe en base de datos--//
            mysqlConnection.query("SELECT * FROM cstb_vehicles WHERE veh_id = "+params.veh_id+";", (err, vehicle, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al buscar vehículo específico!"
                    })  
                }
                if (vehicle.length > 0) {
                    //-- Si existe --//
                    //-- Crear objeto de vehículo
                    const {veh_tipo, veh_marca, veh_year, veh_placa, veh_color, veh_fechamt, veh_sts, veh_prop, veh_id} = params;
                    const query = `
                        UPDATE cstb_vehicles SET veh_tipo=?, veh_marca=?, veh_year=?, veh_placa=?, veh_color=?, veh_fechamt=?, veh_sts=?, veh_prop=? WHERE veh_id=?;
                    `;
                    //--Actualizar información del vehículo--//
                    mysqlConnection.query(query, [veh_tipo, veh_marca, veh_year, veh_placa, veh_color, veh_fechamt, veh_sts, veh_prop, veh_id], (err, rows, fields)=>{
                        if(err){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al actualizar vehículo!",
                                error: err
                            }); 
                        }
                        return res.status(200).send({
                            status: "success",
                            vehicles: rows
                        });        
                    }); 
                }else{
                    return res.status(500).send({
                        status: "Empty",
                        message: "El vehículo "+params.veh_id+" no está registrado!"
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
		mysqlConnection.query("SELECT veh_id, veh_tipo, veh_marca, veh_fechamt, concat(veh_marca, '-', veh_tipo) vehicle FROM cstb_vehicles ORDER BY veh_tipo;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar vehículos!"
                })  
            }
            return res.status(200).send({
                status: "success",
                vehicles: rows
            });        
        })
    },
    showg: (req, res) => {
		mysqlConnection.query("SELECT * FROM cstb_vehicles ORDER BY veh_tipo;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar vehículos!"
                })  
            }
            return res.status(200).send({
                status: "success",
                vehicles: rows
            });        
        })
    },
    delv: (req, res) => {
        var idv=req.params.id
		//--Verificar si existe el id de vehiculo en tabla de gastos
        mysqlConnection.query("SELECT * FROM cstb_expenses WHERE veh_id = " + idv, (err, rowv, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al consultar vehiculo en tabla gastos!"
                })  
            }
            if(rowv.length > 0){
                return res.status(200).send({
                    status: "exist"
                }); 
            }else{
                //--Eliminar Vehiculo de la BD
                mysqlConnection.query("DELETE FROM cstb_vehicles WHERE veh_id = " + idv, (err, row, fields)=>{
                    if(err){
                        return res.status(500).send({
                            status: "Error",
                            message: "Error al eliminar vehiculo de BD!"
                        })  
                    }
                    return res.status(200).send({
                        status: "success"
                    }); 
                })
            }       
        })
    }
}

module.exports = controller;