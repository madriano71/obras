/**
 * Configurações da aplicação
 * Carrega variáveis de ambiente
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
    // MongoDB
    mongodbUrl: process.env.MONGODB_URL || 'mongodb://localhost:27017',
    databaseName: process.env.DATABASE_NAME || 'obras_db',

    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30m',

    // Rate Limiting
    loginAttemptsLimit: parseInt(process.env.LOGIN_ATTEMPTS_LIMIT) || 5,
    loginBlockDurationMinutes: parseInt(process.env.LOGIN_BLOCK_DURATION_MINUTES) || 15,

    // Server
    port: parseInt(process.env.PORT) || 8000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // CORS
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(','),
};
