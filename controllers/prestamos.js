'use strict'

const validator = require('validator')
const mysqlConnection = require('../database');

const controller = {
    save: (req, res) => {
		//-- Recoger los parámetros de la petición 
		var params = req.body;
        var nwsaldo = params.pres_monto + params.client_saldo;
		//-- Validar los datos
		try{
            var validate_fechapres = !validator.isEmpty(params.pres_fecha_pres);           
            var validate_motivo = !validator.isEmpty(params.pres_motivo);
            var validate_descripcion = !validator.isEmpty(params.pres_descripcion);
            var validate_prestipo = !validator.isEmpty(params.pres_tipo);
            var validate_sts = !validator.isEmpty(params.pres_sts);            
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}); 
        }
		if(validate_fechapres && validate_motivo && validate_descripcion && validate_prestipo && validate_sts){
			//-- Crear objeto de prestamos
            const {pres_fecha_pres, pres_monto, pres_motivo, pres_descripcion, pres_tipo, pres_sts, client_id, usr_id} = params;
            const query = `
                INSERT INTO cstb_prestamos (pres_fecha_pres, pres_monto, pres_motivo, pres_descripcion, pres_tipo, pres_sts, client_id, usr_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            `
            mysqlConnection.query(query, [pres_fecha_pres, pres_monto, pres_motivo, pres_descripcion, pres_tipo, pres_sts, client_id, usr_id], (err, rows, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al registrar prestamo!",
                        error: err
                    })  
                }
                var codPre = rows.insertId;
                var ntb = params.pres_tipo == "Productor" ? "cstb_producers" : "cstb_employees";
                var ctb = params.pres_tipo == "Productor" ? "prod_saldo" : "emp_saldo";
                var dscli = params.pres_tipo == "Productor" ? "prod_id" : "emp_id";
                var sql = "UPDATE "+ntb+" SET "+ctb+"="+nwsaldo+" WHERE "+dscli+ "="+params.client_id;
                //--Actualizar saldo de cliente--//
                mysqlConnection.query(sql, (err, rowsp, fields)=>{
                    if(err){
                        return res.status(500).send({
                            status: "Error",
                            message: "Error al actualizar saldo de cliente!",
                            error: err
                        });  
                    }
                    //--Mantenimiento tabla master_pres --//
                    mysqlConnection.query("SELECT mpre_pagado FROM cstb_master_pres WHERE client_tipo='" +params.pres_tipo+ "' And client_id="+params.client_id+";", (err, rowpg, fields)=>{
                        if(err){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al buscar cliente en tabla master!",
                                error: err
                            })  
                        }
                        if(rowpg.length > 0){
                            //--Existe cliente registrado en tabla master--//
                            var vpag =  rowpg[0].mpre_pagado;
                            mysqlConnection.query("UPDATE cstb_master_pres SET mpre_total = "+nwsaldo+" WHERE client_tipo='" +params.pres_tipo+ "' And client_id="+params.client_id+";", (err, rowm, fields)=>{
                                if(err){
                                    return res.status(500).send({
                                        status: "Error",
                                        message: "Error al actualizar valor total de cliente en tabla master!",
                                        error: err
                                    })  
                                }
                                return res.status(200).send({
                                    status: "success",
                                    message: "Saldo de cliente actualizado correctamente!"
                                });
                            });
                        }else{
                            //--No existe cliente registrado en tabla master se procede a registrarlo--//
                            const querym = `
                                INSERT INTO cstb_master_pres (mpre_total, mpre_pagado, client_tipo, client_id) VALUES (?,0,?,?)
                                `
                            mysqlConnection.query(querym, [nwsaldo,params.pres_tipo,params.client_id], (err, rowm, fields)=>{
                                if(err){
                                    return res.status(500).send({
                                        status: "Error",
                                        message: "Error al registrar cliente en tabla master!",
                                        error: err
                                    })  
                                }
                                return res.status(200).send({
                                    status: "success",
                                    message: "Saldo de cliente actualizado correctamente!"
                                });
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
		//--Recoger datos del prestamos
		var params = req.body;

        //-- Validar los datos
        try{
            var validate_fechapres = !validator.isEmpty(params.pres_fecha_pres);           
            var validate_motivo = !validator.isEmpty(params.pres_motivo);
            var validate_descripcion = !validator.isEmpty(params.pres_descripcion);
            var validate_prestipo = !validator.isEmpty(params.pres_tipo);
            var validate_sts = !validator.isEmpty(params.pres_sts);            
        }catch(err){
            return res.status(500).send({
				status: "Error",
				message: "Faltan parámetros, intente de nuevo!"
			}) 
        }
        if(validate_fechapres && validate_motivo && validate_descripcion && validate_prestipo && validate_sts){
            //--Comprobar si nuevo prestamos existe en base de datos--//
            mysqlConnection.query("SELECT * FROM cstb_prestamos WHERE pres_id = "+params.pres_id+";", (err, prestamo, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al buscar prestamo específico!"
                    })  
                }
                if (prestamo.length > 0) {
                    //-- Crear objeto de prestamos
                    const {pres_fecha_pres, pres_monto, pres_motivo, pres_descripcion, pres_tipo, pres_sts, client_id, pres_id} = params;
                    const query = `
                        UPDATE cstb_prestamos SET pres_fecha_pres=?, pres_monto=?, pres_motivo=?, pres_descripcion=?, pres_tipo=?, pres_sts=?, client_id=? WHERE pres_id=?;
                    `;
                    //--Actualizar información del prestamos--//
                    mysqlConnection.query(query, [pres_fecha_pres, pres_monto, pres_motivo, pres_descripcion, pres_tipo, pres_sts, client_id, pres_id], (err, rows, fields)=>{
                        if(err){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al actualizar prestamos!",
                                error: err
                            })  
                        }
                        //--Verificar si se cambio el monto del prestamo--//
                        if(params.pres_monto_org != params.pres_monto){
                            //--Recalcular saldo de productor/empleado--//
                            var saldofpres=0, difpres =0;
                            if(params.pres_monto_org != params.pres_monto){
                                if(params.pres_monto_org > params.pres_monto){
                                    //--Prestamo original mayor que el actual--//
                                    difpres = params.pres_monto_org - params.pres_monto; //--sacar diferencia
                                    saldofpres = params.client_saldo - difpres;
                                }else{
                                    //--Prestamo original menor que el actual--//
                                    difpres = params.pres_monto - params.pres_monto_org; //--sacar diferencia
                                    saldofpres = params.client_saldo + difpres;
                                }
                            }else{
                                //--Monto no cambia--//
                                saldofpres = params.pres_monto;
                            }
                            //--Actualizar saldo de productor/empleado}
                            var ntb = params.pres_tipo == "Productor" ? "cstb_producers" : "cstb_employees";
                            var ctb = params.pres_tipo == "Productor" ? "prod_saldo" : "emp_saldo";
                            var dscli = params.pres_tipo == "Productor" ? "prod_id" : "emp_id";
                            var sql = "UPDATE "+ntb+" SET "+ctb+"="+saldofpres+" WHERE "+dscli+ "="+params.client_id;
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
                                mysqlConnection.query("SELECT mpre_pagado FROM cstb_master_pres WHERE client_tipo='" +params.pres_tipo+ "' And client_id="+params.client_id+";", (err, rowpg, fields)=>{
                                    if(err){
                                        return res.status(500).send({
                                            status: "Error",
                                            message: "Error al buscar cliente en tabla master!",
                                            error: err
                                        })  
                                    }
                                    if(rowpg.length > 0){
                                        //--Existe cliente registrado en tabla master--//
                                        mysqlConnection.query("UPDATE cstb_master_pres SET mpre_total = "+saldofpres+" WHERE client_tipo='" +params.pres_tipo+ "' And client_id="+params.client_id+";", (err, rowm, fields)=>{
                                            if(err){
                                                return res.status(500).send({
                                                    status: "Error",
                                                    message: "Error al actualizar valor total de cliente en tabla master!",
                                                    error: err
                                                })  
                                            }
                                            return res.status(200).send({
                                                status: "success",
                                                message: "Saldo de productor actualizado correctamente!"
                                            });
                                        });
                                    }  
                                });
                            });
                        }else{
                            return res.status(200).send({
                                status: "success",
                                message: "Saldo de productor actualizado correctamente!"
                            });
                        }
                    }); 
                }else{
                    return res.status(500).send({
                        status: "Empty",
                        message: "El prestamo "+params.pres_id+" no está registrado!"
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
    delete: (req, res) =>{
        var params = req.body;
        var nwsaldo = params.client_saldo-params.pres_monto;

        mysqlConnection.query("Delete from cstb_prestamos where pres_id="+params.pres_id+";", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al actualizar prestamos!",
                    error: err
                })  
            }
            var ntb = params.pres_tipo == "Productor" ? "cstb_producers" : "cstb_employees";
            var ctb = params.pres_tipo == "Productor" ? "prod_saldo" : "emp_saldo";
            var dscli = params.pres_tipo == "Productor" ? "prod_id" : "emp_id";
            var sql = "UPDATE "+ntb+" SET "+ctb+"="+nwsaldo+" WHERE "+dscli+ "="+params.client_id;
            //--Actualizar saldo de cliente--//
            mysqlConnection.query(sql, (err, rowsp, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al actualizar saldo de cliente!",
                        error: err
                    });  
                }
                //--Mantenimiento tabla master_pres --//
                mysqlConnection.query("SELECT mpre_pagado FROM cstb_master_pres WHERE client_tipo='" +params.pres_tipo+ "' And client_id="+params.client_id+";", (err, rowpg, fields)=>{
                    if(err){
                        return res.status(500).send({
                            status: "Error",
                            message: "Error al buscar cliente en tabla master!",
                            error: err
                        })  
                    }
                    if(rowpg.length > 0){
                        //--Existe cliente registrado en tabla master--//
                        var vpag =  rowpg[0].mpre_pagado;
                        mysqlConnection.query("UPDATE cstb_master_pres SET mpre_total = "+nwsaldo+" WHERE client_tipo='" +params.pres_tipo+ "' And client_id="+params.client_id+";", (err, rowm, fields)=>{
                            if(err){
                                return res.status(500).send({
                                    status: "Error",
                                    message: "Error al actualizar valor total de cliente en tabla master!",
                                    error: err
                                })  
                            }
                            return res.status(200).send({
                                status: "success",
                                message: "Saldo de cliente actualizado correctamente!"
                            });
                        });
                    }else{
                        //--No existe cliente registrado en tabla master se procede a registrarlo--//
                        const querym = `
                            INSERT INTO cstb_master_pres (mpre_total, mpre_pagado, client_tipo, client_id) VALUES (?,0,?,?)
                            `
                        mysqlConnection.query(querym, [nwsaldo,params.pres_tipo,params.client_id], (err, rowm, fields)=>{
                            if(err){
                                return res.status(500).send({
                                    status: "Error",
                                    message: "Error al registrar cliente en tabla master!",
                                    error: err
                                })  
                            }
                            return res.status(200).send({
                                status: "success",
                                message: "Saldo de cliente actualizado correctamente!"
                            });
                        });
                    }  
                });  
            }); 
        })
    },
    show: (req, res) => {
		mysqlConnection.query("SELECT pres_id, pres_fecha_pres FROM cstb_prestamos ORDER BY pres_fecha_pres;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar prestamoses!"
                })  
            }
            return res.status(200).send({
                status: "success",
                producers: rows
            });        
        })
    },
    showp: (req, res) => {
		mysqlConnection.query("SELECT p.*, CASE WHEN p.pres_tipo = 'Productor' THEN r.prod_nombre ELSE e.emp_nombre END As cliente, CASE WHEN p.pres_tipo = 'Productor' THEN r.prod_saldo ELSE e.emp_saldo END As saldo, r.prod_libro libro FROM cstb_prestamos As p LEFT JOIN cstb_producers As r On (p.client_id = r.prod_id) LEFT JOIN cstb_employees As e On (p.client_id = e.emp_id) WHERE p.pres_sts = 'Activo' ORDER BY p.pres_fecha_pres;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar prestamos!"
                })  
            }
            return res.status(200).send({
                status: "success",
                prestamos: rows
            });        
        })
    },
    showpp: (req, res) => {
        var idcli = req.params.id;
        var tpres = req.params.tp;

		mysqlConnection.query("SELECT * FROM cstb_prestamos WHERE client_id ="+idcli+" And pres_tipo='"+tpres+"' And pres_sts = 'Activo' ORDER BY pres_fecha_pres;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar prestamos!"
                })  
            }
            return res.status(200).send({
                status: "success",
                prestamos: rows
            });        
        })
    }, 
    showpt: (req, res) => {
        var idcli = req.params.id;
        var tpres = req.params.tp;

		mysqlConnection.query("SELECT SUM(pres_monto) total FROM cstb_prestamos WHERE client_id ="+idcli+" And pres_tipo='"+tpres+"' And pres_sts = 'Activo' ORDER BY pres_fecha_pres;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar prestamos!"
                })  
            }
            return res.status(200).send({
                status: "success",
                prestamos: rows
            });        
        })
    },
    showg: (req, res) => {
		mysqlConnection.query("SELECT * FROM cstb_prestamos ORDER BY pres_fecha_pres desc limit 10000;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar prestamos!"
                })  
            }
            return res.status(200).send({
                status: "success",
                prestamos: rows
            });        
        })
    },
    showpre: (req, res) => {
        var idcli = req.params.id;
        var tpres = req.params.tp;
        var sql=""
        if(tpres == "Empleado"){
            sql = "SELECT p.*, e.emp_nombre cliente FROM cstb_prestamos p INNER JOIN cstb_employees e on p.client_id=e.emp_id WHERE p.client_id ="+idcli+" And p.pres_tipo='Empleado' And p.pres_sts = 'Activo' ORDER BY p.pres_fecha_pres;"
        }else if(tpres == "Productor"){
            sql = "SELECT p.*, e.prod_nombre cliente FROM cstb_prestamos p INNER JOIN cstb_producers e on p.client_id=e.prod_id WHERE p.client_id ="+idcli+" And p.pres_tipo='Productor' And p.pres_sts = 'Activo' ORDER BY p.pres_fecha_pres;"
        }else{
            sql = "SELECT p.*, case when p.pres_tipo='Empleado' then e.emp_nombre when p.pres_tipo='Productor' then r.prod_nombre end cliente FROM cstb_prestamos p left join cstb_employees e on (p.client_id=e.emp_id) left join cstb_producers r on (p.client_id=r.prod_id) WHERE p.pres_sts = 'Activo' ORDER BY p.pres_fecha_pres;"
        }
		mysqlConnection.query(sql, (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al listar prestamos!"
                })  
            }
            return res.status(200).send({
                status: "success",
                prestamos: rows
            });        
        });
    },
    //--recalcular saldos de clientes
    recalculaSaldos: (req, res) => {
        //--Sumatoria de prestamos
        mysqlConnection.query("Select client_id id, sum(pres_monto) total FROM cstb_prestamos group by client_id order by client_id;", (err, rows, fields)=>{
            if(err){
                return res.status(500).send({
                    status: "Error",
                    message: "Error al sumar prestamos!"
                })  
            }
            for(let pre in rows){
                var rowp = rows[pre];
                //console.log('Codigo: ' + rowp.id + ' - total: ' + rowp.total)
                mysqlConnection.query("UPDATE cstb_master_pres Set mpre_total= "+rowp.total+" where client_id= "+rowp.id+";", (err, rowsrs, fields)=>{
                    if(err){
                        return res.status(500).send({
                            status: "Error",
                            message: "Error al actualizar total prestamo del cliente!"
                        })  
                    } 
                });
            }      
            //--Sumatoria de abonos
            mysqlConnection.query("Select client_id id, sum(pag_monto) total FROM cstb_pagos group by client_id order by client_id;", (err, rowsp, fields)=>{
                if(err){
                    return res.status(500).send({
                        status: "Error",
                        message: "Error al sumar pagos!"
                    })  
                }
                for(let pag in rowsp){
                    var rowp = rowsp[pag];
                    mysqlConnection.query("UPDATE cstb_master_pres Set mpre_pagado= "+rowp.total+" where client_id= "+rowp.id+";", (err, rowsrsp, fields)=>{
                        if(err){
                            return res.status(500).send({
                                status: "Error",
                                message: "Error al actualizar total pagos del cliente!"
                            })  
                        }
                    });
                }  
                //--Actualizar saldo de cliente
                mysqlConnection.query("Select client_id id, (mpre_total - mpre_pagado) saldo from cstb_master_pres order by client_id;", (err, rowsl, fields)=>{
                    if(err){
                        return res.status(500).send({
                            status: "Error",
                            message: "Error al calcular saldo de cliente!"
                        })  
                    }
                    for(let saldo in rowsl){
                        var rowsld = rowsl[saldo];
                        mysqlConnection.query("UPDATE cstb_producers Set prod_saldo= "+rowsld.saldo+" where prod_id= "+rowsld.id+";", (err, rowsrsp, fields)=>{
                            if(err){
                                return res.status(500).send({
                                    status: "Error",
                                    message: "Error al actualizar saldo del cliente!"
                                })  
                            }  
                        });
                    } 
                    return res.status(200).send({
                        status: "success"
                    });
                });
            });
        });
    }
}

module.exports = controller;