'use strict'
//import {pool} from '../db.js'
const validator = require('validator')
const mysqlConnection = require('../database');
const pool = require('../db');

const controller = {
    save: (req, res) => {
		//-- Recoger los parámetros de la petición
		var params = req.body

		//-- Validar los datos
		try{
            var validate_nombre = !validator.isEmpty(params.emp_nombre);
            //var validate_fechanac = !validator.isEmpty(params.emp_fecha_nac);
            //var validate_identidad = !validator.isEmpty(params.emp_identidad);
            //var validate_telefono = !validator.isEmpty(params.emp_telefono);
            //var validate_fechai = !validator.isEmpty(params.emp_fecha_ingreso);
            var validate_sts = !validator.isEmpty(params.emp_sts);
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo...!"
			}) 
        }
		if(validate_nombre && validate_sts){
			//-- Crear objeto de empleado
            const {emp_nombre, emp_fecha_nac, emp_identidad, emp_telefono, emp_fecha_ingreso, emp_sts, emp_salario, emp_edad} = params;
            const query = `
                INSERT INTO cstb_employees (emp_nombre, emp_fecha_nac, emp_identidad, emp_telefono, emp_fecha_ingreso, emp_sts, emp_salario, emp_edad) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            `
            mysqlConnection.query(query, [emp_nombre, emp_fecha_nac, emp_identidad, emp_telefono, emp_fecha_ingreso, emp_sts, emp_salario, emp_edad ], (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar empleados!",
                        error: err
                    })  
                }
                return res.status(200).send({
                    status: "success",
                    employee: rows.insertId
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
		//--Recoger datos del empleado
		var params = req.body;
        
        //-- Validar los datos
        try{
            var validate_nombre = !validator.isEmpty(params.emp_nombre);
            var validate_fechanac = !validator.isEmpty(params.emp_fecha_nac);
            var validate_identidad = !validator.isEmpty(params.emp_identidad);
            var validate_telefono = !validator.isEmpty(params.emp_telefono);
            var validate_fechai = !validator.isEmpty(params.emp_fecha_ingreso);
            var validate_sts = !validator.isEmpty(params.emp_sts);
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
        if(validate_nombre && validate_fechanac && validate_identidad && validate_telefono && validate_sts && validate_fechai){
            //--Comprobar si nuevo empleado existe en base de datos--//
            mysqlConnection.query("SELECT * FROM cstb_employees WHERE emp_id = "+params.emp_id+";", (err, employee, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al buscar empleado específico!"
                    })  
                }
                if (employee.length > 0) {
                    //-- Si existe --//
                    //-- Crear objeto de empleado
                    const {emp_nombre, emp_fecha_nac, emp_identidad, emp_telefono, emp_fecha_ingreso, emp_sts, emp_salario, emp_edad, emp_id} = params;
                    const query = `
                        UPDATE cstb_employees SET emp_nombre=?, emp_fecha_nac=?, emp_identidad=?, emp_telefono=?, emp_fecha_ingreso=?, emp_sts=?, emp_salario=?, emp_edad=? WHERE emp_id=?;
                    `;
                    //--Actualizar información del empleado--//
                    mysqlConnection.query(query, [emp_nombre, emp_fecha_nac, emp_identidad, emp_telefono, emp_fecha_ingreso, emp_sts, emp_salario, emp_edad, emp_id], (err, rows, fields)=>{
                        if(err){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al actualizar empleado!",
                                error: err
                            })  
                        }
                        return res.status(200).send({
                            status: "success",
                            employee: rows
                        });        
                    }); 
                }else{
                    return res.status(500).send({
                        status: "Empty",
                        message: "El empleado "+params.emp_id+" no está registrado!"
                    });  
                }
            });
        }else{
            return res.status(500).send({
                //--Validación de datos enviados incorrecta--//
				status: "Error",
				message: "Datos vacíos, intente de nuevo!"
			}) 
		}
    },
    show: (req, res) => {
		mysqlConnection.query("SELECT emp_id, emp_nombre FROM cstb_employees WHERE emp_sts = 'Habilitado' ORDER BY emp_nombre;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar empleados!"
                })  
            }
            return res.status(200).send({
                status: "success",
                employees: rows
            });        
        })
    },
    showg: async (req, res) => {
        const [result] = await pool.query('SELECT * FROM cstb_employees ORDER BY emp_nombre;');
        var status;
        if(result.length > 0){
            status = "success"
        }else{
            status = "empty"
        }
        res.json({employees: result[0], status: status})
    },
    showpre: (req, res) => {
		mysqlConnection.query("SELECT distinct e.emp_id, e.emp_nombre, e.emp_saldo FROM cstb_employees As e INNER JOIN cstb_prestamos As c On e.emp_id=c.client_id WHERE c.pres_tipo='Empleado' and c.pres_sts = 'Activo' ORDER BY e.emp_nombre;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al buscar Empleado!"
                })  
            }
            if(rows.length > 0){
                return res.status(200).send({
                    status: "success",
                    prestamos: rows
                }); 
            }else{
                return res.status(200).send({
                    status: "empty",
                    message: "Empleado sin deuda actualmente!"
                }); 
            }
                   
        })
    }
}

module.exports = controller;