const mongoose = require('mongoose');

const vehiculoSchema = new mongoose.Schema({
    tipo: {
        type: String,
        required: true
    },
    modelo: {
        type: Number,
        required: true
    },
    marca:{
        type:String,
        required: true
    },
    placa:{
     type:String,
     required:true,
     unique: true,
    }
}, { timestamps: true });

const Vehiculo = mongoose.model('Vehiculo', vehiculoSchema);

module.exports = Vehiculo;
