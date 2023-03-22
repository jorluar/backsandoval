'use strict'

const express = require('express');
const router = express.Router();
var md_auth = require('../middleware/authenticated')

var DashController = require('../controllers/dash')
var UserController = require('../controllers/user')
var EmployeeController = require('../controllers/employee')
var ProducerController = require('../controllers/producer')
var AddressController = require('../controllers/address')
var MunicController = require('../controllers/municipios')
var WeightController = require('../controllers/coffee_weight')
var dtweightController = require('../controllers/dtcoffee_weight')
//var chweightController = require('../controllers/chweight')
var prestamosController = require('../controllers/prestamos')
var pagosController = require('../controllers/pagos')
var shopsController = require('../controllers/shop')
var salesController = require('../controllers/sales')
var vehicleController = require('../controllers/vehicle')
var mantvhController = require('../controllers/tpmaintenance')
var customerController = require('../controllers/customer')
var incomeController = require('../controllers/incomes')
var expenseController = require('../controllers/expenses')
var tpincController = require('../controllers/tpincexp')
var contratController = require('../controllers/contrat')

//-- Rutas de Dashboard --//
router.post('/dash_graph', DashController.getshop)

//-- Rutas de usuarios --//
router.post('/usr_register', UserController.save)
router.put('/usr_update', UserController.update)
router.post('/usr_login', UserController.login)
router.get('/usr_show', UserController.show)

//-- Rutas de empleados --//
router.post('/emp_register', EmployeeController.save)
router.put('/emp_update', md_auth.authenticated, EmployeeController.update)
router.get('/emp_show', EmployeeController.show)
router.get('/emp_showg', EmployeeController.showg)
router.get('/emp_showpre', EmployeeController.showpre)

//-- Rutas de productores --//
router.post('/prod_register', ProducerController.save)
router.put('/prod_update', md_auth.authenticated, ProducerController.update)
router.get('/prod_show', ProducerController.show)
router.get('/prod_showg', ProducerController.showg)
router.get('/prod_showp/:id', ProducerController.showp)
router.get('/prod_showpre', ProducerController.showpre)

//-- Rutas de direcciones 
router.post('/add_register', AddressController.save)
router.put('/add_update', md_auth.authenticated, AddressController.update)
router.get('/add_show', AddressController.show)
router.get('/add_showg', AddressController.showg)

//--Ruta municipios
router.get('/muni_show', MunicController.show)
router.get('/muni_showm', MunicController.showm)

//-- Rutas de peso de cafe
router.post('/wcafe_register', WeightController.save)
router.put('/wcafe_update', md_auth.authenticated, WeightController.update)
router.get('/wcafe_show', WeightController.show)
router.get('/wcafe_delete/:id', WeightController.delete)
router.get('/wcafe_showg', WeightController.showg)
router.get('/wcafe_showdt/:id', WeightController.showdt)
router.get('/wcafe_showdts/:id', WeightController.showdts)

//-- Rutas de detalle peso de cafe
router.post('/dtwcafe_register', dtweightController.save)
router.put('/dtwcafe_update', md_auth.authenticated, dtweightController.update)
router.get('/dtwcafe_show', dtweightController.show)
router.get('/dtwcafe_showg', dtweightController.showg)
router.get('/dtwcafe_delete/:id', dtweightController.delete)

//-- Rutas de prestamos de efectivo
router.post('/pres_register', prestamosController.save)
router.put('/pres_update', md_auth.authenticated, prestamosController.update)
router.post('/pres_delete', prestamosController.delete)
router.get('/pres_show', prestamosController.show)
router.get('/pres_showp', prestamosController.showp)
router.get('/pres_showpp/:id/:tp', prestamosController.showpp)
router.get('/pres_showpt/:id/:tp', prestamosController.showpt)
router.get('/pres_showpre/:id/:tp', prestamosController.showpre)
router.get('/pres_showg', prestamosController.showg)
router.get('/pres_recsaldos', prestamosController.recalculaSaldos)

//-- Rutas de pagos a prestamos de efectivo
router.post('/pag_register', pagosController.save)
router.put('/pag_update', md_auth.authenticated, pagosController.update)
router.get('/pag_show', pagosController.show)
router.get('/pag_showpre/:id', pagosController.showpag)
router.get('/pag_showg', pagosController.showg)
router.get('/pag_showpag/:id', pagosController.showpag)

