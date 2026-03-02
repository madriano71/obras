/**
 * Modelo de Orçamento (Mongoose)
 */

import mongoose from 'mongoose';

const orcamentoSchema = new mongoose.Schema({
    dependencia_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dependencia',
        required: true,
    },
    tipo_obra_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TipoObra',
        required: true,
    },
    fornecedor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fornecedor',
        required: true,
    },
    descricao: {
        type: String,
        required: true,
    },
    valor: {
        type: Number,
        required: true,
        min: 0,
    },
    arquivo_url: {
        type: String,
        default: null,
    },
    arquivo_nome: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ['pendente', 'aprovado', 'rejeitado'],
        default: 'pendente',
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

orcamentoSchema.index({ dependencia_id: 1 });
orcamentoSchema.index({ tipo_obra_id: 1 });
orcamentoSchema.index({ fornecedor_id: 1 });

export const Orcamento = mongoose.model('Orcamento', orcamentoSchema);
