/**
 * Modelo de Imóvel (Mongoose)
 */

import mongoose from 'mongoose';

const imovelSchema = new mongoose.Schema({
    tipo: {
        type: String,
        required: true,
    },
    endereco: {
        rua: { type: String, required: true },
        numero: { type: String, required: true },
        complemento: String,
        bairro: { type: String, required: true },
        cidade: { type: String, required: true },
        estado: { type: String, required: true },
        cep: { type: String, required: true },
    },
    cliente: {
        type: String,
        required: true,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

imovelSchema.index({ created_by: 1 });

export const Imovel = mongoose.model('Imovel', imovelSchema);
