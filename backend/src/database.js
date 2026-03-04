/**
 * Conexão com MongoDB usando Mongoose
 */

import mongoose from 'mongoose';
import { config } from './config.js';

let isConnected = false;

export async function connectToMongo() {
    if (isConnected) {
        console.log('MongoDB já está conectado');
        return;
    }

    try {
        const baseUrl = config.mongodbUrl.endsWith('/')
            ? config.mongodbUrl.slice(0, -1)
            : config.mongodbUrl;

        const mongoUrl = `${baseUrl}/${config.databaseName}`;
        console.log(`Conectando ao MongoDB: ${mongoUrl}`);

        await mongoose.connect(mongoUrl);

        isConnected = true;
        console.log('✅ Conexão com MongoDB estabelecida com sucesso');

        // Listeners para eventos
        mongoose.connection.on('error', (err) => {
            console.error('❌ Erro no MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB desconectado');
            isConnected = false;
        });

    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
        throw error;
    }
}

export async function closeMongo() {
    if (!isConnected) return;

    try {
        await mongoose.connection.close();
        isConnected = false;
        console.log('MongoDB desconectado');
    } catch (error) {
        console.error('Erro ao fechar conexão MongoDB:', error);
        throw error;
    }
}

export { mongoose };
