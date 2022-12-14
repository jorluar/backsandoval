'use strict'

const validator = require('validator')
const mysqlConnection = require('../database');

const controller = {
    save: (req, res) => { 
		//-- Recoger los parámetros de la petición
		var params = req.body

		//-- Validar los datos
		try{
            var validate_comu = !validator.isEmpty(params.add_comu);                        
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
		if(validate_comu){
			//-- Crear objeto de domicilio
            const {add_comu, muni_id} = params;
            const query = `
                INSERT INTO cstb_addresses (add_comu, muni_id) VALUES (?, ?);
            `
            mysqlConnection.query(query, [add_comu, muni_id], (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar domicilio!",
                        error: err
                    })  
                }
                return res.status(200).send({
                    status: "success",
                    address: rows.insertId
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
		//--Recoger datos del domicilio
		var params = req.body;
        //-- Validar los datos
        try{
            var validate_comu = !validator.isEmpty(params.add_comu);                        
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
        if(validate_comu){
            //--Comprobar si nuevo domicilio existe en base de datos--//
            mysqlConnection.query("SELECT * FROM cstb_addresses WHERE add_id = "+params.add_id+";", (err, address, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al buscar domicilio específico!"
                    })  
                }
                if (address.length > 0) {
                    //-- Si existe --//
                    //-- Crear objeto de domicilio
                    const {add_comu, muni_id, add_id} = params;
                    const query = `
                        UPDATE cstb_addresses SET add_comu=?, muni_id=? WHERE add_id=?;
                    `;
                    //--Actualizar información del domicilio--//
                    mysqlConnection.query(query, [add_comu, muni_id, add_id], (err, rows, fields)=>{
                        if(err){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al actualizar domicilio!",
                                error: err
                            })  
                        }
                        return res.status(200).send({
                            status: "success",
                            address: rows
                        });        
                    }); 
                }else{
                    return res.status(500).send({
                        status: "Empty",
                        message: "El domicilio "+params.add_id+" no está registrado!"
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
		mysqlConnection.query("Select d.add_id, concat(d.add_comu,'-',m.muni_name, '-', t.depto_name) direccion from cstb_addresses d inner join cstb_municipios m On (d.muni_id=m.muni_id) inner join cstb_departamentos t On (m.depto_id=t.depto_id) Order by d.add_comu;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar domicilios!"
                })  
            }
            return res.status(200).send({
                status: "success",
                address: rows
            });        
        })
    },
    showg: (req, res) => {
        console.log('probando address')
		mysqlConnection.query("SELECT a.add_id, a.add_comu, m.muni_id, m.muni_name, d.depto_name FROM cstb_addresses a INNER JOIN cstb_municipios As m On (a.muni_id=m.muni_id) INNER JOIN cstb_departamentos As d On m.depto_id = d.depto_id ORDER BY a.add_comu;", (err, rows, fields)=>{
            if(err){
                console.log(err)
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar domicilios!"
                })  
            }
            return res.status(200).send({
                status: "success",
                address: rows
            });        
        });
    }
}

module.exports = controller;