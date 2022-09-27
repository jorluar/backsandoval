'use strict'

const validator = require('validator')
const mysqlConnection = require('../database');

const controller = {
    getshop: (req, res) => {
		//-- Recoger los parámetros de la petición
		var params = req.body

		//-- Validar los datos
		try{
            var validate_fechaini = !validator.isEmpty(params.dash_fechai);
            var validate_fechaf = !validator.isEmpty(params.dash_fechaf);                    
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
		if(validate_fechaini && validate_fechaf){
			//-- Consultar compras de cafe en el rango de fechas enviado//
            mysqlConnection.query("SELECT d.dtwcafe_tipo as tipo, SUM(CASE WHEN MONTH(c.wcafe_fecha) = 9 THEN d.dtwcafe_peso-d.dtwcafe_sacos ELSE 0 END) n9, SUM(CASE WHEN MONTH(c.wcafe_fecha) = 10 THEN d.dtwcafe_peso-d.dtwcafe_sacos ELSE 0 END) n10, SUM(CASE WHEN MONTH(c.wcafe_fecha) = 11 THEN d.dtwcafe_peso-d.dtwcafe_sacos ELSE 0 END) n11, SUM(CASE WHEN MONTH(c.wcafe_fecha) = 12 THEN d.dtwcafe_peso-d.dtwcafe_sacos ELSE 0 END) n12, SUM(CASE WHEN MONTH(c.wcafe_fecha) = 1 THEN d.dtwcafe_peso-d.dtwcafe_sacos ELSE 0 END) n1, SUM(CASE WHEN MONTH(c.wcafe_fecha) = 2 THEN d.dtwcafe_peso-d.dtwcafe_sacos ELSE 0 END) n2, SUM(CASE WHEN MONTH(c.wcafe_fecha) = 3 THEN d.dtwcafe_peso-d.dtwcafe_sacos ELSE 0 END) n3, SUM(CASE WHEN MONTH(c.wcafe_fecha) = 4 THEN d.dtwcafe_peso-d.dtwcafe_sacos ELSE 0 END) n4, SUM(CASE WHEN MONTH(c.wcafe_fecha) = 5 THEN d.dtwcafe_peso-d.dtwcafe_sacos ELSE 0 END) n5 FROM cstb_detcoffeeweight d INNER JOIN cstb_coffeeweight c On d.wcafe_id = c.wcafe_id WHERE c.wcafe_fecha BETWEEN '"+params.dash_fechai+"' AND '"+params.dash_fechaf+"' GROUP BY d.dtwcafe_tipo;;", (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al listar compras!"
                    })  
                }
                return res.status(200).send({
                    status: "success",
                    dashboard: rows
                });        
            }); 
		}else{
			return res.status(500).send({
				status: "Error",
				message: "Datos vacíos, intente de nuevo!"
			}) 
		}
	}
}

module.exports = controller;