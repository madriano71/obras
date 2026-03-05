/**
 * Conexão e funções de Rate Limiting com Redis
 * Fallback para memória se Redis não estiver disponível
 */

import { createClient } from 'redis';
import { config } from './config.js';

let redisClient = null;
let useMemory = false;
const memoryStore = new Map(); // Armazenamento em memória caso Redis falhe

/**
 * Helper para verificar se devemos usar memória
 */
function shouldFallback() {
    return useMemory || !redisClient || !redisClient.isOpen;
}

export async function connectToRedis() {
    if (redisClient && redisClient.isOpen) {
        return redisClient;
    }

    try {
        console.log(`Conectando ao Redis: ${config.redisUrl}`);

        redisClient = createClient({
            url: config.redisUrl,
            socket: {
                connectTimeout: 2000,
                reconnectStrategy: false
            }
        });

        redisClient.on('error', (err) => {
            console.error('⚠️ Erro no Redis (cliente):', err.message);
            // Não mudamos useMemory aqui globalmente para sempre, 
            // pois o cliente pode tentar reconectar se configurado,
            // mas para nossas funções helpers, checaremos o status.
        });

        await redisClient.connect();
        console.log('✅ Conexão com Redis estabelecida com sucesso');
        useMemory = false;
        return redisClient;
    } catch (error) {
        console.error('⚠️ Falha na conexão inicial Redis. Ativando modo memória.');
        useMemory = true;
        return null;
    }
}

export async function closeRedis() {
    if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
        redisClient = null;
        console.log('Redis desconectado');
    }
}

// Limpeza memória
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of memoryStore.entries()) {
        if (value.expiresAt && value.expiresAt < now) {
            memoryStore.delete(key);
        }
    }
}, 60000);

/**
 * Registra uma tentativa de login
 */
export async function registerAttempt(identifier) {
    const key = `login_attempts:${identifier}`;

    if (shouldFallback()) {
        const now = Date.now();
        const record = memoryStore.get(key) || { count: 0, expiresAt: null };

        if (record.expiresAt && record.expiresAt < now) {
            record.count = 0;
            record.expiresAt = null;
        }

        record.count++;

        if (record.count === 1) {
            record.expiresAt = now + (config.loginBlockDurationMinutes * 60 * 1000);
        }

        memoryStore.set(key, record);
        console.log(`[Memória] Erro login registrado: ${identifier} (${record.count})`);
        return record.count;
    }

    try {
        // Timeout de segurança para operação no Redis (2 segundos)
        const attempts = await Promise.race([
            (async () => {
                const count = await redisClient.incr(key);
                if (count === 1) {
                    const expireSeconds = config.loginBlockDurationMinutes * 60;
                    await redisClient.expire(key, expireSeconds);
                }
                return count;
            })(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Redis Timeout')), 2000))
        ]);
        return attempts;
    } catch (error) {
        console.error('Erro Redis registerAttempt (ativando modo memória):', error.message);
        useMemory = true;
        return registerAttempt(identifier);
    }
}

/**
 * Verifica se o identificador está bloqueado
 */
export async function checkBlocked(identifier) {
    const key = `login_attempts:${identifier}`;

    if (shouldFallback()) {
        const now = Date.now();
        const record = memoryStore.get(key);

        if (!record) return false;
        if (record.expiresAt && record.expiresAt < now) {
            memoryStore.delete(key);
            return false;
        }

        const isBlocked = record.count >= config.loginAttemptsLimit;
        if (isBlocked) {
            console.warn(`[Memória] Bloqueado: ${identifier}`);
        }
        return isBlocked;
    }

    try {
        // Timeout de segurança para operação no Redis (2 segundos)
        const attempts = await Promise.race([
            redisClient.get(key),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Redis Timeout')), 2000))
        ]);

        if (!attempts) return false;
        const attemptsCount = parseInt(attempts);
        return attemptsCount >= config.loginAttemptsLimit;
    } catch (error) {
        console.error('Erro Redis checkBlocked (ativando modo memória):', error.message);
        useMemory = true;
        return checkBlocked(identifier);
    }
}

/**
 * Retorna o tempo restante de bloqueio em segundos
 */
export async function getRemainingTime(identifier) {
    const key = `login_attempts:${identifier}`;

    if (shouldFallback()) {
        const record = memoryStore.get(key);
        if (!record || !record.expiresAt) return 0;
        const remaining = Math.ceil((record.expiresAt - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
    }

    try {
        const ttl = await redisClient.ttl(key);
        return ttl > 0 ? ttl : 0;
    } catch (error) {
        return 0;
    }
}

/**
 * Reseta as tentativas de login
 */
export async function resetAttempts(identifier) {
    const key = `login_attempts:${identifier}`;

    if (shouldFallback()) {
        memoryStore.delete(key);
        return;
    }

    try {
        await redisClient.del(key);
    } catch (error) {
        console.error('Erro Redis resetAttempts:', error.message);
    }
}

/**
 * Retorna o número de tentativas realizadas
 */
export async function getAttemptsCount(identifier) {
    const key = `login_attempts:${identifier}`;

    if (shouldFallback()) {
        const record = memoryStore.get(key);
        return record ? record.count : 0;
    }

    try {
        const attempts = await redisClient.get(key);
        return attempts ? parseInt(attempts) : 0;
    } catch (error) {
        return 0;
    }
}

export { redisClient, useMemory };
