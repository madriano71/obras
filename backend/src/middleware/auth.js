/**
 * Middleware de autenticação
 * Verifica JWT token e carrega usuário
 */

import { verifyToken } from '../utils/auth.js';
import { User } from '../models/User.js';

/**
 * Middleware para verificar autenticação
 */
export async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ detail: 'Token não fornecido' });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        const user = await User.findById(decoded.sub);

        if (!user) {
            return res.status(401).json({ detail: 'Usuário não encontrado' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ detail: 'Token inválido ou expirado' });
    }
}

/**
 * Middleware para verificar se usuário está aprovado
 */
export function requireApproved(req, res, next) {
    if (!req.user.is_approved) {
        return res.status(403).json({
            detail: 'Usuário não aprovado. Aguarde aprovação do administrador.'
        });
    }
    next();
}

/**
 * Middleware para verificar se usuário é admin
 */
export function requireAdmin(req, res, next) {
    if (!req.user.is_admin) {
        return res.status(403).json({
            detail: 'Acesso negado. Apenas administradores podem acessar este recurso.'
        });
    }
    next();
}
