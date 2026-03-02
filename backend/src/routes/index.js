/**
 * Arquivo de rotas consolidado
 * Importa e exporta todas as rotas
 */

import express from 'express';
import authRoutes from './auth.js';
import { User } from '../models/User.js';
import { Imovel } from '../models/Imovel.js';
import { Dependencia } from '../models/Dependencia.js';
import { TipoObra } from '../models/TipoObra.js';
import { Fornecedor } from '../models/Fornecedor.js';
import { Orcamento } from '../models/Orcamento.js';
import { Tarefa } from '../models/Tarefa.js';
import { authenticate, requireApproved, requireAdmin } from '../middleware/auth.js';
import { hashPassword } from '../utils/auth.js';

const router = express.Router();

// Rotas de autenticação
router.use('/auth', authRoutes);

// ===== USERS (Admin only) =====
router.get('/users', authenticate, requireApproved, requireAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password_hash');
        res.json(users.map(u => ({
            id: u._id,
            email: u.email,
            name: u.name,
            is_admin: u.is_admin,
            is_approved: u.is_approved,
            created_at: u.created_at,
        })));
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.post('/users', authenticate, requireApproved, requireAdmin, async (req, res) => {
    try {
        const { email, name, password } = req.body;
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ detail: 'Email já cadastrado' });
        }
        const user = await User.create({
            email: email.toLowerCase(),
            name,
            password_hash: await hashPassword(password),
        });
        res.status(201).json({
            id: user._id,
            email: user.email,
            name: user.name,
            is_admin: user.is_admin,
            is_approved: user.is_approved,
            created_at: user.created_at,
        });
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// ===== IMOVEIS =====
router.get('/imoveis', authenticate, requireApproved, async (req, res) => {
    try {
        const imoveis = await Imovel.find();
        res.json(imoveis.map(i => ({
            id: i._id,
            tipo: i.tipo,
            endereco: i.endereco,
            cliente: i.cliente,
            created_by: i.created_by,
            created_at: i.created_at,
            updated_at: i.updated_at,
        })));
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.post('/imoveis', authenticate, requireApproved, async (req, res) => {
    try {
        const imovel = await Imovel.create({
            ...req.body,
            created_by: req.user._id,
        });

        // Cria automaticamente a dependência "Produtos e Eletros" para o novo imóvel
        await Dependencia.create({
            imovel_id: imovel._id,
            nome: 'Produtos e Eletros',
            descricao: 'Cômodo geral para eletrodomésticos, móveis e eletrônicos',
        });

        res.status(201).json({
            id: imovel._id,
            tipo: imovel.tipo,
            endereco: imovel.endereco,
            cliente: imovel.cliente,
            created_by: imovel.created_by,
            created_at: imovel.created_at,
            updated_at: imovel.updated_at,
        });
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.put('/imoveis/:id', authenticate, requireApproved, async (req, res) => {
    try {
        const imovel = await Imovel.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updated_at: new Date() },
            { new: true, runValidators: true }
        );
        if (!imovel) {
            return res.status(404).json({ detail: 'Imóvel não encontrado' });
        }
        res.json({
            id: imovel._id,
            tipo: imovel.tipo,
            endereco: imovel.endereco,
            cliente: imovel.cliente,
            created_by: imovel.created_by,
            created_at: imovel.created_at,
            updated_at: imovel.updated_at,
        });
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.delete('/imoveis/:id', authenticate, requireApproved, async (req, res) => {
    try {
        await Imovel.findByIdAndDelete(req.params.id);
        await Dependencia.deleteMany({ imovel_id: req.params.id });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// ===== DEPENDENCIAS =====
router.get('/dependencias', authenticate, requireApproved, async (req, res) => {
    try {
        const query = req.query.imovel_id ? { imovel_id: req.query.imovel_id } : {};
        const deps = await Dependencia.find(query);
        res.json(deps.map(d => ({
            id: d._id,
            imovel_id: d.imovel_id,
            nome: d.nome,
            descricao: d.descricao,
            tipos_obra: d.tipos_obra || [],
            created_at: d.created_at,
        })));
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.post('/dependencias', authenticate, requireApproved, async (req, res) => {
    try {
        const dep = await Dependencia.create(req.body);
        res.status(201).json({
            id: dep._id,
            imovel_id: dep.imovel_id,
            nome: dep.nome,
            descricao: dep.descricao,
            tipos_obra: dep.tipos_obra || [],
            created_at: dep.created_at,
        });
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.put('/dependencias/:id', authenticate, requireApproved, async (req, res) => {
    try {
        const dep = await Dependencia.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!dep) {
            return res.status(404).json({ detail: 'Dependência não encontrada' });
        }
        res.json({
            id: dep._id,
            imovel_id: dep.imovel_id,
            nome: dep.nome,
            descricao: dep.descricao,
            tipos_obra: dep.tipos_obra || [],
            created_at: dep.created_at,
        });
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.delete('/dependencias/:id', authenticate, requireApproved, async (req, res) => {
    try {
        await Dependencia.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// Sincroniza imóveis existentes criando a dependência "Produtos e Eletros" se não existir
router.post('/dependencias/sync-produtos', authenticate, requireApproved, async (req, res) => {
    try {
        const imoveis = await Imovel.find();
        let createdCount = 0;

        for (const imovel of imoveis) {
            const existingDep = await Dependencia.findOne({
                imovel_id: imovel._id,
                nome: 'Produtos e Eletros'
            });

            if (!existingDep) {
                await Dependencia.create({
                    imovel_id: imovel._id,
                    nome: 'Produtos e Eletros',
                    descricao: 'Cômodo geral para eletrodomésticos, móveis e eletrônicos',
                });
                createdCount++;
            }
        }

        res.json({
            message: 'Sincronização de dependências concluída',
            created_count: createdCount
        });
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// ===== TIPOS OBRA =====
router.get('/tipos-obra', authenticate, requireApproved, async (req, res) => {
    try {
        const query = {};
        if (req.query.categoria) query.categoria = req.query.categoria;

        const tipos = await TipoObra.find(query);
        res.json(tipos.map(t => ({
            id: t._id,
            nome: t.nome,
            descricao: t.descricao,
            categoria: t.categoria,
            marca: t.marca,
            tamanho: t.tamanho,
            created_at: t.created_at,
        })));
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.post('/tipos-obra', authenticate, requireApproved, async (req, res) => {
    try {
        const tipo = await TipoObra.create(req.body);
        res.status(201).json({
            id: tipo._id,
            nome: tipo.nome,
            descricao: tipo.descricao,
            categoria: tipo.categoria,
            marca: tipo.marca,
            tamanho: tipo.tamanho,
            created_at: tipo.created_at,
        });
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.put('/tipos-obra/:id', authenticate, requireApproved, async (req, res) => {
    try {
        const tipo = await TipoObra.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!tipo) {
            return res.status(404).json({ detail: 'Tipo de obra não encontrado' });
        }
        res.json({
            id: tipo._id,
            nome: tipo.nome,
            descricao: tipo.descricao,
            categoria: tipo.categoria,
            marca: tipo.marca,
            tamanho: tipo.tamanho,
            created_at: tipo.created_at,
        });
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.delete('/tipos-obra/:id', authenticate, requireApproved, async (req, res) => {
    try {
        await TipoObra.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// ===== FORNECEDORES =====
router.get('/fornecedores', authenticate, requireApproved, async (req, res) => {
    try {
        const fornecedores = await Fornecedor.find();
        res.json(fornecedores.map(f => ({
            id: f._id,
            nome: f.nome,
            contato: f.contato,
            telefone: f.telefone,
            email: f.email,
            documento: f.documento,
            endereco: f.endereco,
            tipos_obra: f.tipos_obra,
            created_at: f.created_at,
        })));
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.post('/fornecedores', authenticate, requireApproved, async (req, res) => {
    try {
        const forn = await Fornecedor.create(req.body);
        res.status(201).json({
            id: forn._id,
            nome: forn.nome,
            contato: forn.contato,
            telefone: forn.telefone,
            email: forn.email,
            documento: forn.documento,
            endereco: forn.endereco,
            tipos_obra: forn.tipos_obra,
            created_at: forn.created_at,
        });
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.put('/fornecedores/:id', authenticate, requireApproved, async (req, res) => {
    try {
        const forn = await Fornecedor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!forn) {
            return res.status(404).json({ detail: 'Fornecedor não encontrado' });
        }
        res.json({
            id: forn._id,
            nome: forn.nome,
            contato: forn.contato,
            telefone: forn.telefone,
            email: forn.email,
            documento: forn.documento,
            endereco: forn.endereco,
            tipos_obra: forn.tipos_obra,
            created_at: forn.created_at,
        });
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.delete('/fornecedores/:id', authenticate, requireApproved, async (req, res) => {
    try {
        await Fornecedor.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// ===== ORCAMENTOS =====
router.get('/orcamentos', authenticate, requireApproved, async (req, res) => {
    try {
        const query = {};
        if (req.query.dependencia_id) query.dependencia_id = req.query.dependencia_id;
        if (req.query.tipo_obra_id) query.tipo_obra_id = req.query.tipo_obra_id;
        if (req.query.fornecedor_id) query.fornecedor_id = req.query.fornecedor_id;
        if (req.query.status) query.status = req.query.status;

        const orcs = await Orcamento.find(query);
        res.json(orcs.map(o => ({
            id: o._id,
            dependencia_id: o.dependencia_id,
            tipo_obra_id: o.tipo_obra_id,
            fornecedor_id: o.fornecedor_id,
            descricao: o.descricao,
            valor: o.valor,
            status: o.status,
            created_at: o.created_at,
            updated_at: o.updated_at,
        })));
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

import multer from 'multer';
import uploadConfig from '../config/upload.js';
const upload = multer(uploadConfig);

// ... (imports anteriores)

// ...

router.post('/orcamentos', authenticate, requireApproved, upload.single('arquivo'), async (req, res) => {
    try {
        const { dependencia_id, tipo_obra_id, fornecedor_id, descricao, valor, status } = req.body;

        const orcData = {
            dependencia_id,
            tipo_obra_id,
            fornecedor_id,
            descricao,
            valor,
            status,
        };

        if (req.file) {
            orcData.arquivo_url = `uploads/${req.file.filename}`;
            orcData.arquivo_nome = req.file.originalname;
        }

        const orc = await Orcamento.create(orcData);
        res.status(201).json({
            id: orc._id,
            dependencia_id: orc.dependencia_id,
            tipo_obra_id: orc.tipo_obra_id,
            fornecedor_id: orc.fornecedor_id,
            descricao: orc.descricao,
            valor: orc.valor,
            status: orc.status,
            arquivo_url: orc.arquivo_url,
            arquivo_nome: orc.arquivo_nome,
            created_at: orc.created_at,
            updated_at: orc.updated_at,
        });
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.put('/orcamentos/:id', authenticate, requireApproved, upload.single('arquivo'), async (req, res) => {
    try {
        const { dependencia_id, tipo_obra_id, fornecedor_id, descricao, valor, status } = req.body;

        const updateData = {
            dependencia_id,
            tipo_obra_id,
            fornecedor_id,
            descricao,
            valor,
            status,
            updated_at: new Date()
        };

        if (req.file) {
            updateData.arquivo_url = `uploads/${req.file.filename}`;
            updateData.arquivo_nome = req.file.originalname;
        }

        const orc = await Orcamento.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        if (!orc) {
            return res.status(404).json({ detail: 'Orçamento não encontrado' });
        }
        res.json({
            id: orc._id,
            dependencia_id: orc.dependencia_id,
            tipo_obra_id: orc.tipo_obra_id,
            fornecedor_id: orc.fornecedor_id,
            descricao: orc.descricao,
            valor: orc.valor,
            status: orc.status,
            arquivo_url: orc.arquivo_url,
            arquivo_nome: orc.arquivo_nome,
            created_at: orc.created_at,
            updated_at: orc.updated_at,
        });
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.delete('/orcamentos/:id', authenticate, requireApproved, async (req, res) => {
    try {
        await Orcamento.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// Aprovar um orçamento e rejeitar os demais para a mesma dependência e tipo de obra
router.patch('/orcamentos/:id/aprovar', authenticate, requireApproved, async (req, res) => {
    try {
        const orc = await Orcamento.findById(req.params.id);
        if (!orc) {
            return res.status(404).json({ detail: 'Orçamento não encontrado' });
        }

        // Aprova este orçamento
        orc.status = 'aprovado';
        orc.updated_at = new Date();
        await orc.save();

        // Rejeita os outros orçamentos para a mesma dependência e tipo de obra
        await Orcamento.updateMany(
            {
                _id: { $ne: orc._id },
                dependencia_id: orc.dependencia_id,
                tipo_obra_id: orc.tipo_obra_id
            },
            { status: 'rejeitado', updated_at: new Date() }
        );

        // Remove tarefas antigas vinculadas a este item/dependência para evitar duplicidade
        await Tarefa.deleteMany({
            dependencia_id: orc.dependencia_id,
            tipo_obra_id: orc.tipo_obra_id
        });

        // Busca dados para o título da tarefa
        const [dep, item, forn] = await Promise.all([
            Dependencia.findById(orc.dependencia_id),
            TipoObra.findById(orc.tipo_obra_id),
            Fornecedor.findById(orc.fornecedor_id)
        ]);

        // Cria nova tarefa no Kanban automaticamente
        const novaTarefa = new Tarefa({
            dependencia_id: orc.dependencia_id,
            tipo_obra_id: orc.tipo_obra_id,
            orcamento_id: orc._id,
            titulo: `${item?.nome} - ${forn?.nome}`,
            descricao: `Serviço de ${item?.nome} na ${dep?.nome} aprovado por R$ ${orc.valor.toLocaleString('pt-BR')}. Fornecedor: ${forn?.nome}.`,
            status: 'orcamento',
            prioridade: 'media',
            created_by: req.user.id
        });

        await novaTarefa.save();

        res.json({
            message: 'Orçamento aprovado, demais rejeitados e tarefa Kanban criada com sucesso',
            tarefa_id: novaTarefa._id
        });
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// ===== TAREFAS =====
router.get('/tarefas', authenticate, requireApproved, async (req, res) => {
    try {
        const query = {};
        if (req.query.dependencia_id) query.dependencia_id = req.query.dependencia_id;
        if (req.query.status) query.status = req.query.status;

        const tarefas = await Tarefa.find(query).sort({ status: 1, ordem: 1 });
        res.json(tarefas.map(t => ({
            id: t._id,
            dependencia_id: t.dependencia_id,
            tipo_obra_id: t.tipo_obra_id,
            titulo: t.titulo,
            descricao: t.descricao,
            status: t.status,
            prioridade: t.prioridade,
            ordem: t.ordem,
            assigned_to: t.assigned_to,
            created_by: t.created_by,
            created_at: t.created_at,
            updated_at: t.updated_at,
        })));
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.post('/tarefas', authenticate, requireApproved, async (req, res) => {
    try {
        // Calcula próxima ordem
        const maxOrdem = await Tarefa.findOne({ status: req.body.status || 'todo' }).sort({ ordem: -1 });
        const nextOrdem = maxOrdem ? maxOrdem.ordem + 1 : 0;

        const tarefa = await Tarefa.create({
            ...req.body,
            ordem: nextOrdem,
            created_by: req.user._id,
        });

        res.status(201).json({
            id: tarefa._id,
            dependencia_id: tarefa.dependencia_id,
            tipo_obra_id: tarefa.tipo_obra_id,
            titulo: tarefa.titulo,
            descricao: tarefa.descricao,
            status: tarefa.status,
            prioridade: tarefa.prioridade,
            ordem: tarefa.ordem,
            assigned_to: tarefa.assigned_to,
            created_by: tarefa.created_by,
            created_at: tarefa.created_at,
            updated_at: tarefa.updated_at,
        });
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.patch('/tarefas/:id/status', authenticate, requireApproved, async (req, res) => {
    try {
        const { status, ordem } = req.body;
        const tarefa = await Tarefa.findById(req.params.id);

        if (!tarefa) {
            return res.status(404).json({ detail: 'Tarefa não encontrada' });
        }

        const oldStatus = tarefa.status;
        const oldOrdem = tarefa.ordem;

        // Atualiza tarefa
        tarefa.status = status;
        tarefa.ordem = ordem;
        tarefa.updated_at = new Date();
        await tarefa.save();

        // Reorganiza ordens
        if (oldStatus !== status) {
            await Tarefa.updateMany(
                { status: oldStatus, ordem: { $gt: oldOrdem } },
                { $inc: { ordem: -1 } }
            );
            await Tarefa.updateMany(
                { _id: { $ne: tarefa._id }, status, ordem: { $gte: ordem } },
                { $inc: { ordem: 1 } }
            );
        }

        res.json({
            id: tarefa._id,
            dependencia_id: tarefa.dependencia_id,
            tipo_obra_id: tarefa.tipo_obra_id,
            titulo: tarefa.titulo,
            descricao: tarefa.descricao,
            status: tarefa.status,
            prioridade: tarefa.prioridade,
            ordem: tarefa.ordem,
            assigned_to: tarefa.assigned_to,
            created_by: tarefa.created_by,
            created_at: tarefa.created_at,
            updated_at: tarefa.updated_at,
        });
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// Sincroniza orçamentos aprovados que não possuem tarefas no Kanban
router.post('/tarefas/sync', authenticate, requireApproved, async (req, res) => {
    try {
        const approvedOrcamentos = await Orcamento.find({ status: 'aprovado' });
        let createdCount = 0;

        for (const orc of approvedOrcamentos) {
            // Verifica se já existe uma tarefa para este orçamento
            const existingTask = await Tarefa.findOne({ orcamento_id: orc._id });

            if (!existingTask) {
                // Busca dados para o título da tarefa
                const [dep, item, forn] = await Promise.all([
                    Dependencia.findById(orc.dependencia_id),
                    TipoObra.findById(orc.tipo_obra_id),
                    Fornecedor.findById(orc.fornecedor_id)
                ]);

                // Calcula próxima ordem na coluna 'orcamento'
                const maxOrdem = await Tarefa.findOne({ status: 'orcamento' }).sort({ ordem: -1 });
                const nextOrdem = maxOrdem ? maxOrdem.ordem + 1 : 0;

                const novaTarefa = new Tarefa({
                    dependencia_id: orc.dependencia_id,
                    tipo_obra_id: orc.tipo_obra_id,
                    orcamento_id: orc._id,
                    titulo: `${item?.nome || 'Serviço'} - ${forn?.nome || 'Fornecedor'}`,
                    descricao: `Serviço de ${item?.nome || 'obra'} na ${dep?.nome || 'dependência'} aprovado por R$ ${orc.valor.toLocaleString('pt-BR')}.`,
                    status: 'orcamento',
                    prioridade: 'media',
                    ordem: nextOrdem,
                    created_by: req.user._id
                });

                await novaTarefa.save();
                createdCount++;
            }
        }

        res.json({
            message: 'Sincronização concluída',
            created_tasks: createdCount
        });
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// Relatório de orçamentos aprovados agrupados por fornecedor
router.get('/orcamentos/relatorio-por-fornecedor', authenticate, requireApproved, async (req, res) => {
    try {
        const result = await Orcamento.aggregate([
            { $match: { status: 'aprovado' } },
            {
                $lookup: {
                    from: 'fornecedors',
                    localField: 'fornecedor_id',
                    foreignField: '_id',
                    as: 'fornecedor'
                }
            },
            { $unwind: '$fornecedor' },
            {
                $lookup: {
                    from: 'dependencias',
                    localField: 'dependencia_id',
                    foreignField: '_id',
                    as: 'dependencia'
                }
            },
            { $unwind: '$dependencia' },
            {
                $lookup: {
                    from: 'tipoobras',
                    localField: 'tipo_obra_id',
                    foreignField: '_id',
                    as: 'item'
                }
            },
            { $unwind: '$item' },
            {
                $group: {
                    _id: '$fornecedor_id',
                    fornecedor_nome: { $first: '$fornecedor.nome' },
                    orcamentos: {
                        $push: {
                            id: '$_id',
                            dependencia: '$dependencia.nome',
                            item: '$item.nome',
                            descricao: '$descricao',
                            valor: '$valor',
                            arquivo_url: '$arquivo_url'
                        }
                    },
                    total: { $sum: '$valor' }
                }
            },
            { $sort: { fornecedor_nome: 1 } }
        ]);

        res.json(result);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// ===== DASHBOARD =====
router.get('/dashboard/stats', authenticate, requireApproved, async (req, res) => {
    try {
        const [totalImoveis, totalDeps, totalOrcs, totalTarefas] = await Promise.all([
            Imovel.countDocuments(),
            Dependencia.countDocuments(),
            Orcamento.countDocuments(),
            Tarefa.countDocuments(),
        ]);

        const valorTotal = await Orcamento.aggregate([
            { $group: { _id: null, total: { $sum: '$valor' } } }
        ]);

        const valorAprovado = await Orcamento.aggregate([
            { $match: { status: 'aprovado' } },
            { $group: { _id: null, total: { $sum: '$valor' } } }
        ]);

        const orcsPorStatus = await Orcamento.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$valor' } } }
        ]);

        const tarefasPorStatus = await Tarefa.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json({
            totais: {
                imoveis: totalImoveis,
                dependencias: totalDeps,
                orcamentos: totalOrcs,
                tarefas: totalTarefas,
                valor_total_orcamentos: valorTotal[0]?.total || 0,
                valor_total_aprovado: valorAprovado[0]?.total || 0,
            },
            orcamentos_por_status: orcsPorStatus.map(o => ({
                status: o._id,
                count: o.count,
                total: o.total,
            })),
            tarefas_por_status: tarefasPorStatus.map(t => ({
                status: t._id,
                count: t.count,
            })),
        });
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.get('/dashboard/orcamentos-por-dependencia', authenticate, requireApproved, async (req, res) => {
    try {
        const result = await Orcamento.aggregate([
            {
                $lookup: {
                    from: 'dependencias',
                    localField: 'dependencia_id',
                    foreignField: '_id',
                    as: 'dependencia'
                }
            },
            { $unwind: '$dependencia' },
            {
                $group: {
                    _id: '$dependencia._id',
                    nome: { $first: '$dependencia.nome' },
                    imovel_id: { $first: '$dependencia.imovel_id' },
                    total_orcamentos: { $sum: '$valor' },
                    total_aprovado: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'aprovado'] }, '$valor', 0]
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json(result.map(r => ({
            dependencia_id: r._id,
            nome: r.nome,
            imovel_id: r.imovel_id,
            total_orcamentos: r.total_orcamentos,
            total_aprovado: r.total_aprovado,
            count: r.count,
        })));
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.get('/dashboard/orcamentos-por-item', authenticate, requireApproved, async (req, res) => {
    try {
        const result = await Orcamento.aggregate([
            {
                $lookup: {
                    from: 'tipoobras',
                    localField: 'tipo_obra_id',
                    foreignField: '_id',
                    as: 'item'
                }
            },
            { $unwind: '$item' },
            {
                $group: {
                    _id: '$item._id',
                    nome: { $first: '$item.nome' },
                    total_orcamentos: { $sum: '$valor' },
                    total_aprovado: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'aprovado'] }, '$valor', 0]
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { total_aprovado: -1 } }
        ]);

        res.json(result.map(r => ({
            id: r._id,
            nome: r.nome,
            total_orcamentos: r.total_orcamentos,
            total_aprovado: r.total_aprovado,
            count: r.count,
        })));
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

router.get('/dashboard/orcamentos-por-fornecedor', authenticate, requireApproved, async (req, res) => {
    try {
        const result = await Orcamento.aggregate([
            {
                $lookup: {
                    from: 'fornecedors',
                    localField: 'fornecedor_id',
                    foreignField: '_id',
                    as: 'fornecedor'
                }
            },
            { $unwind: '$fornecedor' },
            {
                $group: {
                    _id: '$fornecedor._id',
                    nome: { $first: '$fornecedor.nome' },
                    total_orcamentos: { $sum: '$valor' },
                    total_aprovado: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'aprovado'] }, '$valor', 0]
                        }
                    },
                    count_total: { $sum: 1 },
                    count_aprovado: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'aprovado'] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { total_aprovado: -1 } }
        ]);

        res.json(result.map(r => ({
            id: r._id,
            nome: r.nome,
            total_orcamentos: r.total_orcamentos,
            total_aprovado: r.total_aprovado,
            count_total: r.count_total,
            count_aprovado: r.count_aprovado,
        })));
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

export default router;
