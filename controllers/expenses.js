'use strict'

const validator = require('validator')
const mysqlConnection = require('../database');

const controller = {
    save: (req, res) => {
		//-- Recoger los parámetros de la petición
		var params = req.body
        
		//-- Validar los datos
		try{
            var validate_fecha = !validator.isEmpty(params.exp_fecha);
            var validate_descrip = !validator.isEmpty(params.exp_descripcion);                        
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
		if(validate_fecha && validate_descrip){
			//-- Crear objeto de gastos
            const {exp_fecha, exp_cant, exp_descripcion, tp_incexp, usr_id, mant_id, veh_id} = params;
            const query = `
                INSERT INTO cstb_expenses (exp_fecha, exp_cant, exp_descripcion, tp_incexp, usr_id, mant_id, veh_id) VALUES (?, ?, ?, ?, ?, ?, ?);
            `
            mysqlConnection.query(query, [exp_fecha, exp_cant, exp_descripcion, tp_incexp, usr_id, mant_id, veh_id], (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar gastos!",
                        error: err
                    })  
                }
                return res.status(200).send({
                    status: "success",
                    expense: rows.insertId
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
		//--Recoger datos del gastos
		var params = req.body;

        //-- Validar los datos
        try{
            var validate_fecha = !validator.isEmpty(params.exp_fecha);
            var validate_descrip = !validator.isEmpty(params.exp_descripcion);                      
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
        if(validate_fecha && validate_descrip){
            //--Comprobar si nuevo gastos existe en base de datos--//
            mysqlConnection.query("SELECT * FROM cstb_expenses WHERE exp_id = "+params.exp_id+";", (err, income, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al buscar ingreso específico!"
                    })  
                }
                if (income.length > 0) {
                    //-- Si existe --//
                    //-- Crear objeto de gastos
                    const {exp_fecha, exp_cant, exp_descripcion, tp_incexp, usr_id, mant_id, veh_id, exp_id} = params;
                    const query = `
                        UPDATE cstb_expenses SET exp_fecha=?, exp_cant=?, exp_descripcion=?, tp_incexp=?, usr_id=? , mant_id=?, veh_id=? WHERE exp_id=?;
                    `;
                    //--Actualizar información del gastos--//
                    mysqlConnection.query(query, [exp_fecha, exp_cant, exp_descripcion, tp_incexp, usr_id, mant_id, veh_id, exp_id], (err, rows, fields)=>{
                        if(err){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al actualizar gastos!",
                                error: err
                            })  
                        }
                        return res.status(200).send({
                            status: "success",
                            expense: rows
                        });        
                    }); 
                }else{
                    return res.status(500).send({
                        status: "Empty",
                        message: "El gastos "+params.exp_id+" no está registrado!"
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
		mysqlConnection.query("SELECT exp_id, exp_fecha, exp_descripcion, usr_id FROM cstb_expenses ORDER BY exp_fecha;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar gastos!"
                })  
            }
            return res.status(200).send({
                status: "success",
                expenses: rows
            });        
        });
    },
    showg: (req, res) => {
		mysqlConnection.query("select  i.*, (SELECT tpinex_descripcion from cstb_tipo_ingast where tpinex_id=i.tp_incexp and tpinex_tipo = 'Gasto') as dsexpense, case when i.veh_id > 0 then concat(v.veh_marca, '-',v.veh_tipo) else 'N/A' end veh FROM cstb_expenses i left join cstb_vehicles v on i.veh_id=v.veh_id order by i.exp_fecha limit 20000;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar gastoses!"
                })  
            }
            return res.status(200).send({
                status: "success",
                expenses: rows
            });        
        });
    }
}

module.exports = controller;