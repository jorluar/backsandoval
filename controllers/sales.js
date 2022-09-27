'use strict'

const validator = require('validator')
const mysqlConnection = require('../database');

const controller = {
    save: (req, res) => {
		//-- Recoger los parámetros de la petición
		var params = req.body

		//-- Validar los datos
		try{
            var validate_fecha = !validator.isEmpty(params.vta_fecha);
            var validate_numf = !validator.isEmpty(params.vta_numf);
            var validate_prop = !validator.isEmpty(params.vta_prop);
            var validate_cferef = !validator.isEmpty(params.vta_cferef);                        
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
		if(validate_fecha && validate_numf && validate_prop && validate_cferef){
			//-- Crear objeto de venta
            const {vta_fecha, vta_numf, vta_pesob, vta_sacos, vta_pneto, vta_humed, vta_qqref, vta_qqoro, vta_precio, vta_total, vta_prop, vta_cferef, vta_deposito, vta_anticipo, vta_tpago, cust_id, vta_nwentrega, vta_carga, vta_tipoc, ctvt_id, vta_sts_pago, vta_tipo_pago,vta_desc_pago,vta_neto_exet, vta_neto_sob,vta_qq_ref, vta_preciosob, vta_totalsob } = params;
            const query = `
                INSERT INTO cstb_sales (vta_fecha, vta_numf, vta_pesob, vta_sacos, vta_pneto, vta_humed, vta_qqref, vta_qqoro, vta_precio, vta_total, vta_prop, vta_cferef, vta_deposito, vta_anticipo, vta_tpago, vta_carga, vta_tipoc, ctvt_id, cust_id, vta_sts_pago,vta_desc_pago) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            `
            mysqlConnection.query(query, [vta_fecha, vta_numf, vta_pesob, vta_sacos, vta_pneto, vta_humed, vta_qqref, vta_qqoro, vta_precio, vta_total, vta_prop, vta_cferef, vta_deposito, vta_anticipo, vta_tpago, vta_carga, vta_tipoc, ctvt_id, cust_id, vta_sts_pago,vta_desc_pago], (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar venta!",
                        error: err
                    });  
                }
                var vtaid=rows.insertId
                if(params.vta_contrato == "Si"){
                    //--Verificar si contrato ya esta en proceso
                    mysqlConnection.query("SELECT ctvt_sts sts, ctvt_totsacos tsacos FROM cstb_sales_contrat WHERE ctvt_id = "+params.ctvt_id, (err, excont, fields)=>{
                        if(err){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al buscar contrato especifico!",
                                error: err
                            });  
                        }
                        if (excont.length > 0) {
                            var csts = excont[0].sts
                            var totsacos = excont[0].tsacos
                            var entregfin=0;
                            if(csts == 'Nuevo'){
                                var stsct;
                                if(totsacos == vta_nwentrega){
                                    stsct = 'Finalizado'
                                }else{
                                    stsct = 'Proceso'
                                }
                                //--Contrato sin rebajarse, se actualiza a en proceso
                                mysqlConnection.query("UPDATE cstb_sales_contrat SET ctvt_totsacos_ent="+ vta_nwentrega+", ctvt_sts='"+stsct+"'  WHERE ctvt_id = "+ctvt_id, (err, cont, fields)=>{
                                    if(err){
                                        return res.status(500).send({
                                            status: "Error",
                                            message: "Error al actualizar contrato a en proceso!",
                                            error: err
                                        });  
                                    }
                                    //--Comprobar si contrato queda con qq neto sobrante
                                    if(vta_neto_exet > 0){
                                        var vqoro = vta_qq_ref / 1.25; //--calculo qq oro

                                        const queryex = `
                                                INSERT INTO cstb_sales (vta_fecha, vta_numf, vta_pesob, vta_sacos, vta_pneto, vta_humed, vta_qqref, vta_qqoro, vta_precio, vta_total, vta_prop, vta_cferef, vta_deposito, vta_anticipo, vta_tpago, vta_carga, vta_tipoc, ctvt_id, cust_id, vta_sts_pago,vta_desc_pago) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                                            `
                                            mysqlConnection.query(queryex, [vta_fecha, vta_numf, vta_pesob, vta_sacos, vta_neto_sob, vta_humed, vta_qq_ref, vqoro, vta_preciosob, vta_totalsob, vta_prop, vta_cferef, vta_deposito, vta_anticipo, vta_tpago, vta_carga, vta_tipoc, ctvt_id, cust_id, vta_sts_pago,vta_desc_pago], (err, rowsex, fields)=>{
                                                if(err){
                                                return res.status(500).send({
                                                    status: "Error",
                                                    message: "Error al registrar peso neto exedente!",
                                                    error: err
                                                });  
                                            }
                                            return res.status(200).send({
                                                status: "success",
                                                sales: vtaid
                                            });
                                        });
                                    }else{
                                        return res.status(200).send({
                                            status: "success",
                                            sales: vtaid
                                        });
                                    }
                                });
                            }else{
                                //--Contrato ya se rebajo antes
                                var queryc="";
                                if(vta_nwentrega==0){
                                    entregfin = totsacos;
                                    //--Entrega completa
                                    queryc = "UPDATE cstb_sales_contrat SET ctvt_totsacos_ent=?, ctvt_sts='Finalizado' WHERE ctvt_id=?;"
                                }else{
                                    entregfin = vta_nwentrega
                                    //--Entrega sigue en proceso
                                    queryc = "UPDATE cstb_sales_contrat SET ctvt_totsacos_ent=? WHERE ctvt_id=?;"
                                }
                                //--Actualizar total entregado del contrato
                                mysqlConnection.query(queryc, [entregfin,ctvt_id], (err, upcontrat, fields)=>{
                                    if(err){
                                        return res.status(500).send({
                                            status: "Error",
                                            message: "Error al actualizar contrato!",
                                            error: err
                                        });  
                                    }
                                    //--Comprobar si contrato queda con qq neto sobrante
                                    if(vta_neto_exet > 0){
                                        var vqoro = vta_qq_ref / 1.25; //--calculo qq oro

                                        const queryex = `
                                                INSERT INTO cstb_sales (vta_fecha, vta_numf, vta_pesob, vta_sacos, vta_pneto, vta_humed, vta_qqref, vta_qqoro, vta_precio, vta_total, vta_prop, vta_cferef, vta_deposito, vta_anticipo, vta_tpago, vta_carga, vta_tipoc, ctvt_id, cust_id, vta_sts_pago, vta_desc_pago) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?);
                                            `
                                            mysqlConnection.query(queryex, [vta_fecha, vta_numf, vta_pesob, vta_sacos, vta_neto_sob, vta_humed, vta_qq_ref, vqoro, vta_preciosob, vta_totalsob, vta_prop, vta_cferef, vta_deposito, vta_tpago, vta_carga, vta_tipoc, ctvt_id, cust_id, vta_sts_pago,vta_desc_pago], (err, rowsex, fields)=>{
                                                if(err){
                                                return res.status(500).send({
                                                    status: "Error",
                                                    message: "Error al registrar peso neto exedente!",
                                                    error: err
                                                });  
                                            }
                                            return res.status(200).send({
                                                status: "success",
                                                sales: vtaid
                                            });
                                        });
                                    }else{
                                        return res.status(200).send({
                                            status: "success",
                                            sales: vtaid
                                        });
                                    }
                                }); 
                            } 
                        }else{
                            return res.status(200).send({
                                status: "empty",
                                message: "No se encontró contrato"
                            });
                        }
                    }); 
                }else{
                    return res.status(200).send({
                        status: "success",
                        sales: vtaid
                    });
                }
            });
		}else{
			return res.status(500).send({
				status: "Error",
				message: "Datos vacíos, intente de nuevo!"
			}) 
		}
	},
    saveAnt: (req,res)=>{ 
        var params = req.body
        var vmonto = params.ant_monto;
        if(vmonto > 0){
            const {ant_monto,ant_sts,cust_id,vta_id,ant_obs,ant_saldo,tpago_id, ant_saldof, ctvt_id}=params;
            mysqlConnection.query("Insert into cstb_anticipos_vtas (ant_fecha,ant_monto,ant_sts,cust_id,vta_id,ant_observacion,tpago_id,ctvt_id) Values (Now(),"+ant_monto+",'"+ant_sts+"',"+cust_id+","+vta_id+",'"+ant_obs+"',"+tpago_id+","+ctvt_id+")", (errt, ant, fields)=>{
                if(errt){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error registrar anticipo a cliente!",
                        error: errt
                    });  
                }
                var saldovta;
                if(ant_saldo > 0){
                    saldovta = ant_saldo - ant_monto;
                }else{
                    saldovta = ant_saldo
                }
                
                //--Registrar estado de cuenta global del cliente
                mysqlConnection.query("Insert into cstb_estadoc_global (ctacli_fecha, ctacli_saldop, ctacli_abono, ctacli_saldof, ctacli_obsv, ctacli_sts, tpago_id, cust_id, vta_id, ctvt_id) Values (Now(),"+ant_saldo+","+ant_monto+","+saldovta+",'"+ant_obs+"','"+ant_sts+"',"+tpago_id+","+cust_id+","+vta_id+","+ctvt_id+")", (errc, ant, fields)=>{
                    if(errc){
                        return res.status(500).send({
                            status: "Error",
                            message: "Error al registrar anticipo a estado de cuenta global!",
                            error: errc
                        });  
                    }
                    //--Verificar si queda saldo pendiente
                    if(ant_saldof==0){
                        //--Se paga por completo la venta, se establece en estado en completado de todas las ventas del cliente con contrato (ojo: si hay ventas de mas de 1 contrato pendiente tambien se completaran)
                        mysqlConnection.query("Update cstb_sales Set vta_sts_pago='Completo' Where Cust_id="+cust_id+" and vta_sts_pago='Pendiente' and ctvt_id = "+ctvt_id+";", (erru, upsale, fields)=>{
                            if(erru){
                                return res.status(500).send({
                                    status: "Error",
                                    message: "Error al actualizar estado de ventas de cliente!",
                                    error: erru
                                });  
                            }
                            mysqlConnection.query("Update cstb_anticipos_vtas Set ant_sts='Completo' Where Cust_id="+cust_id+" and ant_sts='Pendiente' and ctvt_id = "+ctvt_id+";", (erru, upant, fields)=>{
                                if(erru){
                                    return res.status(500).send({
                                        status: "Error",
                                        message: "Error al actualizar estado de anticipos de cliente!",
                                        error: erru
                                    });  
                                }
                                mysqlConnection.query("Update cstb_estadoc_global Set ctacli_sts='Completo' Where Cust_id="+cust_id+" and ctacli_sts='Pendiente' and ctvt_id = "+ctvt_id+";", (erru, upant, fields)=>{
                                    if(erru){
                                        return res.status(500).send({
                                            status: "Error",
                                            message: "Error al actualizar estado de cuenta global de cliente!",
                                            error: erru
                                        });  
                                    }
                                    return res.status(200).send({
                                        status: "success"
                                    }); 
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
            //--anticipo en cero se registra solo el total de la venta
            const {vta_id, vta_total, cust_id, saldof, neto_exed, vta_totalsob, ctvt_id, tpago_id } = params;
             //--Registrar estado de cuenta global del cliente
             mysqlConnection.query("Insert into cstb_estadoc_global (ctacli_fecha, ctacli_saldop, ctacli_abono, ctacli_saldof, ctacli_obsv, ctacli_sts, tpago_id, cust_id, vta_id, ctvt_id) Values (Now(),"+vta_total+",0,"+vta_total+",'Venta sin anticipo','Pendiente',"+tpago_id+","+cust_id+", "+vta_id+", "+ctvt_id+")", (errc, ant, fields)=>{
                if(errc){
                    console.log(errc)
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar anticipo a estado de cuenta global!",
                        error: errc
                    });  
                }
                //--Verificar si se paga contrato completo
                if(neto_exed > 0){
                    mysqlConnection.query("Insert into cstb_estadoc_global (ctacli_fecha, ctacli_saldop, ctacli_abono, ctacli_saldof, ctacli_obsv, ctacli_sts, tpago_id, cust_id, vta_id, ctvt_id) Values (Now(),"+vta_totalsob+",0,"+vta_totalsob+",'Venta sin anticipo','Pendiente',"+tpago_id+","+cust_id+","+vta_id+","+ctvt_id+")", (errc, ant, fields)=>{
                        if(errc){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al registrar anticipo a estado de cuenta global!",
                                error: errc
                            });  
                        }
                                //--Verificar si queda saldo pendiente
                        if(saldof==0){
                            //--Se paga por completo la venta, se establece en estado en completado de todas las ventas del cliente con contrato (ojo: si hay ventas de mas de 1 contrato pendiente tambien se completaran)
                            mysqlConnection.query("Update cstb_sales Set vta_sts_pago='Completo' Where Cust_id="+cust_id+" and vta_sts_pago='Pendiente' and ctvt_id = "+ctvt_id+" ;", (erru, upsale, fields)=>{
                                if(erru){
                                    return res.status(500).send({
                                        status: "Error",
                                        message: "Error al actualizar estado de ventas de cliente!",
                                        error: erru
                                    });  
                                }
                                mysqlConnection.query("Update cstb_anticipos_vtas Set ant_sts='Completo' Where Cust_id="+cust_id+" and ant_sts='Pendiente' and ctvt_id = "+ctvt_id+";", (erru, upant, fields)=>{
                                    if(erru){
                                        return res.status(500).send({
                                            status: "Error",
                                            message: "Error al actualizar estado de anticipos de cliente!",
                                            error: erru
                                        });  
                                    }
                                    mysqlConnection.query("Update cstb_estadoc_global Set ctacli_sts='Completo' Where Cust_id="+cust_id+" and ctacli_sts='Pendiente' and ctvt_id = "+ctvt_id+";", (erru, upant, fields)=>{
                                        if(erru){
                                            return res.status(500).send({
                                                status: "Error",
                                                message: "Error al actualizar estado de cuenta global de cliente!",
                                                error: erru
                                            });  
                                        }
                                        return res.status(200).send({
                                            status: "success"
                                        }); 
                                    });
                                });  
                            });
                        }else{
                            return res.status(200).send({
                                status: "success"
                            });  
                        } 
                    });
                }else{
                    //--Verificar si queda saldo pendiente
                    if(saldof==0){
                        //--Se paga por completo la venta, se establece en estado en completado de todas las ventas del cliente con contrato (ojo: si hay ventas de mas de 1 contrato pendiente tambien se completaran)
                        mysqlConnection.query("Update cstb_sales Set vta_sts_pago='Completo' Where Cust_id="+cust_id+" and vta_sts_pago='Pendiente' and ctvt_id = "+ctvt_id+" ;", (erru, upsale, fields)=>{
                            if(erru){
                                return res.status(500).send({
                                    status: "Error",
                                    message: "Error al actualizar estado de ventas de cliente!",
                                    error: erru
                                });  
                            }
                            mysqlConnection.query("Update cstb_anticipos_vtas Set ant_sts='Completo' Where Cust_id="+cust_id+" and ant_sts='Pendiente' and ctvt_id = "+ctvt_id+";", (erru, upant, fields)=>{
                                if(erru){
                                    return res.status(500).send({
                                        status: "Error",
                                        message: "Error al actualizar estado de anticipos de cliente!",
                                        error: erru
                                    });  
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
                }
            });  
        }
    },
    saveCta: (req,res)=>{
        var params = req.body
        const {cta_pbruto, cta_sacos, cta_pneto, cta_porct, cta_qqr, cta_qqo, cta_precio, cta_subtotal, cta_anticipo, cta_saldo, cta_pagalq, cust_id}=params;
        //--Consultar si cliente ya tiene estado de cuenta iniciado
        mysqlConnection.query("SELECT cta_saldo FROM cstb_estado_cuentas WHERE cust_id = "+cust_id+" Order by cta_id desc limit 1;", (err, stc, fields)=>{
            if(err){
                console.log(err)
                return res.status(500).send({
                    status: "Error",
                    message: "Error al buscar estado de cuenta específico!"
                })  
            }
            var saldo=0, nsaldo=0;
            if (stc.length == 0) {
                nsaldo=cta_saldo;
            }else{
                saldo = stc[0].cta_saldo
                //--Cliente existe, verificar si saldo viene de una venta o anticipo
                if(cta_subtotal > 0){
                    //--estado de cuenta desde venta
                    nsaldo = saldo + cta_subtotal - cta_anticipo
                }else{
                    nsaldo = saldo - cta_anticipo
                }
            }
            //--Ingresar nuevo estado de cuenta
            mysqlConnection.query("Insert into cstb_estado_cuentas (cta_fecha, cta_pbruto, cta_sacos, cta_pneto, cta_porct, cta_qqr, cta_qqo, cta_precio, cta_subtotal, cta_anticipo, cta_saldo, cta_pagalq, cust_id) Values (Now(),"+cta_pbruto+"," +cta_sacos+"," +cta_pneto+"," +cta_porct+"," +cta_qqr+"," +cta_qqo+"," +cta_precio+"," +cta_subtotal+"," +cta_anticipo+"," +nsaldo+",'" +cta_pagalq+"',"+cust_id+")", (errc, stc, fields)=>{
                if(errc){
                    console.log(errc)
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar nuevo estado de cuenta!"
                    })  
                }
                //--Comprobar si se queda saldo
                if(nsaldo <= 0){
                    //--Actualizar estado de pagado a anticipos pendientes
                    mysqlConnection.query("Update cstb_anticipos_vtas Set ant_sts='Completo' Where cust_id="+cust_id, (errs, upant, fields)=>{
                        if(errs){
                            console.log(errs)
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al actualizar estado de anticipos de cliente!",
                                error: errt
                            });  
                        }
                        //--Actualizar estado de pagado a ventas pendientes
                        mysqlConnection.query("Update cstb_sales Set vta_sts_pago='Completo' Where cust_id="+cust_id, (errs, upant, fields)=>{
                            if(errs){
                                console.log(errs)
                                return res.status(500).send({
                                    status: "Error",
                                    message: "Error al actualizar estado de anticipos de cliente!",
                                    error: errt
                                });  
                            }
                            //
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
    },
    //--Registrar detalle de rebaja de contrato
    savedtct: (req, res) => {
		//-- Recoger los parámetros de la petición
		var params = req.body;
        
        const {vta_fecha, vta_pesob, vta_sacos, vta_pneto, vta_neto_rebaja, vta_new_neto, vta_preciosob, vta_precio, vta_total, ctvt_id} = params;
            const query = `
                INSERT INTO cstb_det_deduccion_contrato (dtct_fecha, dtct_pesob, dtct_tara, dtct_pneto, dtct_trebaja, dtct_newneto, dtct_netoini, dtct_precio, dtct_total, ctvt_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            `
            mysqlConnection.query(query, [vta_fecha, vta_pesob, vta_sacos, vta_pneto, vta_neto_rebaja, vta_new_neto, vta_preciosob, vta_precio, vta_total, ctvt_id], (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar detalle de rebaja de contrato de cafe!",
                        error: err
                    })  
                }
                return res.status(200).send({
                    status: "success"
                });       
            });
    },
    update: (req, res) => {
		//--Recoger datos del venta
		var params = req.body;

        //-- Validar los datos
        try{
            var validate_fecha = !validator.isEmpty(params.vta_fecha);
            var validate_numf = !validator.isEmpty(params.vta_numf);
            var validate_prop = !validator.isEmpty(params.vta_prop);
            var validate_cferef = !validator.isEmpty(params.vta_cferef);                       
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
        if(validate_fecha && validate_numf && validate_prop && validate_cferef){
            //--Comprobar si nuevo venta existe en base de datos--//
            mysqlConnection.query("SELECT * FROM cstb_sales WHERE vta_id = "+params.vta_id+";", (err, vta, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al buscar venta específica!"
                    })  
                }
                if (vta.length > 0) {
                    //-- Si existe --//
                    //-- Crear objeto de venta
                    //--UPDATE cstb_sales SET vta_fecha=?, vta_numf=?, vta_pesob=?, vta_sacos=?, vta_pneto=?, vta_humed=?, vta_qqref=?, vta_qqoro=?, vta_precio=?, vta_total=?, vta_prop=?, vta_cferef=?, vta_deposito=?, vta_anticipo=?, vta_tpago = ?, vta_carga=?, vta_tipoc=?, cust_id=?, vta_sts_pago=?, vta_tipo_pago=?,vta_desc_pago=? WHERE vta_id=?;
                    const {vta_fecha, vta_numf, vta_deposito, vta_carga, vta_tipoc, vta_sts_pago, vta_tipo_pago,vta_desc_pago, vta_id} = params;
                    const query = "UPDATE cstb_sales SET vta_fecha=?, vta_numf=?, vta_deposito=?, vta_carga=?, vta_tipoc=? WHERE vta_id=?;"
                    //--Actualizar información del venta--//
                    mysqlConnection.query(query, [vta_fecha, vta_numf, vta_deposito, vta_carga, vta_tipoc, vta_id], (err, rows, fields)=>{
                        if(err){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al actualizar venta!",
                                error: err
                            })  
                        }
                        return res.status(200).send({
                            status: "success",
                            sales: rows
                        });    
                        /*if(params.vta_contrato == "Si"){
                            //--Verificar si contrato ya esta en proceso
                            mysqlConnection.query("SELECT ctvt_sts sts, ctvt_totsacos tsacos FROM cstb_sales_contrat WHERE ctvt_id = "+params.ctvt_id, (err, excont, fields)=>{
                                if(err){
                                    return res.status(500).send({
                                        status: "Error",
                                        message: "Error al buscar contrato especifico!",
                                        error: err
                                    });  
                                }
                                if (excont.length > 0) {
                                    var csts = excont[0].sts
                                    var totsacos = excont[0].tsacos
                                    if(csts == 'Nuevo'){
                                        var stsct;
                                        if(totsacos == vta_nwentrega){
                                            stsct = 'Finalizado'
                                        }else{
                                            stsct = 'Proceso'
                                        }
                                        //--Contrato sin rebajarse, se actualiza a en proceso
                                        mysqlConnection.query("UPDATE cstb_sales_contrat SET ctvt_totsacos_ent="+ vta_nwentrega+", ctvt_sts='"+stsct+"' WHERE ctvt_id = "+ctvt_id, (err, cont, fields)=>{
                                            if(err){
                                                return res.status(500).send({
                                                    status: "Error",
                                                    message: "Error al actualizar contrato a en proceso!",
                                                    error: err
                                                });  
                                            }
                                            return res.status(200).send({
                                                status: "success",
                                                sales: rows.insertId
                                            });  
                                        });
                                    }else{
                                        //--Contrato ya se rebajo antes
                                        var queryc="";
                                        if(totsacos == vta_nwentrega){
                                            //--Entrega completa
                                            queryc = "UPDATE cstb_sales_contrat SET ctvt_totsacos_ent=?, ctvt_sts='Finalizado' WHERE ctvt_id=?;"
                                        }else{
                                            //--Entrega sigue en proceso
                                            queryc = "UPDATE cstb_sales_contrat SET ctvt_totsacos_ent=? WHERE ctvt_id=?;"
                                        }
                                        //--Actualizar total entregado del contrato
                                        mysqlConnection.query(queryc, [vta_nwentrega,ctvt_id], (err, upcontrat, fields)=>{
                                            if(err){
                                                return res.status(500).send({
                                                    status: "Error",
                                                    message: "Error al actualizar contrato!",
                                                    error: err
                                                });  
                                            }
                                            return res.status(200).send({
                                                status: "success",
                                                sales: rows.insertId
                                            });  
                                        }); 
                                    } 
                                }else{
                                    return res.status(200).send({
                                        status: "empty",
                                        message: "No se encontró contrato"
                                    });
                                }
                            }); 
                        }*/ 
                    }); 
                }else{
                    return res.status(500).send({
                        status: "Empty",
                        message: "El venta "+params.vta_id+" no está registrado!"
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
		mysqlConnection.query("SELECT vta_id, vta_fecha, vta_numf FROM cstb_sales ORDER BY vta_fecha;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar ventas!"
                })  
            }
            return res.status(200).send({
                status: "success",
                sales: rows
            });        
        })
    },
    showg: (req, res) => {
		mysqlConnection.query("SELECT v.*, case when v.ctvt_id = 0 then 'No' else 'Si' end contrato, c.cust_nombre FROM cstb_sales as v INNER JOIN cstb_customers as c On v.cust_id = c.cust_id ORDER BY v.vta_fecha Limit 20000;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar ventas!"
                })  
            }
            return res.status(200).send({
                status: "success",
                sales: rows
            });        
        })
    },
    showrpt: (req, res) => {
        var params = req.body;
        var fhini=params.fhini + ' 00:00:00'
        var fhfin=params.fhfin + ' 23:59:00'
        var idcli=params.cid
        var tpvta=params.tipovta
        var idctvt = params.ctvt_id
        var filcont = params.contfiltro
        var query;
        if(idcli == 0){
            //Todos los clientes
            if(tpvta == "All"){
                //Ventas con y sin contrato
                query="SELECT v.*, case when v.ctvt_id = 0 then 'Si' else 'No' end contrato, c.cust_nombre cliente FROM cstb_sales as v INNER JOIN cstb_customers as c On (v.cust_id = c.cust_id) " + 
                "Where v.vta_fecha Between '"+fhini+"' and '"+fhfin+"' ORDER BY v.vta_fecha;"
            }else{
                if(tpvta == "Si"){
                    //Ventas con contrato
                    query="SELECT v.*, case when v.ctvt_id = 0 then 'Si' else 'No' end contrato, c.cust_nombre cliente FROM cstb_sales as v INNER JOIN cstb_customers as c On (v.cust_id = c.cust_id) " + 
                        "Where v.vta_fecha Between '"+fhini+"' and '"+fhfin+"' and v.ctvt_id > 0 ORDER BY v.vta_fecha;"
                    /*if(filcont == "all"){
                        query="SELECT v.*, case when v.ctvt_id = 0 then 'Si' else 'No' end contrato, c.cust_nombre cliente FROM cstb_sales as v INNER JOIN cstb_customers as c On (v.cust_id = c.cust_id) " + 
                        "Where v.vta_fecha Between '"+fhini+"' and '"+fhfin+"' and v.ctvt_id > 0 ORDER BY v.vta_fecha;"
                    }else{
                        query="SELECT v.*, case when v.ctvt_id = 0 then 'Si' else 'No' end contrato, c.cust_nombre cliente FROM cstb_sales as v INNER JOIN cstb_customers as c On (v.cust_id = c.cust_id) " + 
                        "Where v.vta_fecha Between '"+fhini+"' and '"+fhfin+"' and v.ctvt_id = "+idctvt+" ORDER BY v.vta_fecha;"                                   
                    }*/
                }else{
                    //Ventas sin contrato
                    query="SELECT v.*, case when v.ctvt_id = 0 then 'Si' else 'No' end contrato, c.cust_nombre cliente FROM cstb_sales as v INNER JOIN cstb_customers as c On (v.cust_id = c.cust_id) " + 
                    "Where v.vta_fecha Between '"+fhini+"' and '"+fhfin+"' and v.ctvt_id = 0 ORDER BY v.vta_fecha;"
                }
            }
        }else{
            //Por Cliente
            if(tpvta == "All"){
                //Ventas con y sin contrato
                query="SELECT v.*, case when v.ctvt_id = 0 then 'Si' else 'No' end contrato, c.cust_nombre cliente FROM cstb_sales as v INNER JOIN cstb_customers as c On v.cust_id = c.cust_id " + 
                "Where v.vta_fecha Between '"+fhini+"' and '"+fhfin+"' and v.cust_id="+idcli+" ORDER BY v.vta_fecha;"
            }else{
                if(tpvta == "Si"){
                    //Ventas con contrato
                    if(filcont == "All"){
                        query="SELECT v.*, case when v.ctvt_id = 0 then 'Si' else 'No' end contrato, c.cust_nombre cliente FROM cstb_sales as v INNER JOIN cstb_customers as c On v.cust_id = c.cust_id " + 
                        "Where v.vta_fecha Between '"+fhini+"' and '"+fhfin+"' and v.cust_id="+idcli+" and v.ctvt_id > 0 ORDER BY v.vta_fecha;"
                    }else{
                        query="SELECT v.*, case when v.ctvt_id = 0 then 'Si' else 'No' end contrato, c.cust_nombre cliente FROM cstb_sales as v INNER JOIN cstb_customers as c On (v.cust_id = c.cust_id) " + 
                        "Where v.vta_fecha Between '"+fhini+"' and '"+fhfin+"' and v.cust_id="+idcli+" and v.ctvt_id = "+idctvt+" ORDER BY v.vta_fecha;"                               
                    }
                }else{
                    //Ventas sin contrato
                    query="SELECT v.*, case when v.ctvt_id = 0 then 'Si' else 'No' end contrato, c.cust_nombre cliente FROM cstb_sales as v INNER JOIN cstb_customers as c On v.cust_id = c.cust_id " + 
                    "Where v.vta_fecha Between '"+fhini+"' and '"+fhfin+"' and v.cust_id="+idcli+" and v.ctvt_id = 0 ORDER BY v.vta_fecha;"
                }
            }
        }
		mysqlConnection.query(query, (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar ventas!"
                })  
            }
            if(rows.length > 0){
                return res.status(200).send({
                    status: "success",
                    sales: rows
                }); 
            }else{
                return res.status(200).send({
                    status: "empty",
                    sales: rows
                }); 
            }      
        })
    },
    showcv: (req, res) => {
        var idct=req.params.id
		mysqlConnection.query("SELECT v.*, c.cust_nombre FROM cstb_sales as v INNER JOIN cstb_customers as c On v.cust_id = c.cust_id WHERE v.ctvt_id = " + idct + " ORDER BY v.vta_fecha;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar ventas!"
                })  
            }
            return res.status(200).send({
                status: "success",
                sales: rows
            });        
        })
    },
    showgstsc: (req, res) => {
        var idct=req.params.id;
        //--Comprobar si cliente tiene ventas pendientes--
		mysqlConnection.query("Select IFNULL(Sum(ctacli_saldop),0) Tventa, IFNULL(Sum(ctacli_abono),0) Tanticipo, IFNULL((Sum(ctacli_saldop) - Sum(ctacli_abono)),0) Saldo From cstb_estadoc_global Where cust_id=" + idct, (err, rows, fields)=>{
            if(err){
                console.log(err)
                return res.status(500).send({
                    status: "Error",
                    message: "Error al sumar estado de cuenta de cliente!"
                })  
            }
            return res.status(200).send({
                status: "success",
                sales: rows
            });
            /*var totv = rows[0].Tventa;
            
            if(totv > 0){
                return res.status(200).send({
                    status: "success",
                    sales: rows
                }); 
            }else{
                //--Consultar ventas completas
                mysqlConnection.query("Select IFNULL(Sum(ctacli_saldop),0) Tventa, IFNULL(Sum(ctacli_abono),0) Tanticipo, IFNULL((Sum(ctacli_saldop) - Sum(ctacli_abono)),0) Saldo From cstb_estadoc_global Where cust_id=" + idct + " and ctacli_sts='Completo';", (err, rowsv, fields)=>{
                    if(err){
                        console.log(err)
                        return res.status(500).send({
                            status: "Error",
                            message: "Error al sumar estado de cuenta de cliente!"
                        })  
                    }
                    return res.status(200).send({
                        status: "success",
                        sales: rowsv
                    }); 
                });
            }*/       
        });
    },
    showpg: (req, res) => {
		mysqlConnection.query("SELECT tpago_id, tpago_descripcion FROM cstb_tipos_pago ORDER BY tpago_id;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar tipos de pago!"
                })  
            }
            return res.status(200).send({
                status: "success",
                tpagos: rows
            });        
        })
    },
    showatv: (req, res) => {
        var idct = req.params.id;
        var query;
            query = "Select case when a.vta_id>0 then s.vta_numf else 'N/A' end idvta, a.ant_fecha fecha, a.ant_monto monto, IFNULL(a.ant_observacion,'-') obsrv, a.ant_sts sts, c.cust_nombre cliente, IFNULL(s.vta_total,0) totv, p.tpago_descripcion pagdesc, " 
                    +"Case When a.ctvt_id = 0 Then 'N/A' Else a.ctvt_id End Num_Contrato From cstb_anticipos_vtas a left join cstb_sales s On a.vta_id=s.vta_id left join cstb_customers c on a.cust_id=c.cust_id Inner Join cstb_tipos_pago p On a.tpago_id = p.tpago_id Where a.cust_id="+idct+" order by a.ant_id;"
		mysqlConnection.query(query, (err, rows, fields)=>{
            if(err){
                console.log(err)
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar anticipos de cliente!"
                })  
            }
            var queryc;
            queryc="Select IFNULL(Sum(ant_monto),0) antotal From cstb_anticipos_vtas Where cust_id="+idct+" and ant_sts='Pendiente';"
           
            mysqlConnection.query(queryc, (err, rowst, fields)=>{
                if(err){
                    console.log(err)
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al listar anticipos de cliente!"
                    })  
                }
                return res.status(200).send({
                    status: "success",
                    anticip: rows,
                    totant: rowst
                });
            });        
        });
    },
    showcta: (req, res) => {
        var idct = req.params.id
        var tpc = req.params.tpc
        var query;
        if(tpc == 'Todas'){
            query = "Select e.ctacli_fecha fecha, e.ctacli_saldop saldop, e.ctacli_abono abono, e.ctacli_saldof saldof, e.ctacli_obsv obsv, t.tpago_descripcion decrip, c.cust_nombre cliente, c.cust_id idcli, case when e.ctvt_id > 0 then 'Si' else 'No' end Contrato from cstb_estadoc_global e Inner Join cstb_tipos_pago t on e.tpago_id=t.tpago_id Inner Join cstb_customers c On e.cust_id=c.cust_id Order by c.cust_nombre, e.ctacli_id"
        }else{
            query = "Select e.ctacli_fecha fecha, e.ctacli_saldop saldop, e.ctacli_abono abono, e.ctacli_saldof saldof, e.ctacli_obsv obsv, t.tpago_descripcion decrip, c.cust_nombre cliente, c.cust_id idcli, case when e.ctvt_id > 0 then 'Si' else 'No' end Contrato from cstb_estadoc_global e Inner Join cstb_tipos_pago t on e.tpago_id=t.tpago_id Inner Join cstb_customers c On e.cust_id=c.cust_id Where e.cust_id="+idct+" Order by e.ctacli_id;"
        }
		mysqlConnection.query(query, (err, rows, fields)=>{
            if(err){
                console.log(err)
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar estado de cuenta de cliente!"
                })  
            }
            return res.status(200).send({
                status: "success",
                ctacli: rows
            });     
        });
    }
}

module.exports = controller;