/**
 * Servidor Express
 * Aplicação principal
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import { connectToMongo, closeMongo } from './database.js';
import { connectToRedis, closeRedis, redisClient, useMemory } from './redis.js';
import { User } from './models/User.js';
import { hashPassword } from './utils/auth.js';
import routes from './routes/index.js';

const app = express();

// Middlewares
app.use(helmet());

// Configuração robusta de CORS com logs
const corsOptions = {
    origin: function (origin, callback) {
        // Permite requisições sem origin (como mobile apps ou curl)
        if (!origin) return callback(null, true);

        const allowedOrigins = config.corsOrigins.map(o => o.trim());

        console.log(`CORS Request - Origin: ${origin}`);
        console.log(`CORS Allowed: ${JSON.stringify(allowedOrigins)}`);

        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            console.log(`✅ CORS Aprovado para: ${origin}`);
            callback(null, true);
        } else {
            console.error(`❌ CORS Bloqueado! Origem: ${origin}. Permitidas: ${JSON.stringify(allowedOrigins)}`);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Arquivos Estáticos
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Rotas
app.use('/api', routes);

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        message: 'Sistema de Gerenciamento de Obras Residenciais',
        version: '1.0.0',
        docs: '/api',
    });
});

// Health check aprimorado
app.get('/health', async (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const redisStatus = redisClient && redisClient.isOpen ? 'connected' : (useMemory ? 'memory_fallback' : 'disconnected');

    const isHealthy = mongoStatus === 'connected'; // Redis em memória é aceitável para o sistema rodar

    res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'healthy' : 'unhealthy',
        services: {
            mongodb: mongoStatus,
            redis: redisStatus
        },
        timestamp: Date.now(),
        env: config.nodeEnv
    });
});

// Cria usuário admin padrão
async function createDefaultAdmin() {
    try {
        const adminEmail = 'admin@admin.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            await User.create({
                email: adminEmail,
                name: 'Administrador',
                password_hash: await hashPassword('admin123'),
                is_admin: true,
                is_approved: true,
            });
            console.log(`✅ Usuário admin criado: ${adminEmail}`);
        } else if (!existingAdmin.is_approved || !existingAdmin.is_admin) {
            existingAdmin.is_approved = true;
            existingAdmin.is_admin = true;
            await existingAdmin.save();
            console.log(`✅ Usuário admin atualizado para aprovado: ${adminEmail}`);
        } else {
            console.log('ℹ️  Usuário admin já existe e está ativo');
        }
    } catch (error) {
        console.error('Erro ao criar admin:', error);
    }
}

// Inicialização
async function startServer() {
    try {
        // Conecta ao MongoDB
        await connectToMongo();

        // Conecta ao Redis
        await connectToRedis();

        // Cria admin padrão
        await createDefaultAdmin();

        // Inicia servidor
        app.listen(config.port, () => {
            console.log(`\n🚀 Servidor rodando em http://localhost:${config.port}`);
            console.log(`📚 Documentação: http://localhost:${config.port}/api`);
            console.log(`🏥 Health check: http://localhost:${config.port}/health`);
            console.log(`\n✅ Aplicação iniciada com sucesso!\n`);
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Tratamento de encerramento
process.on('SIGINT', async () => {
    console.log('\n\n🛑 Encerrando aplicação...');
    await closeMongo();
    await closeRedis();
    console.log('✅ Aplicação encerrada.\n');
    process.exit(0);
});

// Inicia servidor
startServer();
