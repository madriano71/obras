/**
 * Rotas de Autenticação
 */

import express from 'express';
import { User } from '../models/User.js';
import { hashPassword, verifyPassword, createAccessToken, getClientIp } from '../utils/auth.js';
import { registerAttempt, checkBlocked, getRemainingTime, resetAttempts } from '../redis.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Login com rate limiting
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const clientIp = getClientIp(req);
        const emailLower = email.toLowerCase();

        // Verifica bloqueio por IP
        if (await checkBlocked(clientIp)) {
            const remainingTime = await getRemainingTime(clientIp);
            const minutes = Math.ceil(remainingTime / 60);
            return res.status(429).json({
                detail: `Muitas tentativas de login. Tente novamente em ${minutes} minutos.`
            });
        }

        // Verifica bloqueio por email
        if (await checkBlocked(emailLower)) {
            const remainingTime = await getRemainingTime(emailLower);
            const minutes = Math.ceil(remainingTime / 60);
            return res.status(429).json({
                detail: `Muitas tentativas de login. Tente novamente em ${minutes} minutos.`
            });
        }

        // Busca usuário
        const user = await User.findOne({ email: emailLower });

        if (!user || !(await verifyPassword(password, user.password_hash))) {
            // Registra tentativa falha
            await registerAttempt(clientIp);
            await registerAttempt(emailLower);
            return res.status(401).json({ detail: 'Email ou senha incorretos' });
        }

        // Verifica se está aprovado
        if (!user.is_approved) {
            return res.status(403).json({
                detail: 'Usuário não aprovado. Aguarde aprovação do administrador.'
            });
        }

        // Login bem-sucedido
        await resetAttempts(clientIp);
        await resetAttempts(emailLower);

        const access_token = createAccessToken(user._id.toString());

        console.log(`Login bem-sucedido: ${emailLower}`);

        res.json({ access_token, token_type: 'bearer' });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ detail: 'Erro interno do servidor' });
    }
});

/**
 * GET /api/auth/me
 * Retorna usuário atual
 */
router.get('/me', authenticate, async (req, res) => {
    res.json({
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        is_admin: req.user.is_admin,
        is_approved: req.user.is_approved,
        created_at: req.user.created_at,
    });
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', authenticate, (req, res) => {
    console.log(`Logout: ${req.user.email}`);
    res.json({ message: 'Logout realizado com sucesso' });
});

export default router;
