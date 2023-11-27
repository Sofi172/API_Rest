const express = require('express');
const MensajeroModels = require('../Models/mensajero')
const VehiculoModels = require('../Models/vehiculo')
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

function Mensajero(app) {
    const router = express.Router()

    app.use('/mensajeros', router);

    // Obtener todos los mensajeros 
    router.get('/', async (req, res) => {
        try {
            const mensajeros = await MensajeroModels.find().populate('vehiculo');
            res.render('mensajeros/index', { mensajeros });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

     //Pdf
     router.get('/pdfM', async (req, res) => {
        const mensajeros= await MensajeroModels.find().populate('vehiculo');
        const doc = new PDFDocument ();
        const fecha = new Date().toLocaleDateString();
    let contador = 1;
    let mensajeroPorPagina = 7; // Número de vehículos por página
    let mensajerosImprimidos = 0;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="reporte_vehiculos-pdf"');

    doc.pipe(res);

    doc.fontSize(15).text(`Fecha: ${fecha}`, { align: 'left' });
    doc.moveDown();

    doc.fontSize(16).text ('Reporte de los mensajeros', { align: 'center'});
    doc.moveDown();
    doc.text('Datos de los mensajeros');

    mensajeros.forEach((mensajero, index) => {
        if (index !== 0 && index % mensajeroPorPagina === 0) {
            doc.text('Página ' + contador);
            contador++;
            doc.addPage(); // Agregar una nueva página
            doc.fontSize(15).text(`Fecha: ${fecha}`, { align: 'left' });
            doc.moveDown();
            doc.fontSize(16).text('Reporte de los mensajeros', { align: 'center' });
            doc.moveDown();
        }

        doc.text('Nombre: '+mensajero.nombre);
        doc.text('Datos del vehiculo que maneja:')
            doc.text('Vehiculo: '+mensajero.vehiculo.modelo + '  ' + 'Tipo: '+mensajero.vehiculo.tipo + '  '+ 'Placa: '+mensajero.vehiculo.placa);
            doc.moveDown();
         mensajerosImprimidos++;
    });

    // Si los vehículos no llenaron completamente la última página
    if (mensajerosImprimidos % mensajeroPorPagina !== 0) {
        doc.text('Página ' + contador);
    }
    doc.end();
        /* 

        res.setHeader ('Content-Type','application/pdf');   
        res.setHeader ('Content-Disposition', 'inline; filename="reporte-mensajero-pdf"');
    
        doc.pipe(res);
    
        doc.fontSize(15).text(`Fecha: ${fecha}`, { align: 'left' });
        doc.moveDown();

        doc.fontSize(16).text ('Reporte de los mensajeros', { align: 'center'});
        doc.moveDown();
    
        mensajeros.forEach(mensajero=>{
            doc.text('Nombre: '+mensajero.nombre);
            doc.text('Vehiculo: '+mensajero.vehiculo.modelo);
            doc.text('Tipo: '+mensajero.vehiculo.tipo);
            doc.text('Placa: '+mensajero.vehiculo.placa);
            doc.moveDown();
        })
        doc.end(); */
    });  

    //Exel
    router.get('/excelM', async (req, res) => {
        try {
            const MensajeroE = await MensajeroModels.find().populate('vehiculo');

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet 1');
    
            // Create headers and format them
            const headers = ["Nombre", "Modelo","Tipo","Placa"];
            worksheet.addRow(headers);
            const headerRow = worksheet.getRow(1);
            headerRow.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFA500' }
                };
                cell.font = {
                    color: { argb: 'ffffff' },
                    bold: true
                };
            });
    
            MensajeroE.forEach(mensajero => {
                const rowData = [mensajero.nombre, mensajero.vehiculo.tipo,mensajero.vehiculo.modelo,mensajero.vehiculo.placa];
                worksheet.addRow(rowData);
            });
    
            // Guardar el archivo de Excel en el servidor
            const filePath = 'Reporte_mensajeros.xlsx';
            await workbook.xlsx.writeFile(filePath);
    
            // Enviar el archivo como respuesta al cliente
            res.download(filePath, 'Reporte_mensajeros.xlsx', (err) => {
                // Eliminar el archivo después de enviarlo al cliente
                if (err) {
                    console.error('Error al enviar el archivo:', err);
                }
                fs.unlinkSync(filePath);
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Crear un nuevo mensajero 
    router.get('/create', async (req, res) => {
        try {
            const vehiculos = await VehiculoModels.find();
            res.render('mensajeros/create', { vehiculos });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/', async (req, res) => {
        try {
            // Obtener datos del formulario
            const { nombre, // otros campos del formulario
                vehiculo } = req.body;

            // Crear el nuevo mensajero
            const nuevoMensajero = new MensajeroModels({
                nombre,
                // otros campos del formulario
                vehiculo: vehiculo, // Asignar el vehículo seleccionado
            });

            // Guardar el nuevo mensajero en la base de datos
            await nuevoMensajero.save();

            res.redirect('/mensajeros'); // Redirigir a la lista de mensajeros
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Obtener un mensajero por ID 
    router.get('/edit/:id', async (req, res) => {
        try {
            const mensajero = await MensajeroModels.findById(req.params.id).populate('vehiculo');
            const vehiculos = await VehiculoModels.find();
    
            res.render('mensajeros/edit', { mensajero, vehiculos });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Actualizar un mensajero existente
    router.post('/update/:id', async (req, res) => {
        try {
            const mensajeroActualizado = await MensajeroModels.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.redirect('/mensajeros');  // Redirige a la lista de mensajeros después de la actualización
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // Eliminar un mensajero y redirigir a la lista
    router.get('/delete/:id', async (req, res) => {
        try {
            await MensajeroModels.findByIdAndDelete(req.params.id);
            res.redirect('/mensajeros');  // Redirige a la lista de mensajeros después de la eliminación
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}
module.exports = Mensajero;