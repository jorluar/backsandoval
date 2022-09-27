'use strict'

const validator = require('validator')
const mysqlConnection = require('../database');

const controller = {
    save: (req, res) => {
		//-- Recoger los parámetros de la petición--//
		var params = req.body
        var stsquery=1;
        for(let det in params){
            var row = params[det];
            //-- Crear objeto de detalle de peso
            const {dtwcafe_id, dtcfsp_totltph, dtcfsp_deposito, dtcfsp_latauvxph, dtcfsp_tlatasuva, dtcfsp_costmol, dtcfsp_tmolida, dtcfsp_phum, dtcfsp_qrefin, dtcfsp_precqq, dtcfsp_platasuva, dtcfsp_totalph, dtcfsp_qqoro, dtcfsp_importef, cfsp_id}= row;
            const query = `
                INSERT INTO cstb_detcoffeeshop (dtwcafe_id, dtcfsp_totltph, dtcfsp_deposito, dtcfsp_latauvxph, dtcfsp_tlatasuva, dtcfsp_costmol, dtcfsp_tmolida, dtcfsp_phum, dtcfsp_qrefin, dtcfsp_precqq, dtcfsp_platasuva, dtcfsp_totalph, dtcfsp_qqoro, dtcfsp_importef, cfsp_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
            `;
            mysqlConnection.query(query,[dtwcafe_id, dtcfsp_totltph, dtcfsp_deposito, dtcfsp_latauvxph, dtcfsp_tlatasuva, dtcfsp_costmol, dtcfsp_tmolida, dtcfsp_phum, dtcfsp_qrefin, dtcfsp_precqq, dtcfsp_platasuva, dtcfsp_totalph, dtcfsp_qqoro, dtcfsp_importef, cfsp_id], (err, rows, fields)=>{
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
    savedp: (req, res) => {
		//-- Recoger los parámetros de la petición--//
		var params = req.body
        var stsquery=1;
        for(let det in params){
            var row = params[det];
            //-- Crear objeto de detalle de peso
            const {dtwcafe_id, dtcfsp_totltph, dtcfsp_deposito, dtcfsp_latauvxph, dtcfsp_tlatasuva, dtcfsp_costmol, dtcfsp_tmolida, dtcfsp_phum, dtcfsp_qrefin, dtcfsp_precqq, dtcfsp_platasuva, dtcfsp_totalph, dtcfsp_qqoro, dtcfsp_importef, cfsp_id}= row;
            const query = `
                INSERT INTO cstb_detcoffeeshop (dtwcafe_id, dtcfsp_totltph, dtcfsp_deposito, dtcfsp_latauvxph, dtcfsp_tlatasuva, dtcfsp_costmol, dtcfsp_tmolida, dtcfsp_phum, dtcfsp_qrefin, dtcfsp_precqq, dtcfsp_platasuva, dtcfsp_totalph, dtcfsp_qqoro, dtcfsp_importef, cfsp_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
            `;
            mysqlConnection.query(query,[dtwcafe_id, dtcfsp_totltph, dtcfsp_deposito, dtcfsp_latauvxph, dtcfsp_tlatasuva, dtcfsp_costmol, dtcfsp_tmolida, dtcfsp_phum, dtcfsp_qrefin, dtcfsp_precqq, dtcfsp_platasuva, dtcfsp_totalph, dtcfsp_qqoro, dtcfsp_importef, cfsp_id], (err, rows, fields)=>{
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
    showg: (req, res) => {
		mysqlConnection.query("SELECT * FROM cstb_detcoffeeshop ORDER BY dtcfsp_id;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar detalle de compra de cafe!"
                })  
            }
            return res.status(200).send({
                status: "success",
                dtshop: rows
            });        
        })
    }
}

module.exports = controller;