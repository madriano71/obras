/**
 * Utilitários de autenticação
 * Hash de senhas e geração/validação de JWT
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

/**
 * Gera hash da senha usando bcrypt
 */
export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

/**
 * Verifica se a senha corresponde ao hash
 */
export async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

/**
 * Cria um token JWT
 */
export function createAccessToken(userId) {
    const payload = {
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
    });
}

/**
 * Verifica e decodifica um token JWT
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, config.jwtSecret);
    } catch (error) {
        throw new Error('Token inválido ou expirado');
    }
}

/**
 * Extrai o IP do cliente da requisição
 */
export function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || 'unknown';
}
