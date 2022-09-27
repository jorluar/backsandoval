'use strict'

const validator = require('validator')
const mysqlConnection = require('../database');

const controller = {
    save: (req, res) => {
		//-- Recoger los parámetros de la petición
		var params = req.body

		//-- Validar los datos
		try{
            var validate_nombre = !validator.isEmpty(params.cust_nombre);
            var validate_direcc = !validator.isEmpty(params.cust_direccion);
            var validate_telef = !validator.isEmpty(params.cust_telefono);
            var validate_rtn = !validator.isEmpty(params.cust_rtn);
            var validate_sts = !validator.isEmpty(params.cust_sts);                        
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
		if(validate_nombre && validate_direcc && validate_telef && validate_rtn && validate_sts){
			//-- Crear objeto de cliente
            const {cust_nombre, cust_direccion, cust_telefono, cust_rtn, cust_sts} = params;
            const query = `
                INSERT INTO cstb_customers (cust_nombre, cust_direccion, cust_telefono, cust_rtn, cust_sts) VALUES (?, ?, ?, ?, ?);
            `
            mysqlConnection.query(query, [cust_nombre, cust_direccion, cust_telefono, cust_rtn, cust_sts], (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar cliente!",
                        error: err
                    })  
                }
                return res.status(200).send({
                    status: "success",
                    customer: rows.insertId
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
		//--Recoger datos del cliente
		var params = req.body;

        //-- Validar los datos
        try{
            var validate_nombre = !validator.isEmpty(params.cust_nombre);
            var validate_direcc = !validator.isEmpty(params.cust_direccion);
            var validate_telef = !validator.isEmpty(params.cust_telefono);
            var validate_rtn = !validator.isEmpty(params.cust_rtn);
            var validate_sts = !validator.isEmpty(params.cust_sts);                        
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
        if(validate_nombre && validate_direcc && validate_telef && validate_rtn && validate_sts){
            //--Comprobar si nuevo cliente existe en base de datos--//
            mysqlConnection.query("SELECT * FROM cstb_customers WHERE cust_id = "+params.cust_id+";", (err, customer, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al buscar cliente específico!"
                    })  
                }
                if (customer.length > 0) {
                    //-- Si existe --//
                    //-- Crear objeto de cliente
                    const {cust_nombre, cust_direccion, cust_telefono, cust_rtn, cust_sts, cust_id} = params;
                    const query = `
                        UPDATE cstb_customers SET cust_nombre=?, cust_direccion=?, cust_telefono=?, cust_rtn=?, cust_sts=? WHERE cust_id=?;
                    `;
                    //--Actualizar información del cliente--//
                    mysqlConnection.query(query, [cust_nombre, cust_direccion, cust_telefono, cust_rtn, cust_sts, cust_id], (err, rows, fields)=>{
                        if(err){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al actualizar cliente!",
                                error: err
                            })  
                        }
                        return res.status(200).send({
                            status: "success",
                            customers: rows
                        });        
                    }); 
                }else{
                    return res.status(500).send({
                        status: "Empty",
                        message: "El cliente "+params.cust_id+" no está registrado!"
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
		mysqlConnection.query("SELECT cust_id, cust_nombre FROM cstb_customers ORDER BY cust_nombre;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar clientes!"
                })  
            }
            return res.status(200).send({
                status: "success",
                customers: rows
            });        
        })
    },
    //--Clientes sin contrato de venta
    /*showc: (req, res) => {
		mysqlConnection.query("", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar clientes!"
                })  
            }
            return res.status(200).send({
                status: "success",
                customers: rows
            });        
        })
    },*/
    showg: (req, res) => {
		mysqlConnection.query("SELECT * FROM cstb_customers ORDER BY cust_nombre;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar clientes!"
                })  
            }
            return res.status(200).send({
                status: "success",
                customers: rows
            });        
        })
    },
    showc: (req, res) => {
		mysqlConnection.query("SELECT c.cust_id, c.cust_nombre FROM cstb_customers As c INNER JOIN cstb_sales_contrat AS s ON c.cust_id = s.cust_id WHERE s.ctvt_sts IN ('Nuevo','Proceso') Order By c.cust_nombre;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar clientes con contrato!"
                })  
            }
            return res.status(200).send({
                status: "success",
                customers: rows
            });        
        })
    },
    showcv: (req, res) => {
		mysqlConnection.query("SELECT c.cust_id, c.cust_nombre FROM cstb_customers AS c WHERE Not Exists (SELECT * FROM cstb_sales_contrat As s WHERE c.cust_id = s.cust_id and s.ctvt_totsacos > s.ctvt_totsacos_ent) ORDER BY c.cust_nombre;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar clientes con contrato!"
                })  
            }
            return res.status(200).send({
                status: "success",
                customers: rows
            }); 
        })
    }
}

module.exports = controller;