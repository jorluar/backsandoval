'use strict'

const validator = require('validator')
const mysqlConnection = require('../database');

const controller = {
    save: (req, res) => {
		//-- Recoger los parámetros de la petición
		var params = req.body

		//-- Validar los datos
		try{
            var validate_fecha = !validator.isEmpty(params.ctvt_fecha);                       
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
		if(validate_fecha){
			//-- Crear objeto de contrato de cafe
            const {ctvt_fecha, ctvt_totsacos, ctvt_totsacos_ent, ctvt_monto, ctvt_precioqq, ctvt_sts, ctvt_tpeso, cust_id, tpago_id} = params;
            const query = `
                INSERT INTO cstb_sales_contrat (ctvt_fecha, ctvt_totsacos, ctvt_totsacos_ent, ctvt_monto, ctvt_precioqq, ctvt_sts, ctvt_tpeso, cust_id, tpago_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
            `
            mysqlConnection.query(query, [ctvt_fecha, ctvt_totsacos, ctvt_totsacos_ent, ctvt_monto, ctvt_precioqq, ctvt_sts, ctvt_tpeso, cust_id, tpago_id], (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar contrato de cafe!",
                        error: err
                    })  
                }
                return res.status(200).send({
                    status: "success",
                    contrat: rows.insertId
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
		//--Recoger datos del contrato de cafe
		var params = req.body;

        //-- Validar los datos
        try{
            var validate_fecha = !validator.isEmpty(params.ctvt_fecha);                      
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
        if(validate_fecha){
            //--Comprobar si nuevo contrato de cafe existe en base de datos--//
            mysqlConnection.query("SELECT * FROM cstb_sales_contrat WHERE ctvt_id = "+params.ctvt_id+";", (err, contrat, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al buscar contrato específico!"
                    })  
                }
                if (contrat.length > 0) {
                    //-- Si existe --//
                    //-- Crear objeto de contrato de cafe
                    const {ctvt_fecha, ctvt_totsacos, ctvt_monto, ctvt_precioqq, ctvt_sts, ctvt_tpeso, cust_id, ctvt_id, tpago_id} = params;
                    const query = `
                        UPDATE cstb_sales_contrat SET ctvt_fecha=?, ctvt_totsacos=?, ctvt_monto=?, ctvt_precioqq=?, ctvt_sts=?, ctvt_tpeso=?, cust_id=?, tpago_id=? WHERE ctvt_id=?;
                    `;
                    //--Actualizar información del contrato de cafe--//
                    mysqlConnection.query(query, [ctvt_fecha, ctvt_totsacos, ctvt_monto, ctvt_precioqq, ctvt_sts, ctvt_tpeso, cust_id, tpago_id, ctvt_id], (err, rows, fields)=>{
                        if(err){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al actualizar contrato de cafe!",
                                error: err
                            })  
                        }
                        //--verificar si contrato habia registrado anticipo-//
                        mysqlConnection.query("Select * from cstb_anticipos_vtas WHERE ctvt_id="+ctvt_id, (err, rowst, fields)=>{
                            if(err){
                                return res.status(500).send({
                                    status: "Error",
                                    message: "Error al actualizar contrato de cafe!",
                                    error: err
                                })  
                            }
                            if(rowst.length > 0){
                                //--Actualizar anticipo de venta del actual contrato
                                mysqlConnection.query("Update cstb_anticipos_vtas Set ant_monto="+ctvt_monto+", tpago_id="+tpago_id+" WHERE ctvt_id="+ctvt_id, (err, rowsp, fields)=>{
                                    if(err){
                                        return res.status(500).send({
                                            status: "Error",
                                            message: "Error al actualizar monto de anticipo!",
                                            error: err
                                        })  
                                    }
                                    //--Actualizar estado de cuenta global del actual contrato
                                    mysqlConnection.query("Update cstb_estadoc_global Set ctacli_abono="+ctvt_monto+", tpago_id="+tpago_id+" WHERE ctvt_id="+ctvt_id, (err, rowsc, fields)=>{
                                        if(err){
                                            return res.status(500).send({
                                                status: "Error",
                                                message: "Error al actualizar monto de anticipo!",
                                                error: err
                                            })  
                                        }
                                        return res.status(200).send({
                                            status: "success"
                                        });
                                    });
                                });
                            }else{
                                return res.status(200).send({
                                    status: "success"
                                });
                            }
                        });        
                    }); 
                }else{
                    return res.status(500).send({
                        status: "Empty",
                        message: "El contrato de cafe "+params.ctvt_id+" no está registrado!"
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
		mysqlConnection.query("SELECT ctvt_id, ctvt_fecha, ctvt_totsacos_ent, ctvt_precioqq FROM cstb_sales_contrat ORDER BY ctvt_fecha;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar contrato de cafes!"
                })  
            }
            return res.status(200).send({
                status: "success",
                contrats: rows
            });        
        });
    },
    showg: (req, res) => {
		mysqlConnection.query("select  s.*, c.cust_id, c.cust_nombre FROM cstb_sales_contrat As s INNER JOIN cstb_customers As c On s.cust_id = c.cust_id where s.ctvt_sts = 'Nuevo' order by s.ctvt_fecha limit 10000;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar contrato de cafees!"
                })  
            }
            return res.status(200).send({
                status: "success",
                contrats: rows
            });        
        });
    },
    showc: (req, res) => {
        var idcp = req.params.id;
		mysqlConnection.query("select ctvt_id, ctvt_totsacos tsacos, ctvt_totsacos_ent tentreg, ctvt_tpeso tpeso, ctvt_precioqq precio FROM cstb_sales_contrat where cust_id = "+idcp+" and ctvt_sts IN ('Nuevo','Proceso');", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar contrato de cafes!"
                })  
            }
            if(rows.length > 0){
                return res.status(200).send({
                    status: "success",
                    contrats: rows
                });
            }else{
                return res.status(200).send({
                    status: "empty"
                });
            }        
        });
    },
    showpf: (req, res) => {
        var tipoc = req.params.tipo, idcust=req.params.id, vtipo='';
        if(tipoc == 'Proceso'){
            vtipo="'Proceso','Nuevo'"
        }else if(tipoc == 'Finalizado'){
            vtipo="'Finalizado'"
        }else{
            //--Todos
            vtipo="'Nuevo', 'Proceso', 'Finalizado'"
        }
		mysqlConnection.query("Select cons1.ctvt_id, cons1.ctvt_fecha, cons1.ctvt_totsacos, cons1.ctvt_totsacos_ent, cons1.ctvt_monto, cons1.ctvt_precioqq, cons1.ctvt_sts, cons1.ctvt_tpeso, cons1.cust_id, cons1.cust_nombre, IFNULL(cons2.total,0) total FROM (select c.ctvt_id, c.ctvt_fecha, c.ctvt_totsacos, c.ctvt_totsacos_ent, c.ctvt_monto, c.ctvt_precioqq, c.ctvt_sts, c.ctvt_tpeso, c.cust_id, s.cust_nombre FROM cstb_sales_contrat c INNER JOIN cstb_customers s On c.cust_id=s.cust_id where c.cust_id = "+idcust+" and c.ctvt_sts IN ("+vtipo+")) cons1 LEFT JOIN (SELECT ctvt_id, SUM(vta_total) total FROM cstb_sales GROUP BY ctvt_id) cons2 On cons1.ctvt_id = cons2.ctvt_id order by cons1.ctvt_fecha;", (err, rows, fields)=>{
            if(err){
                console.log(err)
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar contrato de cafees!"
                })  
            }
            if(rows.length > 0){
                return res.status(200).send({
                    status: "success",
                    contrats: rows
                });
            }else{
                return res.status(200).send({
                    status: "empty"
                });
            }       
        });
    },
    showctemp: (req, res) => {
        var idcust=req.params.id;
		mysqlConnection.query("select ctvt_id, CONCAT(ctvt_fecha,'-contrato: ',ctvt_totsacos, ' ', ctvt_tpeso) descripcion from cstb_sales_contrat where cust_id = "+idcust+" order by ctvt_fecha;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar contrato por empresa!"
                })  
            }
            if(rows.length > 0){
                return res.status(200).send({
                    status: "success",
                    contrats: rows
                });
            }else{
                return res.status(200).send({
                    status: "empty"
                });
            }       
        });
    }
}

module.exports = controller;