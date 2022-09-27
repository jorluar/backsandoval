'use strict'

const validator = require('validator')
const mysqlConnection = require('../database');

const controller = {
    save: (req, res) => {
		//-- Recoger los parámetros de la petición
		var params = req.body;
        var stswt = '';
        if(params.cfsp_tipopg == 'Completo'){
            stswt = 'Comprado';
        }else{
            stswt = 'Pendiente';
        }
		//-- Validar los datos
		try{
            var validate_fecha = !validator.isEmpty(params.cfsp_fecha);
            var validate_tipo = !validator.isEmpty(params.cfsp_tipopg);
            var validate_carga = !validator.isEmpty(params.cfsp_tpcarga);                     
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
		if(validate_fecha && validate_tipo && validate_carga){
			//-- Crear objeto de compra
            const {cfsp_fecha, cfsp_tipopg, cfsp_tpcarga, cfsp_totalf, cfsp_totalp, cfsp_totpend, cfsp_totmol, cfsp_totneto, cfsp_deposito, usr_id, wcafe_id } = params;
            const query = `
                INSERT INTO cstb_shop (cfsp_fecha, cfsp_tipopg, cfsp_tpcarga, cfsp_totalf, cfsp_totalp, cfsp_totpend, cfsp_totmol, cfsp_totneto, cfsp_deposito, usr_id, wcafe_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            `
            mysqlConnection.query(query, [cfsp_fecha, cfsp_tipopg, cfsp_tpcarga, cfsp_totalf, cfsp_totalp, cfsp_totpend, cfsp_totmol, cfsp_totneto, cfsp_deposito, usr_id, wcafe_id], (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar compra!",
                        error: err
                    });  
                }
                var idshop =  rows.insertId;
                 //--Actualizar detalle estado de detalle de peso..//
                 mysqlConnection.query("UPDATE cstb_coffeeweight SET wcafe_sts = '"+stswt+"' WHERE wcafe_id = "+params.wcafe_id, (err, rowd, fields)=>{
                    if(err){
                        console.log(err) 
                    }
                    return res.status(200).send({
                        status: "success",
                        shop: idshop
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
    savedt: (req, res) => {
		//-- Recoger los parámetros de la petición--//
		var params = req.body
        var stsquery=1;
        for(let det in params){
            var row = params[det];
            //-- Crear objeto de detalle de peso
            const {dtwcafe_id, dtcfsp_totltph, dtcfsp_latauvxph, dtcfsp_tlatasuva, dtcfsp_costmol, dtcfsp_tmolida, dtcfsp_phum, dtcfsp_qrefin, dtcfsp_precqq, dtcfsp_platasuva, dtcfsp_totalph, dtcfsp_qqoro, dtcfsp_importef, dtcfsp_tpago, cfsp_id}= row;
            const query = `
                INSERT INTO cstb_detcoffeeshop (dtwcafe_id, dtcfsp_totltph, dtcfsp_latauvxph, dtcfsp_tlatasuva, dtcfsp_costmol, dtcfsp_tmolida, dtcfsp_phum, dtcfsp_qrefin, dtcfsp_precqq, dtcfsp_platasuva, dtcfsp_totalph, dtcfsp_qqoro, dtcfsp_importef, dtcfsp_tpago, cfsp_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
            `;
            mysqlConnection.query(query,[dtwcafe_id, dtcfsp_totltph, dtcfsp_latauvxph, dtcfsp_tlatasuva, dtcfsp_costmol, dtcfsp_tmolida, dtcfsp_phum, dtcfsp_qrefin, dtcfsp_precqq, dtcfsp_platasuva, dtcfsp_totalph, dtcfsp_qqoro, dtcfsp_importef, dtcfsp_tpago, cfsp_id], (err, rows, fields)=>{
                if(err){
                    stsquery = 0;
                    console.log(err) 
                }
            });
        }
        if(stsquery == 0){
            return res.status(500).send({
                status: "Error",
                message: "Error al registrar detalle de compra!",
            }) 
        }else{
            return res.status(200).send({
                status: "success",
                message: "Detalle de compra registrado correctamente!"
            }); 
        }
	},
    savepgfc: (req, res) => {
		//-- Recoger los parámetros de la petición
		var params = req.body;
        
        //-- Crear objeto de pago compra
        const {cfsp_tipopg, cfsp_totalp, cfsp_totpend, cfsp_monto, cfsp_totpendnw, cfsp_id, usr_id } = params;
        const query = `
            INSERT INTO cstb_pagoshop (pgfc_fecha, pgfc_antpend, pgfc_monto, pgfc_antpendnw, cfsp_id, usr_id) VALUES (now(), ?, ?, ?, ?, ?);
        `
        mysqlConnection.query(query, [cfsp_totpend, cfsp_monto, cfsp_totpendnw, cfsp_id, usr_id], (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al registrar pago de compra!",
                    error: err
                });  
            }
            
            //--Actualizar detalle estado de detalle de peso..//
            const queryup = "UPDATE cstb_shop SET cfsp_tipopg = ?, cfsp_totalp = ?, cfsp_totpend = ? WHERE cfsp_id = ?"
            mysqlConnection.query(queryup,[cfsp_tipopg, cfsp_totalp, cfsp_totpendnw, cfsp_id], (err, rowd, fields)=>{
                if(err){
                    console.log(err) 
                }
                return res.status(200).send({
                    status: "success"
                }); 
            });       
        });
	},
    savedp: (req, res) => {
		//-- Recoger los parámetros de la petición
		var params = req.body;
        console.log('params: ', JSON.stringify(params))
        var stswt = '';
        if(params.cfsp_tipopg == 'Completo'){
            stswt = 'Comprado';
        }else{
            stswt = 'Pendiente';
        }
		//-- Validar los datos
		try{
            var validate_fecha = !validator.isEmpty(params.cfsp_fecha);
            var validate_tipo = !validator.isEmpty(params.cfsp_tipopg);
            var validate_carga = !validator.isEmpty(params.cfsp_tpcarga);                     
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
		if(validate_fecha && validate_tipo && validate_carga){
			//-- Crear objeto de compra
            const {cfsp_fecha, cfsp_tipopg, cfsp_totalf, cfsp_totalp, cfsp_totpend, cfsp_totmol, cfsp_totneto, cfsp_deposito, usr_id, cfsp_id } = params;
            const query = `
                UPDATE cstb_shop SET cfsp_fecha=?, cfsp_tipopg=?, cfsp_totalf=?, cfsp_totalp=?, cfsp_totpend=?, cfsp_totmol=?, cfsp_totneto=?, cfsp_deposito=?, usr_id=? WHERE cfsp_id=?;
            `
            mysqlConnection.query(query, [cfsp_fecha, cfsp_tipopg, cfsp_totalf, cfsp_totalp, cfsp_totpend, cfsp_totmol, cfsp_totneto, cfsp_deposito, usr_id, cfsp_id], (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar actualizar compra!",
                        error: err
                    });  
                }
                 //--Eliminar detalle de compra registrado//
                 mysqlConnection.query("DELETE FROM cstb_detcoffeeshop WHERE cfsp_id = "+params.cfsp_id, (err, rowd, fields)=>{
                    if(err){
                        console.log(err) 
                    }
                    return res.status(200).send({
                        status: "success",
                        shop: params.cfsp_id
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
    show: (req, res) => {
		mysqlConnection.query("SELECT vta_id, cfsp_fecha, cfsp_tipopg FROM cstb_shop ORDER BY cfsp_fecha;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar compras!"
                })  
            }
            return res.status(200).send({
                status: "success",
                shops: rows
            });        
        })
    },
    showg: (req, res) => {
		mysqlConnection.query("SELECT s.*, p.prod_nombre FROM cstb_shop as s INNER JOIN cstb_coffeeweight as w On (s.wcafe_id = w.wcafe_id) INNER JOIN cstb_producers as p On (w.prod_id = p.prod_id) ORDER BY s.cfsp_fecha limit 50000;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar compras!"
                })  
            }
            return res.status(200).send({
                status: "success",
                shops: rows
            });        
        })
    },
    showpen: (req, res) => {
		mysqlConnection.query("SELECT s.*, p.prod_nombre FROM cstb_shop As s INNER JOIN cstb_coffeeweight As c On (s.wcafe_id=c.wcafe_id) INNER JOIN cstb_producers As p On (c.prod_id=p.prod_id) WHERE s.cfsp_tipopg = 'Pendiente' ORDER BY s.cfsp_fecha, c.prod_id;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar compras pendientes de pago!"
                })  
            }
            return res.status(200).send({
                status: "success",
                shops: rows
            });        
        })
    },
    showdep: (req, res) => {
		mysqlConnection.query("SELECT s.*, p.prod_id, p.prod_nombre FROM cstb_shop As s INNER JOIN cstb_coffeeweight As c On (s.wcafe_id=c.wcafe_id) INNER JOIN cstb_producers As p On (c.prod_id=p.prod_id) WHERE s.cfsp_deposito = 'Si' ORDER BY s.cfsp_fecha, c.prod_id;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar compras en deposito!"
                })  
            }
            return res.status(200).send({
                status: "success",
                shops: rows
            });        
        })
    },
    showdc: (req, res) => {
        var idcp = req.params.id;

		mysqlConnection.query("SELECT c.dtwcafe_tipo, c.dtwcafe_peso, c.dtwcafe_molida, c.dtwcafe_sacos, c.dtwcafe_precio, c.dtwcafe_phum, c.dtwcafe_tipopeso, c.dtwcafe_stsc, d.dtcfsp_qrefin, d.dtcfsp_qqoro FROM cstb_detcoffeeshop As d INNER JOIN cstb_detcoffeeweight As c On d.dtwcafe_id=c.dtwcafe_id WHERE d.cfsp_id = " + idcp + " ORDER BY c.dtwcafe_tipo;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al buscar detalle de compra!"
                })  
            }
            if(rows.length > 0){
                return res.status(200).send({
                    status: "success",
                    shopdt: rows
                }); 
            }else{
                return res.status(200).send({
                    status: "empty",
                    message: "Compra sin detalle!"
                }); 
            }
                   
        })
    },
    showpr: (req, res) => {
        var idp = req.params.id;
		mysqlConnection.query("SELECT s.*, p.prod_nombre FROM cstb_shop as s INNER JOIN cstb_coffeeweight as w On (s.wcafe_id = w.wcafe_id) INNER JOIN cstb_producers as p On (w.prod_id = p.prod_id) WHERE w.prod_id = "+idp+" ORDER BY s.cfsp_fecha limit 50000;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar compras!"
                })  
            }
            return res.status(200).send({
                status: "success",
                shops: rows
            });        
        })
    },
    showdt: (req, res) => {
        var idc = req.params.id;
		mysqlConnection.query("SELECT * FROM cstb_detcoffeeshop WHERE cfsp_id = "+idc+" ORDER BY dtcfsp_id;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar compras!"
                })  
            }
            return res.status(200).send({
                status: "success",
                shops: rows
            });        
        })
    },
    showrpt: (req, res) => {
        var params = req.body
        var fhini=params.fhini + ' 00:00:00'
        var fhfin=params.fhfin + ' 23:59:00'
        var idcli=params.cid
        var query;
        var exquery;

        if(idcli == 0){
            query="SELECT s.*, p.prod_nombre FROM cstb_shop as s INNER JOIN cstb_coffeeweight as w On (s.wcafe_id = w.wcafe_id) INNER JOIN cstb_producers as p On (w.prod_id = p.prod_id) " + 
            "WHERE s.cfsp_fecha Between '"+fhini+"' and '"+fhfin+"' ORDER BY s.cfsp_fecha limit 50000;"

            exquery="SELECT s.cfsp_id idcp, s.cfsp_fecha Fecha, p.prod_nombre productor, p.prod_rtn rtn, (t.dtwcafe_peso - t.dtwcafe_sacos) pneto, t.dtwcafe_phum hum, c.dtcfsp_qqoro qq, s.cfsp_totalf tfac, s.cfsp_totmol tmol, s.cfsp_totneto tneto, s.cfsp_totalp tfpg, s.cfsp_totpend tfpd FROM cstb_shop as s INNER JOIN cstb_detcoffeeshop c On c.cfsp_id=s.cfsp_id INNER JOIN cstb_coffeeweight as w On (s.wcafe_id = w.wcafe_id) " + 
                   "INNER JOIN cstb_producers as p On (w.prod_id = p.prod_id) INNER JOIN cstb_detcoffeeweight t on t.dtwcafe_id=c.dtwcafe_id WHERE s.cfsp_fecha Between '"+fhini+"' and '"+fhfin+"' ORDER BY s.cfsp_fecha, w.prod_id limit 2000;"

            /*exquery = "SELECT s.cfsp_id ID, s.cfsp_fecha Fecha, s.cfsp_tipopg Pago, s.cfsp_tpcarga Carga, s.cfsp_totalf Total_Fact, s.cfsp_totalp Pagado, s.cfsp_totpend Pendiente, s.cfsp_totmol T_Molida, " +
            "s.cfsp_totneto T_Neto, s.cfsp_deposito Deposito, p.prod_nombre Productor, d.dtcfsp_totltph Latas_PH, d.dtcfsp_latauvxph Lt_Uva_PH, d.dtcfsp_tlatasuva Lts_Uva, d.dtcfsp_costmol Costo_Mol, d.dtcfsp_phum P_Humed, " + 
            "d.dtcfsp_precqq Precio, d.dtcfsp_totalph Total_PH, d.dtcfsp_qrefin QQ_Ref, d.dtcfsp_qqoro QQ_Oro, d.dtcfsp_importef Importe FROM cstb_shop as s INNER JOIN cstb_coffeeweight as w On (s.wcafe_id = w.wcafe_id) " + 
            "INNER JOIN cstb_producers as p On (w.prod_id = p.prod_id) INNER JOIN cstb_detcoffeeshop d On d.cfsp_id=w.wcafe_id WHERE s.cfsp_fecha Between '"+fhini+"' and '"+fhfin+"' ORDER BY s.cfsp_fecha limit 50000;"*/
        }else{ 
            query="SELECT s.*, p.prod_nombre FROM cstb_shop as s INNER JOIN cstb_coffeeweight as w On (s.wcafe_id = w.wcafe_id) INNER JOIN cstb_producers as p On (w.prod_id = p.prod_id) " + 
            "WHERE w.prod_id = "+idcli+" and s.cfsp_fecha Between '"+fhini+"' and '"+fhfin+"' ORDER BY s.cfsp_fecha limit 50000;"

            exquery="SELECT s.cfsp_id idcp, s.cfsp_fecha Fecha, p.prod_nombre productor, p.prod_rtn rtn, (t.dtwcafe_peso - t.dtwcafe_sacos) pneto, t.dtwcafe_phum hum, c.dtcfsp_qqoro qq, s.cfsp_totalf tfac, s.cfsp_totmol tmol, s.cfsp_totneto tneto, s.cfsp_totalp tfpg, s.cfsp_totpend tfpd FROM cstb_shop as s INNER JOIN cstb_detcoffeeshop c On c.cfsp_id=s.cfsp_id INNER JOIN cstb_coffeeweight as w On (s.wcafe_id = w.wcafe_id) " + 
                   "INNER JOIN cstb_producers as p On (w.prod_id = p.prod_id) INNER JOIN cstb_detcoffeeweight t on t.dtwcafe_id=c.dtwcafe_id WHERE w.prod_id = "+idcli+" and s.cfsp_fecha Between '"+fhini+"' and '"+fhfin+"' ORDER BY s.cfsp_fecha, w.prod_id limit 2000;"
                   
            /*exquery= "SELECT s.cfsp_id ID, s.cfsp_fecha Fecha, s.cfsp_tipopg Pago, s.cfsp_tpcarga Carga, s.cfsp_totalf Total_Fact, s.cfsp_totalp Pagado, s.cfsp_totpend Pendiente, s.cfsp_totmol T_Molida, " +
            "s.cfsp_totneto T_Neto, s.cfsp_deposito Deposito, p.prod_nombre Productor, d.dtcfsp_totltph Latas_PH, d.dtcfsp_latauvxph Lt_Uva_PH, d.dtcfsp_tlatasuva Lts_Uva, d.dtcfsp_costmol Costo_Mol, d.dtcfsp_phum P_Humed, " + 
            "d.dtcfsp_precqq Precio, d.dtcfsp_totalph Total_PH, d.dtcfsp_qrefin QQ_Ref, d.dtcfsp_qqoro QQ_Oro, d.dtcfsp_importef Importe FROM cstb_shop as s INNER JOIN cstb_coffeeweight as w On (s.wcafe_id = w.wcafe_id) " + 
            "INNER JOIN cstb_producers as p On (w.prod_id = p.prod_id) INNER JOIN cstb_detcoffeeshop d On d.cfsp_id=w.wcafe_id WHERE w.prod_id = "+idcli+" and s.cfsp_fecha Between '"+fhini+"' and '"+fhfin+"' ORDER BY s.cfsp_fecha limit 50000;"*/
        }
		mysqlConnection.query(query, (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar compras!"
                })  
            }
            mysqlConnection.query(exquery, (errd, rowsd, fields)=>{
                if(errd){
                    console.log(errd)
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al listar compras!"
                    })  
                }
                return res.status(200).send({
                    status: "success",
                    shops: rows,
                    dtshops: rowsd
                });        
            })       
        })
    },
    showrpcpra: (req, res) =>{
        var idcp = req.params.id;

        var query;
        query = "SELECT t.dtwcafe_tipo, t.dtwcafe_peso, t.dtwcafe_sacos, (t.dtwcafe_peso - t.dtwcafe_sacos) pneto, c.dtcfsp_phum, c.dtcfsp_totalph, c.dtcfsp_qrefin, c.dtcfsp_qqoro, c.dtcfsp_importef, " +
              " case when s.cfsp_deposito='No' Then " +
              "Case when t.dtwcafe_tipopeso = 'Pesado' " +
              "then case when t.dtwcafe_tipo='Uva' " +
              "then c.dtcfsp_platasuva " +
              "else c.dtcfsp_precqq end " + 
             "else c.dtcfsp_platasuva end " +
             "Else 0 End Precio FROM cstb_shop as s INNER JOIN cstb_detcoffeeshop c On c.cfsp_id=s.cfsp_id INNER JOIN cstb_coffeeweight as w On (s.wcafe_id = w.wcafe_id) " +
             "INNER JOIN cstb_producers as p On (w.prod_id = p.prod_id) INNER JOIN cstb_detcoffeeweight t on t.dtwcafe_id=c.dtwcafe_id where s.cfsp_id = "+idcp+" ORDER BY s.cfsp_fecha, w.prod_id limit 2000;" 
             mysqlConnection.query(query, (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al listar compras!"
                    })  
                }
                return res.status(200).send({
                    status: "success",
                    shops: rows
                });       
            });
    }
}

module.exports = controller;