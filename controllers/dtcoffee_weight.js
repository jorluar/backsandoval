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
            //--Comprobar caracteristicas--//
            var pg01=0,pg02=0,pg03=0,pg04=0,pg05=0,pg06=0,pg07=0,uv01=0,uv02=0,uv03=0,uv04=0,uv05=0,uv06=0,uv07=0,rv01=0,rv02=0,rv03=0,rv04=0,rv05=0,rv06=0,ch01=0,ch02=0,ch03=0,ch04=0,ch05=0,ch06=0,vd01=0,vd02=0,vd03=0,vd04=0,vd05=0;
            for(let chcafe in row.chcafe){
                var rowch = row.chcafe[chcafe];
                //--Pergamino--//
                if(rowch=='dtwcafe_pg01'){pg01=1;} if(rowch=='dtwcafe_pg02'){pg02=1;} if(rowch=='dtwcafe_pg03'){pg03=1;} if(rowch=='dtwcafe_pg04'){pg04=1;} if(rowch=='dtwcafe_pg05'){pg05=1;} if(rowch=='dtwcafe_pg06'){pg06=1;} if(rowch=='dtwcafe_pg07'){pg07=1;}
                //--Revuelto--//
                if(rowch=='dtwcafe_rv01'){rv01=1;} if(rowch=='dtwcafe_rv02'){rv02=1;} if(rowch=='dtwcafe_rv03'){rv03=1;} if(rowch=='dtwcafe_rv04'){rv04=1;} if(rowch=='dtwcafe_rv05'){rv05=1;} if(rowch=='dtwcafe_rv06'){rv06=1;} if(rowch=='dtwcafe_rv07'){rv07=1;}
                 //--Uva--//
                 if(rowch=='dtwcafe_uv01'){uv01=1;} if(rowch=='dtwcafe_uv02'){uv02=1;} if(rowch=='dtwcafe_uv03'){uv03=1;} if(rowch=='dtwcafe_uv04'){uv04=1;} if(rowch=='dtwcafe_uv05'){uv05=1;} if(rowch=='dtwcafe_uv06'){uv06=1;}
                //--Chancha--//
                if(rowch=='dtwcafe_ch01'){ch01=1;} if(rowch=='dtwcafe_ch02'){ch02=1;} if(rowch=='dtwcafe_ch03'){ch03=1;} if(rowch=='dtwcafe_ch04'){ch04=1;} if(rowch=='dtwcafe_ch05'){ch05=1;} if(rowch=='dtwcafe_ch06'){ch06=1;} 
                //--Verde--//
                if(rowch=='dtwcafe_vd01'){vd01=1;} if(rowch=='dtwcafe_vd02'){vd02=1;} if(rowch=='dtwcafe_vd03'){vd03=1;} if(rowch=='dtwcafe_vd04'){vd04=1;} if(rowch=='dtwcafe_vd05'){vd05=1;}
            }
            //-- Crear objeto de detalle de peso
            const {dtwcafe_peso, dtwcafe_molida,dtwcafe_tipo,dtwcafe_sacos,dtwcafe_sts,dtwcafe_precio,dtwcafe_phum,dtwcafe_tipopeso,dtwcafe_stsc, wcafe_id}= row;
            const query = `
                INSERT INTO cstb_detcoffeeweight (dtwcafe_peso,dtwcafe_molida,dtwcafe_tipo,dtwcafe_sacos,dtwcafe_sts,dtwcafe_precio,dtwcafe_phum,dtwcafe_pg01,dtwcafe_pg02,dtwcafe_pg03,dtwcafe_pg04,dtwcafe_pg05,dtwcafe_pg06,dtwcafe_pg07,dtwcafe_uv01,dtwcafe_uv02,dtwcafe_uv03,dtwcafe_uv04,dtwcafe_uv05,dtwcafe_uv06,dtwcafe_uv07,dtwcafe_rv01,dtwcafe_rv02,dtwcafe_rv03,dtwcafe_rv04,dtwcafe_rv05,dtwcafe_rv06,dtwcafe_ch01,dtwcafe_ch02,dtwcafe_ch03,dtwcafe_ch04,dtwcafe_ch05,dtwcafe_ch06,dtwcafe_vd01,dtwcafe_vd02,dtwcafe_vd03,dtwcafe_vd04,dtwcafe_vd05,dtwcafe_tipopeso,dtwcafe_stsc,wcafe_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
            `;
            mysqlConnection.query(query,[dtwcafe_peso,dtwcafe_molida,dtwcafe_tipo,dtwcafe_sacos,dtwcafe_sts,dtwcafe_precio,dtwcafe_phum,pg01,pg02,pg03,pg04,pg05,pg06,pg07,uv01,uv02,uv03,uv04,uv05,uv06,uv07,rv01,rv02,rv03,rv04,rv05,rv06,ch01,ch02,ch03,ch04,ch05,ch06,vd01,vd02,vd03,vd04,vd05,dtwcafe_tipopeso,dtwcafe_stsc,wcafe_id], (err, rows, fields)=>{
                if(err){
                    stsquery = 0;
                    console.log(err) 
                } 
            });
        }
        if(stsquery == 0){
            return res.status(500).send({
                status: "Error",
                message: "Error al registrar detalle de peso!",
            }) 
        }else{
            return res.status(200).send({
                status: "success",
                message: "Detalle de peso registrado correctamente!"
            }); 
        }
	},
    update: (req, res) => {
		//-- Recoger los parámetros de la petición--//
		var params = req.body;
        //console.log('det recibido: ' + JSON.stringify(params))
       
        var stsquery=1, stsedit=0;
        for(let det in params){
            var row = params[det];
            if(row.dtwcafe_sts == "Nuevo"){
                stsedit=1;
                //--Comprobar caracteristicas--//
                var pg01=0,pg02=0,pg03=0,pg04=0,pg05=0,pg06=0,pg07=0,uv01=0,uv02=0,uv03=0,uv04=0,uv05=0,uv06=0,uv07=0,rv01=0,rv02=0,rv03=0,rv04=0,rv05=0,rv06=0,ch01=0,ch02=0,ch03=0,ch04=0,ch05=0,ch06=0,vd01=0,vd02=0,vd03=0,vd04=0,vd05=0;
                if(row.chcafe){
                    for(let chcafe in row.chcafe){
                        var rowch = row.chcafe[chcafe];
                        //--Pergamino--//
                        if(rowch=='dtwcafe_pg01'){pg01=1;} if(rowch=='dtwcafe_pg02'){pg02=1;} if(rowch=='dtwcafe_pg03'){pg03=1;} if(rowch=='dtwcafe_pg04'){pg04=1;} if(rowch=='dtwcafe_pg05'){pg05=1;} if(rowch=='dtwcafe_pg06'){pg06=1;} if(rowch=='dtwcafe_pg07'){pg07=1;}
                        //--Revuelto--//
                        if(rowch=='dtwcafe_rv01'){rv01=1;} if(rowch=='dtwcafe_rv02'){rv02=1;} if(rowch=='dtwcafe_rv03'){rv03=1;} if(rowch=='dtwcafe_rv04'){rv04=1;} if(rowch=='dtwcafe_rv05'){rv05=1;} if(rowch=='dtwcafe_rv06'){rv06=1;} if(rowch=='dtwcafe_rv07'){rv07=1;}
                        //--Uva--//
                        if(rowch=='dtwcafe_uv01'){uv01=1;} if(rowch=='dtwcafe_uv02'){uv02=1;} if(rowch=='dtwcafe_uv03'){uv03=1;} if(rowch=='dtwcafe_uv04'){uv04=1;} if(rowch=='dtwcafe_uv05'){uv05=1;} if(rowch=='dtwcafe_uv06'){uv06=1;}
                        //--Chancha--//
                        if(rowch=='dtwcafe_ch01'){ch01=1;} if(rowch=='dtwcafe_ch02'){ch02=1;} if(rowch=='dtwcafe_ch03'){ch03=1;} if(rowch=='dtwcafe_ch04'){ch04=1;} if(rowch=='dtwcafe_ch05'){ch05=1;} if(rowch=='dtwcafe_ch06'){ch06=1;} 
                        //--Verde--//
                        if(rowch=='dtwcafe_vd01'){vd01=1;} if(rowch=='dtwcafe_vd02'){vd02=1;} if(rowch=='dtwcafe_vd03'){vd03=1;} if(rowch=='dtwcafe_vd04'){vd04=1;} if(rowch=='dtwcafe_vd05'){vd05=1;}
                    }
                }
                //-- Crear objeto de detalle de peso
                const {dtwcafe_peso, dtwcafe_molida,dtwcafe_tipo,dtwcafe_sacos,dtwcafe_sts,dtwcafe_precio,dtwcafe_phum,dtwcafe_tipopeso,dtwcafe_stsc,wcafe_id}= row;
                const query = `
                    INSERT INTO cstb_detcoffeeweight (dtwcafe_peso,dtwcafe_molida,dtwcafe_tipo,dtwcafe_sacos,dtwcafe_sts,dtwcafe_precio,dtwcafe_phum,dtwcafe_pg01,dtwcafe_pg02,dtwcafe_pg03,dtwcafe_pg04,dtwcafe_pg05,dtwcafe_pg06,dtwcafe_pg07,dtwcafe_uv01,dtwcafe_uv02,dtwcafe_uv03,dtwcafe_uv04,dtwcafe_uv05,dtwcafe_uv06,dtwcafe_uv07,dtwcafe_rv01,dtwcafe_rv02,dtwcafe_rv03,dtwcafe_rv04,dtwcafe_rv05,dtwcafe_rv06,dtwcafe_ch01,dtwcafe_ch02,dtwcafe_ch03,dtwcafe_ch04,dtwcafe_ch05,dtwcafe_ch06,dtwcafe_vd01,dtwcafe_vd02,dtwcafe_vd03,dtwcafe_vd04,dtwcafe_vd05,dtwcafe_tipopeso,dtwcafe_stsc,wcafe_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
                `;
                mysqlConnection.query(query,[dtwcafe_peso,dtwcafe_molida,dtwcafe_tipo,dtwcafe_sacos,dtwcafe_sts,dtwcafe_precio,dtwcafe_phum,pg01,pg02,pg03,pg04,pg05,pg06,pg07,uv01,uv02,uv03,uv04,uv05,uv06,uv07,rv01,rv02,rv03,rv04,rv05,rv06,ch01,ch02,ch03,ch04,ch05,ch06,vd01,vd02,vd03,vd04,vd05,dtwcafe_tipopeso,dtwcafe_stsc,wcafe_id], (err, rows, fields)=>{
                    if(err){
                        stsquery = 0;
                        console.log(err) 
                    } 
                });
            }
        }
        if(stsedit == 1){
            //--Se agregaron mas lineas al detalle de peso--//
            if(stsquery == 0){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al registrar detalle de peso!",
                }) 
            }else{
                return res.status(200).send({
                    status: "success",
                    message: "Detalle de peso actualizado correctamente!"
                }); 
            }
        }else{
            //--Unicamente se modificó la cabecera--//
            return res.status(200).send({
                status: "success",
                message: "Detalle de peso actualizado correctamente!"
            });
        }
    },
    delete: (req, res) => {
        var idtpeso = req.params.id;
		mysqlConnection.query("DELETE FROM cstb_detcoffeeweight WHERE dtwcafe_id = " + idtpeso + ";", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al eliminar detalle de peso de cafe!",
                    error: err
                })  
            }
            return res.status(200).send({
                status: "success",
                message: "Detalle de peso eliminado correctamente!"
            });        
        });
    },
    show: (req, res) => {
		mysqlConnection.query("SELECT dtwcafe_id, dtwcafe_peso FROM cstb_detcoffeeweight ORDER BY dtwcafe_peso;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar detalle de pesoes!"
                })  
            }
            return res.status(200).send({
                status: "success",
                dtpeso: rows
            });        
        })
    },
    showg: (req, res) => {
		mysqlConnection.query("SELECT * FROM cstb_detcoffeeweight ORDER BY dtwcafe_peso;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar detalle de pesoes!"
                })  
            }
            return res.status(200).send({
                status: "success",
                dtpeso: rows
            });        
        })
    }
}

module.exports = controller;