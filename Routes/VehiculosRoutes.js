const express = require('express');
const VehiculoModels = require('../Models/vehiculo');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
/* const Sweet = require('sweetalert2')*/
/* const popups = require('popups');
 */
function Vehiculo(app) {
    const router = express.Router()

    app.use('/vehiculos', router);

    //Consultar
    router.get('/', async (req, res) => {
        try {
            const vehiculos = await VehiculoModels.find();
            res.render('vehiculos/index', { vehiculos });
        } catch (error) {
            res.status(500).json({ error: error.message });
        } 
    });

    //Pdf
    router.get('/pdf', async (req, res) => {
        const vehiculos= await VehiculoModels.find();
        const doc = new PDFDocument ();
        const fecha = new Date().toLocaleDateString();
    let contador = 1;
    let vehiculosPorPagina = 9; // Número de vehículos por página
    let vehiculosImprimidos = 0;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="reporte_vehiculos-pdf"');

    doc.pipe(res);

    doc.fontSize(15).text(`Fecha: ${fecha}`, { align: 'left' });
    doc.moveDown();

    doc.fontSize(16).text('Reporte de los vehiculos', { align: 'center' });
    doc.moveDown();
    doc.text('Datos de los vehiculos');

    vehiculos.forEach((vehiculo, index) => {
        if (index !== 0 && index % vehiculosPorPagina === 0) {
            doc.text('Página ' + contador);
            contador++;
            doc.addPage(); // Agregar una nueva página
            doc.fontSize(15).text(`Fecha: ${fecha}`, { align: 'left' });
            doc.moveDown();
            doc.fontSize(16).text('Reporte de los vehiculos', { align: 'center' });
            doc.moveDown();
            doc.text('Datos de los vehiculos');
        }

        doc.text('Marca: ' + vehiculo.marca + '  ' + 'Tipo:' + vehiculo.tipo + '   ' + 'Modelo: ' + vehiculo.modelo);
        doc.text('Identificado con la placa: ' + vehiculo.placa);
        doc.moveDown();
        vehiculosImprimidos++;
    });

    // Si los vehículos no llenaron completamente la última página
    if (vehiculosImprimidos % vehiculosPorPagina !== 0) {
        doc.text('Página ' + contador);
    }

    doc.end();

        /* const totalvehiculos = await VehiculoModels.countDocuments();
        const contaVehiculo = totalvehiculos;
        let contador = 1;

        res.setHeader ('Content-Type','application/pdf');   
        res.setHeader ('Content-Disposition', 'inline; filename="reporte_vehiculos-pdf"','fecha');
    
        doc.pipe(res);
        
        
            doc.fontSize(15).text(`Fecha: ${fecha}`, { align: 'left' });
        doc.moveDown();
    
        doc.fontSize(16).text ('Reporte de los vehiculos', { align: 'center'});
        doc.moveDown();
        doc.text('Datos de los vehiculos');
        vehiculos.forEach(vehiculo=>{
            
            doc.text('Marca: '+ vehiculo.marca + '  ' +'Tipo:'+vehiculo.tipo + '   ' + 'Modelo: '+vehiculo.modelo);
            doc.text('Identificado con la placa: ' + vehiculo.placa);
            doc.moveDown();
        }) 
        if(contaVehiculo===9){
            doc.text('Pagina' + contador);
        } else{
            contador += 1;
            doc.text('Pagina ' + contador)
        }
          vehiculos.forEach(vehiculo=>{
            
            doc.text('Marca: '+ vehiculo.marca + '  ' +'Tipo:'+vehiculo.tipo + '   ' + 'Modelo: '+vehiculo.modelo);
            doc.text('Identificado con la placa: ' + vehiculo.placa);
            doc.moveDown();
        })  
        doc.end();  */
    }); 

    //Exel
    router.get('/excel', async (req, res) => {
        try {
            const vehiculosE = await VehiculoModels.find();

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet 1');
    
            // Create headers and format them
            const headers = ["Tipo", "Modelo","Marca","Placa"];
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
    
            vehiculosE.forEach(vehiculoe => {
                const rowData = [vehiculoe.modelo, vehiculoe.tipo, vehiculoe.marca, vehiculoe.placa];
                worksheet.addRow(rowData);
            });
    
            // Guardar el archivo de Excel en el servidor
            const filePath = 'Reporte_vehiculos.xlsx';
            await workbook.xlsx.writeFile(filePath);
    
            // Enviar el archivo como respuesta al cliente
            res.download(filePath, 'Reporte_vehiculos.xlsx', (err) => {
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

    // Crear un nuevo vehículo y renderizar la vista de creación
    router.get('/create', (req, res) => {
        res.render('vehiculos/create'/* , {erro:null} */);
    });
    router.post('/',async (req, res) => {
        const {tipo, modelo,marca,placa} = req.body;
        if(!tipo || !modelo || !marca || !placa)
        {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });   
           
            }
            /* if (typeof window !== 'undefined') {
                window.alert("Por favor llene todos los campos, no pueden ir vacios")} 
                else {
                    return res.status(400).json({ error: 'Todos los campos son obligatorios' });   
                } */
                try {
                    // Verificar si la placa ya existe en la base de datos
                    const placaExiste = await VehiculoModels.exists({ placa: placa });
                
                    if (placaExiste) {
                      return res.status(400).json({ error: 'La placa ya está registrada' });
                    }
             
            const nuevoVehiculo = await VehiculoModels.create(req.body);
            res.redirect('/vehiculos');  // Redirige a la lista de vehículos después de la creación
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });



    // Actualizar un vehículo existente y renderizar la vista de actualización
    router.get('/edit/:id', async (req, res) => {
        try {
            const vehiculo = await VehiculoModels.findById(req.params.id);
            res.render('vehiculos/update', { vehiculo });  // Renderiza la vista 'views/vehiculos/update.ejs'
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/edit/:id', async (req, res) => {
        try {
            const vehiculoActualizado = await VehiculoModels.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.redirect('/vehiculos');  // Redirige a la lista de vehículos después de la actualización
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // Eliminar un vehículo
    router.get('/delete/:id', async (req, res) => {
        try {
            await VehiculoModels.findByIdAndDelete(req.params.id);
            res.redirect('/vehiculos');  // Redirige a la lista de vehículos después de la eliminación
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    
    
}



module.exports = Vehiculo