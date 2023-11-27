const mongoose = require('mongoose');

const mensajeroSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehiculo' },
}, { timestamps: true });

const Mensajero = mongoose.model('Mensajero', mensajeroSchema);

module.exports = Mensajero;
