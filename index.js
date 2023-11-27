const express = require('express')
const morgan = require('morgan')
const path = require('path');
const bodyParser = require('body-parser');

const { port } = require('./database/indexvar')
const { connection } = require('./database/db');


const app = express()
connection();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan('dev'));

// Motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



// Rutas
const Vehiculo = require('./Routes/VehiculosRoutes');
const Envio = require('./Routes/EnvioRoutes')
const mensajeros = require('./Routes/MensajeroRoutes');


Vehiculo(app);
Envio(app)
mensajeros(app);


// Ruta principal que renderiza una vista EJS
app.get('/', (req, res) => {
  res.render('index', { title: 'Mi Aplicación MEAN Stack' });
});


app.listen(port, () => {
  console.log(`El servidor esta corriendo correctamente en http://localhost:${port}`);
})

