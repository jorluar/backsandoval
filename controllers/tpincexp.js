'use strict'

const validator = require('validator')
const mysqlConnection = require('../database');

const controller = {
    save: (req, res) => {
		//-- Recoger los parámetros de la petición
		var params = req.body

		//-- Validar los datos
		try{
            var validate_tipo = !validator.isEmpty(params.tpinex_tipo);
            var validate_descrip = !validator.isEmpty(params.tpinex_descripcion);                   
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
		if(validate_tipo && validate_descrip){
			//-- Crear objeto de tipo de ingreso/gasto
            const {tpinex_tipo, tpinex_clasif, tpinex_descripcion, tpinex_sts} = params;
            const query = `
                INSERT INTO cstb_tipo_ingast (tpinex_tipo, tpinex_clasif, tpinex_descripcion, tpinex_sts) VALUES (?, ?, ?, ?);
            `
            mysqlConnection.query(query, [tpinex_tipo, tpinex_clasif, tpinex_descripcion, tpinex_sts], (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar tipo de ingreso/gasto!",
                        error: err
                    })  
                }
                return res.status(200).send({
                    status: "success",
                    tpinex: rows.insertId
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
		//--Recoger datos del tipo de ingreso/gasto
		var params = req.body;

        //-- Validar los datos
        try{
            var validate_tipo = !validator.isEmpty(params.tpinex_tipo);
            var validate_descrip = !validator.isEmpty(params.tpinex_descripcion);                   
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
        if(validate_tipo && validate_descrip){
            //--Comprobar si nuevo tipo de ingreso/gasto existe en base de datos--//
            mysqlConnection.query("SELECT * FROM cstb_tipo_ingast WHERE tpinex_id = "+params.tpinex_id+";", (err, tpingast, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al buscar tipo de ingreso/gasto específico!"
                    })  
                }
                if (tpingast.length > 0) {
                    //-- Si existe --//
                    //-- Crear objeto de tipo de ingreso/gasto
                    const {tpinex_tipo, tpinex_clasif, tpinex_descripcion, tpinex_sts, tpinex_id} = params;
                    const query = `
                        UPDATE cstb_tipo_ingast SET tpinex_tipo=?, tpinex_clasif=?, tpinex_descripcion=?, tpinex_sts=? WHERE tpinex_id=?;
                    `;
                    //--Actualizar información del tipo de ingreso/gasto--//
                    mysqlConnection.query(query, [tpinex_tipo, tpinex_clasif, tpinex_descripcion, tpinex_sts, tpinex_id], (err, rows, fields)=>{
                        if(err){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al actualizar tipo de ingreso/gasto!",
                                error: err
                            })  
                        }
                        return res.status(200).send({
                            status: "success",
                            tpinex: rows
                        });        
                    }); 
                }else{
                    return res.status(500).send({
                        status: "Empty",
                        message: "El tipo de ingreso/gasto "+params.tpinex_id+" no está registrado!"
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
		mysqlConnection.query("SELECT tpinex_id, tpinex_descripcion FROM cstb_tipo_ingast ORDER BY tpinex_descripcion;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar tipo de ingreso/gastos!"
                })  
            }
            return res.status(200).send({
                status: "success",
                ingast: rows
            });        
        })
    },
    showg: (req, res) => {
		mysqlConnection.query("SELECT t.*, Case When t.tpinex_tipo = 'Gasto' Then e.excl_descripcion Else c.incl_descripcion End As clasif FROM cstb_tipo_ingast As t Left Join cstb_expense_classif As e On (t.tpinex_clasif=e.excl_id) Left Join cstb_income_classif As c On (t.tpinex_clasif=c.incl_id)  ORDER BY t.tpinex_descripcion;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar tipo de ingreso/gastos!"
                })  
            }
            return res.status(200).send({
                status: "success",
                ingast: rows
            });        
        })
    },
    //--Consultar clasificación de ingresos--//
    showclinc: (req, res) => {
		mysqlConnection.query("SELECT * FROM cstb_income_classif ORDER BY incl_descripcion;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar clasificación de ingresos!"
                })  
            }
            return res.status(200).send({
                status: "success",
                incomes: rows
            });        
        })
    },
    //--Consultar clasificación de gastos--//
    showclexp: (req, res) => {
		mysqlConnection.query("SELECT * FROM cstb_expense_classif ORDER BY excl_descripcion;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar clasificación de gastos!"
                })  
            }
            return res.status(200).send({
                status: "success",
                expenses: rows
            });        
        })
    },
    //--Consultar tipos de ingresos--//
    showinc: (req, res) => {
		mysqlConnection.query("SELECT * FROM cstb_tipo_ingast WHERE tpinex_tipo = 'Ingreso' ORDER BY tpinex_descripcion;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar tipos de ingresos!"
                })  
            }
            return res.status(200).send({
                status: "success",
                incomes: rows
            });        
        })
    },
     //--Consultar tipos de gastos--//
    showexp: (req, res) => {
		mysqlConnection.query("SELECT * FROM cstb_tipo_ingast WHERE tpinex_tipo = 'Gasto' ORDER BY tpinex_descripcion;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar tipos de gastos!"
                })  
            }
            return res.status(200).send({
                status: "success",
                expenses: rows
            });        
        })
    }
}

module.exports = controller;