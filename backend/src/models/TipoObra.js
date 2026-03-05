/**
 * Modelo de Tipo de Obra (Mongoose)
 */

import mongoose from 'mongoose';

const tipoObraSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
    },
    descricao: String,
    categoria: {
        type: String,
        enum: ['obra', 'eletrodomestico', 'mobilia', 'outros'],
        default: 'obra',
    },
    marca: String,
    tamanho: String,
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

export const TipoObra = mongoose.model('TipoObra', tipoObraSchema);
