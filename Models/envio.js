const mongoose = require('mongoose');

const envioSchema = new mongoose.Schema({
    actividad: { type: String, required: true },
    destinatario: { type: String, required: true },
    mensajero: { type: mongoose.Schema.Types.ObjectId, ref: 'Mensajero', required: true },

}, { timestamps: true });

const Envio = mongoose.model('Envio', envioSchema);

module.exports = Envio;
