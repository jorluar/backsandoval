'use strict'

const validator = require('validator')
const mysqlConnection = require('../database');

const controller = {
    save: (req, res) => {
		//-- Recoger los parámetros de la petición
		var params = req.body

		//-- Validar los datos
		try{
            var validate_fecha = !validator.isEmpty(params.inc_fecha);
            var validate_descrip = !validator.isEmpty(params.inc_descripcion);                        
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
		if(validate_fecha && validate_descrip){
			//-- Crear objeto de ingresos
            const {inc_fecha, inc_cant, inc_descripcion, tp_incexp, usr_id} = params;
            const query = `
                INSERT INTO cstb_incomes (inc_fecha, inc_cant, inc_descripcion, tp_incexp, usr_id) VALUES (?, ?, ?, ?, ?);
            `
            mysqlConnection.query(query, [inc_fecha, inc_cant, inc_descripcion, tp_incexp, usr_id], (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar ingresos!",
                        error: err
                    })  
                }
                return res.status(200).send({
                    status: "success",
                    income: rows.insertId
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
		//--Recoger datos del ingresos
		var params = req.body;

        //-- Validar los datos
        try{
            var validate_fecha = !validator.isEmpty(params.inc_fecha);
            var validate_descrip = !validator.isEmpty(params.inc_descripcion);                      
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
        if(validate_fecha && validate_descrip){
            //--Comprobar si nuevo ingresos existe en base de datos--//
            mysqlConnection.query("SELECT * FROM cstb_incomes WHERE inc_id = "+params.inc_id+";", (err, income, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al buscar ingreso específico!"
                    })  
                }
                if (income.length > 0) {
                    //-- Si existe --//
                    //-- Crear objeto de ingresos
                    const {inc_fecha, inc_cant, inc_descripcion, tp_incexp, usr_id, inc_id} = params;
                    const query = `
                        UPDATE cstb_incomes SET inc_fecha=?, inc_cant=?, inc_descripcion=?, tp_incexp=?, usr_id=? WHERE inc_id=?;
                    `;
                    //--Actualizar información del ingresos--//
                    mysqlConnection.query(query, [inc_fecha, inc_cant, inc_descripcion, tp_incexp, usr_id, inc_id], (err, rows, fields)=>{
                        if(err){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al actualizar ingresos!",
                                error: err
                            })  
                        }
                        return res.status(200).send({
                            status: "success",
                            income: rows
                        });        
                    }); 
                }else{
                    return res.status(500).send({
                        status: "Empty",
                        message: "El ingresos "+params.inc_id+" no está registrado!"
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
		mysqlConnection.query("SELECT inc_id, inc_fecha, inc_descripcion, usr_id FROM cstb_incomes ORDER BY inc_fecha;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar ingresoss!"
                })  
            }
            return res.status(200).send({
                status: "success",
                incomes: rows
            });        
        });
    },
    showg: (req, res) => {
		mysqlConnection.query("select  i.*, (SELECT tpinex_descripcion from cstb_tipo_ingast where tpinex_id=i.tp_incexp and tpinex_tipo = 'Ingreso') as dsincome FROM cstb_incomes i order by i.inc_fecha limit 10000;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar ingresoses!"
                })  
            }
            return res.status(200).send({
                status: "success",
                incomes: rows
            });        
        });
    }
}

module.exports = controller;