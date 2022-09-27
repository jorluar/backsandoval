'use strict'

const validator = require('validator')
const mysqlConnection = require('../database');

const controller = {
    save: (req, res) => {
		//-- Recoger los parámetros de la petición
		var params = req.body

		//-- Validar los datos--//
		try{
            var validate_fecha = !validator.isEmpty(params.wcafe_fecha);
            var validate_sts = !validator.isEmpty(params.wcafe_sts);
            //var validate_user = !validator.isEmpty(params.usr_id);            
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
		if(validate_fecha && validate_sts){
			//-- Crear objeto de peso de cafe --//
            const {wcafe_fecha, wcafe_sts, usr_id, prod_id} = params;
            const query = `
                INSERT INTO cstb_coffeeweight (wcafe_fecha, wcafe_sts, usr_id, prod_id) VALUES (?, ?, ?, ?);
            `
            mysqlConnection.query(query, [wcafe_fecha, wcafe_sts, usr_id, prod_id], (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar peso de cafe!",
                        error: err
                    })  
                }
                return res.status(200).send({
                    status: "success",
                    idpeso: rows.insertId
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
		//--Recoger datos del peso de cafe
		var params = req.body;

        //-- Validar los datos
        try{
            //var validate_idwcafe = !validator.isEmpty(params.wcafe_id);
            var validate_fecha = !validator.isEmpty(params.wcafe_fecha);
            var validate_sts = !validator.isEmpty(params.wcafe_sts);
            //var validate_user = !validator.isEmpty(params.usr_id);            
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
        if(validate_fecha && validate_sts){
            //--Comprobar si nuevo peso de cafe existe en base de datos--//
            mysqlConnection.query("SELECT * FROM cstb_coffeeweight WHERE wcafe_id = "+params.wcafe_id+";", (err, coffew, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al buscar peso de cafe específico!"
                    })  
                }
                if (coffew.length > 0) {
                    //-- Si existe --//
                    //-- Crear objeto de peso de cafe
                    const {wcafe_fecha, wcafe_sts, usr_id, prod_id, wcafe_id} = params;
                    const query = `
                        UPDATE cstb_coffeeweight SET wcafe_fecha=?, wcafe_sts=?, usr_id=?, prod_id=? WHERE wcafe_id=?;
                    `;
                    //--Actualizar información del peso de cafe--//
                    mysqlConnection.query(query, [wcafe_fecha, wcafe_sts, usr_id, prod_id, wcafe_id], (err, rows, fields)=>{
                        if(err){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al actualizar peso de cafe!",
                                error: err
                            })  
                        }
                        return res.status(200).send({
                            status: "success",
                            message: "Peso de cafe actualizado correctamente!"
                        });        
                    }); 
                }else{
                    return res.status(500).send({
                        status: "Empty",
                        message: "El peso de cafe #: "+params.wcafe_id+" no está registrado!"
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
    delete: (req, res) => {
        var idw = req.params.id
        //--Eliminar registro de peso encabezado
        mysqlConnection.query("DELETE FROM cstb_coffeeweight WHERE wcafe_id="+idw, (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al eliminar encabezado de peso de cafe!"
                })  
            }
            //--Eliminar registro de peso detalle
            mysqlConnection.query("DELETE FROM cstb_detcoffeeweight WHERE wcafe_id="+idw, (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al eliminar detalle de peso de cafe!"
                    })  
                }
                return res.status(200).send({
                    status: "success"
                });
            });        
        });
    },
    show: (req, res) => {
		mysqlConnection.query("SELECT wcafe_id, wcafe_fecha FROM cstb_coffeeweight ORDER BY wcafe_fecha;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar peso de cafe!"
                })  
            }
            return res.status(200).send({
                status: "success",
                pesoc: rows
            });        
        });
    },
    showg: (req, res) => {
		mysqlConnection.query("SELECT c.*, u.usr_usuario, p.prod_nombre, p.prod_rtn FROM cstb_coffeeweight As c INNER JOIN cstb_users As u On (c.usr_id=u.usr_id) INNER JOIN cstb_producers As p On (c.prod_id=p.prod_id) Where c.wcafe_sts = 'Nuevo' ORDER BY c.wcafe_id desc;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar peso de cafes!",
                    error: err
                })  
            }
            return res.status(200).send({
                status: "success",
                pesoc: rows
            });        
        });
    },
    showdt: (req, res) => {
        var idpeso = req.params.id;
		mysqlConnection.query("SELECT c.wcafe_id, c.wcafe_fecha, c.prod_id, d.*, u.usr_usuario, p.prod_nombre FROM cstb_coffeeweight As c INNER JOIN cstb_detcoffeeweight As d On (c.wcafe_id=d.wcafe_id) INNER JOIN cstb_users As u On (c.usr_id=u.usr_id) INNER JOIN cstb_producers As p On (c.prod_id=p.prod_id) Where c.wcafe_id = " + idpeso + " Order By c.wcafe_fecha;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar peso de cafes!",
                    error: err
                })  
            }
            return res.status(200).send({
                status: "success",
                pesoc: rows
            });        
        }); 
    },
    showdts: (req, res) => {
        var idpeso = req.params.id;

		mysqlConnection.query("SELECT c.wcafe_id, c.wcafe_fecha, c.prod_id, d.*, u.usr_usuario, p.prod_nombre, s.* FROM cstb_coffeeweight As c INNER JOIN cstb_detcoffeeweight As d On (c.wcafe_id=d.wcafe_id) INNER JOIN cstb_users As u On (c.usr_id=u.usr_id) INNER JOIN cstb_producers As p On (c.prod_id=p.prod_id) INNER JOIN cstb_detcoffeeshop As s On (d.dtwcafe_id=s.dtwcafe_id) Where c.wcafe_id = " + idpeso + " Order By c.wcafe_fecha;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar peso de cafes!",
                    error: err
                })  
            }
            return res.status(200).send({
                status: "success",
                pesoc: rows
            });        
        }); 
    }
}

module.exports = controller;