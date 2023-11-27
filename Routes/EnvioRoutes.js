const express = require('express');
const EnvioModels = require('../Models/envio');
const MensajeroModels = require('../Models/mensajero');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');


function Envio(app) {
    const router = express.Router()


    app.use('/envios', router);

    router.get('/', async (req, res) => {
        try {
            const envios = await EnvioModels.find().populate('mensajero');
            res.render('envios/index', { envios });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

     //Pdf
     router.get('/pdfE', async (req, res) => {
        const envios= await EnvioModels.find().populate('mensajero');
        const doc = new PDFDocument ();
        const fecha = new Date().toLocaleDateString();
    let contador = 1;
    let envioPorPagina = 7; // Número de vehículos por página
    let enviosImprimidos = 0;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="reporte_vehiculos-pdf"');

    doc.pipe(res);

    doc.fontSize(15).text(`Fecha: ${fecha}`, { align: 'left' });
    doc.moveDown();

    doc.fontSize(16).text ('Reporte de los envios', { align: 'center'});
    doc.moveDown();

    envios.forEach((envio, index) => {
        if (index !== 0 && index % envioPorPagina === 0) {
            doc.text('Página ' + contador);
            contador++;
            doc.addPage(); // Agregar una nueva página
            doc.fontSize(15).text(`Fecha: ${fecha}`, { align: 'left' });
            doc.moveDown();
            doc.fontSize(16).text('Reporte de los envios', { align: 'center' });
            doc.moveDown();
        }

        doc.text('Mensajero: '+envio.mensajero.nombre);
            doc.text('Actividad: '+envio.actividad);
            doc.text('Destinatario: '+envio.destinatario);
            doc.moveDown();
            enviosImprimidos++;
    });

    // Si los vehículos no llenaron completamente la última página
    if (enviosImprimidos % envioPorPagina !== 0) {
        doc.text('Página ' + contador);
    }
       /*  res.setHeader ('Content-Type','application/pdf');   
        res.setHeader ('Content-Disposition', 'inline; filename="reporte-envio-pdf"');
    
        doc.pipe(res);
    
        doc.fontSize(15).text(`Fecha: ${fecha}`, { align: 'left' });
        doc.moveDown();

        doc.fontSize(16).text ('Reporte de los envios', { align: 'center'});
        doc.moveDown();
    
        envios.forEach(envio=>{
            doc.text('Mensajero: '+envio.mensajero.nombre);
            doc.text('Actividad: '+envio.actividad);
            doc.text('Destinatario: '+envio.destinatario);
            doc.moveDown();
        }) */
        doc.end();
    });  

    //Exel
    router.get('/excelE', async (req, res) => {
        try {
            const EnvioE = await EnvioModels.find().populate('mensajero');

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet 1');
    
            // Create headers and format them
            const headers = ["Mensajero", "Actividad","Destinatario"];
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
    
            EnvioE.forEach(envio => {
                const rowData = [envio.mensajero.nombre, envio.actividad,envio.destinatario];
                worksheet.addRow(rowData);
            });
    
            // Guardar el archivo de Excel en el servidor
            const filePath = 'Reporte_envios.xlsx';
            await workbook.xlsx.writeFile(filePath);
    
            // Enviar el archivo como respuesta al cliente
            res.download(filePath, 'Reporte_envios.xlsx', (err) => {
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


    // Ruta para mostrar el formulario de creación de envío
    router.get('/create', async (req, res) => {
        try {
            const mensajeros = await MensajeroModels.find();
            res.render('envios/create', { mensajeros });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });


    // Ruta para manejar la creación de envíos
    router.post('/create', async (req, res) => {
        try {
            const { actividad, destinatario, mensajeroId } = req.body;

            // Validación y creación del envío...
            const nuevoEnvio = await EnvioModels.create({
                actividad,
                destinatario,
                mensajero: mensajeroId,
            });

            // Después de guardar, redirigir a la página de índice de envíos
            res.redirect('/envios');
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });



    // Ruta para mostrar el formulario de edición
    router.get('/edit/:id', async (req, res) => {
        try {
            const envio = await EnvioModels.findById(req.params.id).populate('mensajero');
            const mensajeros = await MensajeroModels.find();
            res.render('envios/update', { envio, mensajeros });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });


    // Actualizar un envío y redirigir a la lista
    router.post('/update/:id', async (req, res) => {
        try {
          const { actividad, destinatario, mensajeroId } = req.body;
      
          const envioActualizado = await EnvioModels.findByIdAndUpdate(
            req.params.id,
            { actividad, destinatario, mensajero: mensajeroId },
            { new: true }
          ).populate('mensajero');
      
          res.redirect('/envios'); // Redirige a la lista de envíos después de la actualización
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });

    // Eliminar un envío y redirigir a la lista
    router.get('/delete/:id', async (req, res) => {
        try {
          await EnvioModels.findByIdAndDelete(req.params.id);
          res.redirect('/envios'); // Redirige a la lista de envíos después de la eliminación
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });

}

module.exports = Envio