//-- Rutas de compras --//
router.post('/shop_register', shopsController.save)
router.post('/shop_registerdp', shopsController.savedp)
router.get('/shop_show', shopsController.show)
router.get('/shop_showg', shopsController.showg)
router.get('/shop_showpen', shopsController.showpen)
router.get('/shop_showdep', shopsController.showdep)
router.get('/shop_showdc/:id', shopsController.showdc)
router.get('/shop_showpr/:id', shopsController.showpr)
router.get('/shop_showdt/:id', shopsController.showdt)
router.get('/shop_showrpcpra/:id', shopsController.showrpcpra)
router.post('/shop_registerpfc', shopsController.savepgfc) //--Registrar pago a compra
router.post('/dshop_register', shopsController.savedt) //--Registrar detalle
router.post('/shop_showrpt', shopsController.showrpt)
router.get('/shop_updprod/:idf/:idp', shopsController.shop_updprod)

//-- Rutas de ventas --//
router.post('/sale_register', salesController.save)
router.post('/sale_registerd', salesController.saved)
router.post('/sale_registerant', salesController.saveAnt)
router.post('/sale_registcta', salesController.saveCta)
router.put('/sale_update', md_auth.authenticated, salesController.update)
router.get('/sale_show', salesController.show)
router.get('/sale_showg', salesController.showg)
router.get('/sale_showpg', salesController.showpg)
router.get('/sale_showcv/:id', salesController.showcv)
router.get('/sale_showgstsc/:id', salesController.showgstsc)
router.get('/sale_showatv/:id', salesController.showatv)
router.get('/sale_showcta/:id/:tpc', salesController.showcta)
//router.get('/sale_showrpt/:fhi/:fhf/:idc', salesController.showrpt)
router.post('/sale_showrpt', salesController.showrpt)
router.post('/sale_savedtct', salesController.savedtct)

//-- Rutas de vehiculos --//
router.post('/veh_register', vehicleController.save)
router.put('/veh_update', md_auth.authenticated, vehicleController.update)
router.get('/veh_show', vehicleController.show)
router.get('/veh_showg', vehicleController.showg)
router.get('/veh_del/:id', vehicleController.delv)

//-- Rutas de mantenimiento de vehiculos --//
router.post('/mant_register', mantvhController.save)
router.put('/mant_update', md_auth.authenticated, mantvhController.update)
router.get('/mant_show', mantvhController.show)
router.get('/mant_showg', mantvhController.showg)

//-- Rutas de mantenimiento de clientes --//
router.post('/cust_register', customerController.save)
router.put('/cust_update', md_auth.authenticated, customerController.update)
router.get('/cust_show', customerController.show)
router.get('/cust_showg', customerController.showg)
router.get('/cust_showc', customerController.showc)
router.get('/cust_showcv', customerController.showcv)

//-- Rutas de mantenimiento de tipos de ingresos/gastos --//
router.post('/tpinex_register', tpincController.save)
router.put('/tpinex_update', md_auth.authenticated, tpincController.update)
router.get('/tpinex_show', tpincController.show)
router.get('/tpinex_showg', tpincController.showg)
router.get('/tpinex_showclexp', tpincController.showclexp)
router.get('/tpinex_showclinc', tpincController.showclinc)
router.get('/tpinex_showinc', tpincController.showinc)
router.get('/tpinex_showexp', tpincController.showexp)

//-- Rutas de mantenimiento de ingresos de dinero --//
router.post('/inc_register', incomeController.save)
router.put('/inc_update', md_auth.authenticated, incomeController.update)
router.get('/inc_show', incomeController.show)
router.get('/inc_showg', incomeController.showg)

//-- Rutas de mantenimiento de gastos de dinero--//
router.post('/exp_register', expenseController.save)
router.put('/exp_update', md_auth.authenticated, expenseController.update)
router.get('/exp_show', expenseController.show)
router.get('/exp_showg', expenseController.showg)

//-- Rutas de contrato de cafe con empresas--//
router.post('/cont_register', contratController.save)
router.put('/cont_update', md_auth.authenticated, contratController.update)
router.get('/cont_show', contratController.show)
router.get('/cont_showg', contratController.showg)
router.get('/cont_showc/:id', contratController.showc)
router.get('/cont_showcep/:id', contratController.showctemp)
router.get('/cont_showpf/:tipo/:id', contratController.showpf)

module.exports = router; 

/*fin*/