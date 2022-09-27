'use strict'

const validator = require('validator')
const mysqlConnection = require('../database');

const controller = {
    save: (req, res) => {
		//-- Recoger los parámetros de la petición
		var params = req.body

		//-- Validar los datos
		try{
            var validate_codigo = !validator.isEmpty(params.chwcafe_codigo);
            var validate_descrip = !validator.isEmpty(params.chwcafe_descripcion);
            var validate_idwcafe = !validator.isEmpty(params.dtwcafe_id);                        
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
		if(validate_codigo && validate_descrip && validate_idwcafe){
			//-- Crear objeto de característica de cafe
            const {chwcafe_codigo, chwcafe_descripcion, dtwcafe_id} = params;
            const query = `
                INSERT INTO cstb_chweight (chwcafe_codigo, chwcafe_descripcion, dtwcafe_id) VALUES (?, ?, ?);
            `
            mysqlConnection.query(query, [chwcafe_codigo, chwcafe_descripcion, dtwcafe_id], (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar característica de cafe!",
                        error: err
                    })  
                }
                return res.status(200).send({
                    status: "success",
                    chcafe: rows
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
		//--Recoger datos del característica de cafe
		var params = req.body;

        //-- Validar los datos
        try{
            var validate_idchcafe = !validator.isEmpty(params.chwcafe_id);
            var validate_codigo = !validator.isEmpty(params.chwcafe_codigo);
            var validate_descrip = !validator.isEmpty(params.chwcafe_descripcion);
            var validate_idwcafe = !validator.isEmpty(params.dtwcafe_id);                        
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
        if(validate_idchcafe && validate_codigo && validate_descrip && validate_idwcafe){
            //--Comprobar si nuevo característica de cafe existe en base de datos--//
            mysqlConnection.query("SELECT * FROM cstb_chweight WHERE chwcafe_id = "+params.chwcafe_id+";", (err, chcafe, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al buscar característica de cafe específico!"
                    })  
                }
                if (chcafe.length > 0) {
                    //-- Si existe --//
                    //-- Crear objeto de característica de cafe
                    const {chwcafe_codigo, chwcafe_descripcion, dtwcafe_id, chwcafe_id} = params;
                    const query = `
                        UPDATE cstb_chweight SET chwcafe_codigo=?, chwcafe_descripcion=?, dtwcafe_id=? WHERE chwcafe_id=?;
                    `;
                    //--Actualizar información del característica de cafe--//
                    mysqlConnection.query(query, [chwcafe_codigo, chwcafe_descripcion, dtwcafe_id, chwcafe_id], (err, rows, fields)=>{
                        if(err){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al actualizar característica de cafe!",
                                error: err
                            })  
                        }
                        return res.status(200).send({
                            status: "success",
                            chcafe: rows
                        });        
                    }); 
                }else{
                    return res.status(500).send({
                        status: "Empty",
                        message: "El característica de cafe "+params.chwcafe_id+" no está registrada!"
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
		mysqlConnection.query("SELECT chwcafe_id, chwcafe_codigo FROM cstb_chweight ORDER BY chwcafe_descripcion;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar característica de cafees!"
                })  
            }
            return res.status(200).send({
                status: "success",
                chcafe: rows
            });        
        })
    },
    showg: (req, res) => {
		mysqlConnection.query("SELECT * FROM cstb_chweight ORDER BY chwcafe_descripcion;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar característica de cafees!"
                })  
            }
            return res.status(200).send({
                status: "success",
                chcafe: rows
            });        
        })
    }
}

module.exports = controller;