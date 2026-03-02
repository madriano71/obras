/**
 * Modelo de Tarefa (Mongoose)
 */

import mongoose from 'mongoose';

const tarefaSchema = new mongoose.Schema({
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
    orcamento_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Orcamento',
    },
    titulo: {
        type: String,
        required: true,
    },
    descricao: String,
    status: {
        type: String,
        enum: ['orcamento', 'doing', 'done'],
        default: 'orcamento',
    },
    prioridade: {
        type: String,
        enum: ['baixa', 'media', 'alta'],
        default: 'media',
    },
    ordem: {
        type: Number,
        default: 0,
    },
    assigned_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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

tarefaSchema.index({ dependencia_id: 1 });
tarefaSchema.index({ status: 1, ordem: 1 });

export const Tarefa = mongoose.model('Tarefa', tarefaSchema);
