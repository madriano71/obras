/**
 * Modelo de Usuário (Mongoose)
 */

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    password_hash: {
        type: String,
        required: true,
    },
    is_admin: {
        type: Boolean,
        default: false,
    },
    is_approved: {
        type: Boolean,
        default: false,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});


export const User = mongoose.model('User', userSchema);
