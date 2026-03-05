/**
 * Modelo de Fornecedor (Mongoose)
 */

import mongoose from 'mongoose';

const fornecedorSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
    },
    contato: {
        type: String,
        required: true,
    },
    telefone: {
        type: String,
        required: true,
    },
    email: String,
    documento: String, // CPF ou CNPJ
    endereco: {
        rua: String,
        numero: String,
        complemento: String,
        bairro: String,
        cidade: String,
        estado: String,
        cep: String,
    },
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

export const Fornecedor = mongoose.model('Fornecedor', fornecedorSchema);
