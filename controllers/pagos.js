'use strict'

const validator = require('validator')
const mysqlConnection = require('../database');

const controller = {
    save: (req, res) => {
		//-- Recoger los parámetros de la petición
		var params = req.body
		//-- Validar los datos
		try{
            var validate_fecha = !validator.isEmpty(params.pag_fecha);
            var validate_descripcion = !validator.isEmpty(params.pag_descripcion);                       
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
		if(validate_fecha && validate_descripcion){
			//-- Crear objeto de pagos
            const {pag_fecha, pag_monto, pag_descripcion, pag_tipo, client_id, usr_id, client_name} = params;
            var newsaldo = params.client_saldo - params.pag_monto;
            let stspag='';
            if(newsaldo == 0){
                stspag = 'Completo'
            }else{
                stspag = 'Pendiente'
            }
            const query = `
                INSERT INTO cstb_pagos (pag_fecha, pag_monto, pag_descripcion, pag_tipo, client_id, usr_id, client_name, pag_sts) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            `
            mysqlConnection.query(query, [pag_fecha, pag_monto, pag_descripcion, pag_tipo, client_id, usr_id, client_name, stspag], (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar pago!",
                        error: err
                    })  
                }
                var ntb = params.pag_tipo == "Productor" ? "cstb_producers" : "cstb_employees";
                var ctb = params.pag_tipo == "Productor" ? "prod_saldo" : "emp_saldo";
                var dscli = params.pag_tipo == "Productor" ? "prod_id" : "emp_id";
                
                //--Actualizar saldo de cliente--//
                mysqlConnection.query("UPDATE "+ntb+" SET "+ctb+"="+newsaldo+" WHERE "+dscli+ "="+params.client_id, (err, rowsp, fields)=>{
                    if(err){
                        return res.status(500).send({
                            status: "Error",
                            message: "Error al actualizar saldo de cliente!",
                            error: err
                        })  
                    }
                    //--Mantenimiento tabla master_pres --//
                    var sql = "UPDATE cstb_master_pres SET mpre_pagado = (SELECT SUM(pag_monto) FROM `cstb_pagos` WHERE pag_tipo='" +params.pag_tipo+ "' And client_id="+params.client_id+") WHERE client_tipo='" +params.pag_tipo+ "' And client_id="+params.client_id+";";
                    mysqlConnection.query(sql, (err, rowm, fields)=>{
                        if(err){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al actualizar valor pagado de cliente en tabla master!",
                                error: err
                            })  
                        }
                        if(newsaldo == 0){
                            //--Actualizar fecha de pago y estado de prestamos del cliente
                            mysqlConnection.query("UPDATE cstb_prestamos set pres_fecha_pago=now(), pres_sts = 'Pagado' WHERE client_id="+client_id+" and pres_sts='Activo'", (err, rowpr, fields)=>{
                                if(err){
                                    return res.status(500).send({
                                        status: "Error",
                                        message: "Error al actualizar fecha de pago y estado de prestamo!",
                                        error: err
                                    })  
                                }
                                //--Actualizar estado de pagos del cliente
                                mysqlConnection.query("UPDATE cstb_pagos set pag_sts='Completo' WHERE client_id="+client_id, (err, rowst, fields)=>{
                                    if(err){
                                        return res.status(500).send({
                                            status: "Error",
                                            message: "Error al actualizar estado de pagos del cliente!",
                                            error: err
                                        })  
                                    }
                                    return res.status(200).send({
                                        status: "success",
                                        pago: rows.insertId
                                    });
                                });
                            });
                        }else{
                            return res.status(200).send({
                                status: "success",
                                pago: rows.insertId
                            });
                        }
                    });
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
		//--Recoger datos del pagos
		var params = req.body;
        //-- Validar los datos
        try{
            var validate_fecha = !validator.isEmpty(params.pag_fecha);
            var validate_descripcion = !validator.isEmpty(params.pag_descripcion);                       
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
        if(validate_fecha && validate_descripcion){
            //--Comprobar si nuevo pagos existe en base de datos--//
            mysqlConnection.query("SELECT * FROM cstb_pagos WHERE pag_id = "+params.pag_id+";", (err, pago, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al buscar pago específico!"
                    })  
                }
                if (pago.length > 0) {
                    //-- Crear objeto de pagos
                    const {pag_fecha, pag_monto, pag_descripcion, usr_id, pag_id} = params;
                    var query = "", chpago='No';
                    //--Verificar si se cambio el monto del pago--//
                    if(params.pag_monto_org != params.pag_monto){
                        //--Recalcular saldo de productor/empleado--//
                        var saldofpag=0, difpag =0, stspag='';
                        if(params.pag_monto_org != params.pag_monto){
                            chpago='Si'
                            if(params.pag_monto_org > params.pag_monto){
                                //--Pago original mayor que el actual--//
                                difpag = params.pag_monto_org - params.pag_monto; //--sacar diferencia
                                saldofpag = params.client_saldo + difpag;
                            }else{
                                //--Pago original menor que el actual--//
                                difpag = params.pag_monto - params.pag_monto_org; //--sacar diferencia
                                saldofpag = params.client_saldo - difpag;
                            }
                            if(saldofpag == 0){
                                stspag = 'Completo'
                            }else{
                                stspag = 'Pendiente'
                            }
                            query = "UPDATE cstb_pagos SET pag_fecha='"+pag_fecha+"', pag_monto="+pag_monto+", pag_descripcion='"+pag_descripcion+"', usr_id="+usr_id+", pag_sts='"+stspag+"' WHERE pag_id="+pag_id+"";
                        }else{
                            //--Monto no cambia--//
                            chpago = 'No'
                            saldofpag = params.pag_monto;
                            query = "UPDATE cstb_pagos SET pag_fecha='"+pag_fecha+"', pag_descripcion='"+pag_descripcion+"', usr_id="+usr_id+" WHERE pag_id="+pag_id+"";
                        }
                        
                        //--Actualizar información del pagos--//
                        mysqlConnection.query(query, (err, rows, fields)=>{
                            if(err){
                                console.log('error al actualizar pago')
                                return res.status(500).send({
                                    status: "Error",
                                    message: "Error al actualizar pago!",
                                    error: err
                                })  
                            }
                            if(chpago == 'Si'){
                                //--Actualizar saldo de productor/empleado}
                                var ntb = params.pag_tipo == "Productor" ? "cstb_producers" : "cstb_employees";
                                var ctb = params.pag_tipo == "Productor" ? "prod_saldo" : "emp_saldo";
                                var dscli = params.pag_tipo == "Productor" ? "prod_id" : "emp_id";
                                var sql = "UPDATE "+ntb+" SET "+ctb+"="+saldofpag+" WHERE "+dscli+ "="+params.client_id;
                                //--Actualizar saldo de productor--//
                                mysqlConnection.query(sql, (err, rowsp, fields)=>{
                                    if(err){
                                        return res.status(500).send({
                                            status: "Error",
                                            message: "Error al actualizar saldo de productor!",
                                            error: err
                                        });  
                                    }
                                    //--Mantenimiento tabla master_pres --//
                                    var sql = "UPDATE cstb_master_pres SET mpre_pagado = (SELECT SUM(pag_monto) FROM `cstb_pagos` WHERE pag_tipo='" +params.pag_tipo+ "' And client_id="+params.client_id+") WHERE client_tipo='" +params.pag_tipo+ "' And client_id="+params.client_id+";";
                                    mysqlConnection.query(sql, (err, rowm, fields)=>{
                                        if(err){
                                            return res.status(500).send({
                                                status: "Error",
                                                message: "Error al actualizar valor pagado de cliente en tabla master!",
                                                error: err
                                            })  
                                        }
                                        return res.status(200).send({
                                            status: "success",
                                            message: "Pago registrado correctamente!"
                                        });
                                    });
                                });  
                            }else{
                                return res.status(200).send({
                                    status: "success",
                                    message: "Pago registrado correctamente!"
                                });
                            }
                        }); 
                    }else{
                        //--Actualizar información del pagos--//
                        mysqlConnection.query("UPDATE cstb_pagos SET pag_fecha='"+pag_fecha+"', pag_descripcion='"+pag_descripcion+"', usr_id="+usr_id+" WHERE pag_id="+pag_id+"", (err, rows, fields)=>{
                            if(err){
                                return res.status(500).send({
                                    status: "Error",
                                    message: "Error al actualizar pago!",
                                    error: err
                                })  
                            }
                            return res.status(200).send({
                                status: "success",
                                message: "Pago registrado correctamente!"
                            });
                        });
                    }
                }else{
                    return res.status(500).send({
                        status: "Empty",
                        message: "El pago "+params.pag_id+" no está registrado!"
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
		mysqlConnection.query("SELECT pag_id, pag_fecha FROM cstb_pagos ORDER BY pag_fecha;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar pagoses!"
                })  
            }
            return res.status(200).send({
                status: "success",
                pagos: rows
            });        
        })
    },
    showg: (req, res) => {
		mysqlConnection.query("Select p.*, Case When p.pag_tipo = 'Productor' Then r.prod_saldo Else e.emp_saldo End Saldo from cstb_pagos As p Left Join cstb_producers As r On (p.client_id=r.prod_id) Left Join cstb_employees As e On (p.client_id=e.emp_id) order by p.pag_fecha desc limit 10000;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar pagoss!"
                })  
            }
            return res.status(200).send({
                status: "success",
                pagos: rows
            });        
        })
    },
    showpag: (req, res) => { 
        var idcli = req.params.id;
        console.log('id cli: ', idcli)
		mysqlConnection.query("SELECT * FROM cstb_pagos WHERE client_id ="+idcli+" And pag_sts = 'Pendiente' ORDER BY pag_fecha;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar pagos!"
                })  
            }
            return res.status(200).send({
                status: "success",
                pagos: rows
            });        
        })
    }
}

module.exports = controller;