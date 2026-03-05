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
    const startTime = Date.now();
    try {
        const { email, password } = req.body;
        console.log(`[PROD-LOG] Tentativa de login iniciada: ${email}`);
        const clientIp = getClientIp(req);
        const emailLower = email.toLowerCase();

        // 1. Check Redis Blocked IP
        const mark1 = Date.now();
        const isIpBlocked = await checkBlocked(clientIp);
        console.log(`[PROD-LOG] Check IP Blocked: ${Date.now() - mark1}ms`);

        if (isIpBlocked) {
            const remainingTime = await getRemainingTime(clientIp);
            return res.status(429).json({
                detail: `Muitas tentativas de login. Tente novamente em ${Math.ceil(remainingTime / 60)} minutos.`
            });
        }

        // 2. Check Redis Blocked Email
        const mark2 = Date.now();
        const isEmailBlocked = await checkBlocked(emailLower);
        console.log(`[PROD-LOG] Check Email Blocked: ${Date.now() - mark2}ms`);

        if (isEmailBlocked) {
            const remainingTime = await getRemainingTime(emailLower);
            return res.status(429).json({
                detail: `Muitas tentativas de login. Tente novamente em ${Math.ceil(remainingTime / 60)} minutos.`
            });
        }

        // 3. MongoDB Find User
        const mark3 = Date.now();
        const user = await User.findOne({ email: emailLower });
        console.log(`[PROD-LOG] MongoDB Find User: ${Date.now() - mark3}ms`);

        if (!user) {
            console.log(`[PROD-LOG] Login falhou: Usuário não encontrado ${emailLower}`);
            await registerAttempt(clientIp);
            await registerAttempt(emailLower);
            return res.status(401).json({ detail: 'Email ou senha incorretos' });
        }

        // 4. Verify Password (Bcrypt)
        const mark4 = Date.now();
        const isPasswordValid = await verifyPassword(password, user.password_hash);
        console.log(`[PROD-LOG] Bcrypt Verify: ${Date.now() - mark4}ms`);

        if (!isPasswordValid) {
            console.log(`[PROD-LOG] Login falhou: Senha incorreta para ${emailLower}`);
            await registerAttempt(clientIp);
            await registerAttempt(emailLower);
            return res.status(401).json({ detail: 'Email ou senha incorretos' });
        }

        if (!user.is_approved) {
            return res.status(403).json({ detail: 'Usuário não aprovado.' });
        }

        // 5. Success Flow
        const mark5 = Date.now();
        await resetAttempts(clientIp);
        await resetAttempts(emailLower);
        console.log(`[PROD-LOG] Redis Reset: ${Date.now() - mark5}ms`);

        const access_token = createAccessToken(user._id.toString());
        console.log(`[PROD-LOG] Login realizado com sucesso em ${Date.now() - startTime}ms`);

        res.json({ access_token, token_type: 'bearer' });
    } catch (error) {
        console.error(`[PROD-LOG] Erro CRÍTICO no login após ${Date.now() - startTime}ms:`, error);
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
