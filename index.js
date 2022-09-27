'use strict'

const express = require('express');
const bodyParser = require('body-parser')

//-- Inicialización
const app = express();

//-- Settings
app.set('port', process.env.PORT || 4000);

//-- Middlewares
// Configurar cabeceras y cors
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
	next();
});
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json());

//--Routes
//app.use(require('./routes/approutes'));
var app_routes = require('./routes/approutes')

//--Reescribir rutas
app.use('/api', app_routes)

//--Starting the Server
app.listen(app.get('port'), ()=>{
    console.log('Server on Port: ', app.get('port'));
});