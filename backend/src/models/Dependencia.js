/**
 * Modelo de Dependência (Mongoose)
 */

import mongoose from 'mongoose';

const dependenciaSchema = new mongoose.Schema({
    imovel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Imovel',
        required: true,
    },
    nome: {
        type: String,
        required: true,
    },
    descricao: String,
    tipos_obra: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TipoObra',
    }],
    created_at: {
        type: Date,
        default: Date.now,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
});

dependenciaSchema.index({ imovel_id: 1 });

export const Dependencia = mongoose.model('Dependencia', dependenciaSchema);
