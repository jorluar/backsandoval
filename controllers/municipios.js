'use strict'

const mysqlConnection = require('../database')

var controller = {
	//--Listar todos los municipios registrados--//
    show: (req, res) => {
		mysqlConnection.query("SELECT muni_id, muni_name FROM cstb_municipios ORDER BY muni_name;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar municipios!"
                }); 
            }
            return res.status(200).send({
                status: "success",
                muni: rows
            });        
        });
    },
	//--Listar los municipios de un departamento específico--//
	showm: (req, res) => {
		mysqlConnection.query("SELECT m.muni_id, m.muni_name, d.depto_name FROM cstb_municipios As m INNER JOIN cstb_departamentos As d On m.depto_id = d.depto_id ORDER BY m.muni_name;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar municipios!"
                });  
            }
            if(rows.length > 0){
                return res.status(200).send({
                    status: "success",
                    municipios: rows
                }); 
            }else{
               console.log('No se encontraron los municipios.')
            }     
        });
	}
}

module.exports = controller