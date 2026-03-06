/**
 * Arquivo de rotas consolidado
 * Importa e exporta todas as rotas
 */

import express from 'express';
import mongoose from 'mongoose';
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
        const { email, name, password, is_admin, is_approved } = req.body;
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ detail: 'Email já cadastrado' });
        }
        const user = await User.create({
            email: email.toLowerCase(),
            name,
            password_hash: await hashPassword(password),
            is_admin: is_admin || false,
            is_approved: is_approved || false
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

router.put('/users/:id', authenticate, requireApproved, requireAdmin, async (req, res) => {
    try {
        const { name, is_admin, is_approved, password } = req.body;
        const updateData = { name, is_admin, is_approved };

        if (password) {
            updateData.password_hash = await hashPassword(password);
        }

        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!user) {
            return res.status(404).json({ detail: 'Usuário não encontrado' });
        }
        res.json({
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

router.delete('/users/:id', authenticate, requireApproved, requireAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ detail: 'Usuário não encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// ===== IMOVEIS =====
router.get('/imoveis', authenticate, requireApproved, async (req, res) => {
    try {
        const imoveis = await Imovel.find({ created_by: req.user._id });
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
            created_by: req.user._id,
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
        const imovel = await Imovel.findOneAndUpdate(
            { _id: req.params.id, created_by: req.user._id },
            { ...req.body, updated_at: new Date() },
            { new: true, runValidators: true }
        );
        if (!imovel) {
            return res.status(404).json({ detail: 'Imóvel não encontrado ou sem permissão' });
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
        const imovel = await Imovel.findOneAndDelete({ _id: req.params.id, created_by: req.user._id });
        if (!imovel) {
            return res.status(404).json({ detail: 'Imóvel não encontrado ou sem permissão' });
        }
        await Dependencia.deleteMany({ imovel_id: req.params.id });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// ===== DEPENDENCIAS =====
router.get('/dependencias', authenticate, requireApproved, async (req, res) => {
    try {
        const query = { created_by: req.user._id };
        if (req.query.imovel_id) query.imovel_id = req.query.imovel_id;
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
        const dep = await Dependencia.create({
            ...req.body,
            created_by: req.user._id
        });
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
        const dep = await Dependencia.findOneAndUpdate(
            { _id: req.params.id, created_by: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!dep) {
            return res.status(404).json({ detail: 'Dependência não encontrada ou sem permissão' });
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
        const dep = await Dependencia.findOneAndDelete({ _id: req.params.id, created_by: req.user._id });
        if (!dep) {
            return res.status(404).json({ detail: 'Dependência não encontrada ou sem permissão' });
        }
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
        const tipo = await TipoObra.create({
            ...req.body,
            created_by: req.user._id
        });
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
        const tipo = await TipoObra.findOneAndDelete({ _id: req.params.id, created_by: req.user._id });
        if (!tipo) {
            return res.status(404).json({ detail: 'Tipo de obra não encontrado ou sem permissão' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// ===== FORNECEDORES =====
router.get('/fornecedores', authenticate, requireApproved, async (req, res) => {
    try {
        const fornecedores = await Fornecedor.find({ created_by: req.user._id });
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
        const forn = await Fornecedor.create({
            ...req.body,
            created_by: req.user._id
        });
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
        const forn = await Fornecedor.findOneAndUpdate(
            { _id: req.params.id, created_by: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!forn) {
            return res.status(404).json({ detail: 'Fornecedor não encontrado ou sem permissão' });
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
        const forn = await Fornecedor.findOneAndDelete({ _id: req.params.id, created_by: req.user._id });
        if (!forn) {
            return res.status(404).json({ detail: 'Fornecedor não encontrado ou sem permissão' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// ===== ORCAMENTOS =====
router.get('/orcamentos', authenticate, requireApproved, async (req, res) => {
    try {
        const query = { created_by: req.user._id };
        if (req.query.dependencia_id) query.dependencia_id = req.query.dependencia_id;
        if (req.query.tipo_obra_id) query.tipo_obra_id = req.query.tipo_obra_id;
        if (req.query.fornecedor_id) query.fornecedor_id = req.query.fornecedor_id;
        if (req.query.status) query.status = req.query.status;

        const orcs = await Orcamento.find(query);
        res.json(orcs.map(o => {
            const obj = o.toObject();
            return {
                id: obj._id,
                dependencia_id: obj.dependencia_id,
                tipo_obra_id: obj.tipo_obra_id,
                fornecedor_id: obj.fornecedor_id,
                descricao: obj.descricao,
                quantidade: obj.quantidade,
                valor_unitario: obj.valor_unitario,
                valor: obj.valor,
                status: obj.status,
                pagamento: obj.pagamento,
                arquivo_url: obj.arquivo_url,
                arquivo_nome: obj.arquivo_nome,
                created_at: obj.created_at,
                updated_at: obj.updated_at,
            };
        }));
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
        const { dependencia_id, tipo_obra_id, fornecedor_id, descricao, valor_unitario, quantidade, status } = req.body;

        // Calcula o valor total automaticamente
        const valorCalculado = Number(valor_unitario) * Number(quantidade);

        const orcData = {
            dependencia_id,
            tipo_obra_id,
            fornecedor_id,
            descricao,
            valor_unitario: Number(valor_unitario),
            quantidade: Number(quantidade),
            valor: valorCalculado,
            status,
        };

        if (req.file) {
            orcData.arquivo_url = `uploads/${req.file.filename}`;
            orcData.arquivo_nome = req.file.originalname;
        }

        const orc = await Orcamento.create({
            ...orcData,
            created_by: req.user._id
        });
        res.status(201).json({
            id: orc._id,
            dependencia_id: orc.dependencia_id,
            tipo_obra_id: orc.tipo_obra_id,
            fornecedor_id: orc.fornecedor_id,
            descricao: orc.descricao,
            valor_unitario: orc.valor_unitario,
            quantidade: orc.quantidade,
            valor: orc.valor,
            status: orc.status,
            pagamento: orc.pagamento,
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
        const { dependencia_id, tipo_obra_id, fornecedor_id, descricao, valor_unitario, quantidade, status } = req.body;

        // Calcula o valor total automaticamente
        const valorCalculado = Number(valor_unitario) * Number(quantidade);

        const updateData = {
            dependencia_id,
            tipo_obra_id,
            fornecedor_id,
            descricao,
            valor_unitario: Number(valor_unitario),
            quantidade: Number(quantidade),
            valor: valorCalculado,
            status,
            updated_at: new Date()
        };

        if (req.file) {
            updateData.arquivo_url = `uploads/${req.file.filename}`;
            updateData.arquivo_nome = req.file.originalname;
        }

        const orc = await Orcamento.findOneAndUpdate(
            { _id: req.params.id, created_by: req.user._id },
            updateData,
            { new: true, runValidators: true }
        );
        if (!orc) {
            return res.status(404).json({ detail: 'Orçamento não encontrado ou sem permissão' });
        }
        res.json({
            id: orc._id,
            dependencia_id: orc.dependencia_id,
            tipo_obra_id: orc.tipo_obra_id,
            fornecedor_id: orc.fornecedor_id,
            descricao: orc.descricao,
            valor_unitario: orc.valor_unitario,
            quantidade: orc.quantidade,
            valor: orc.valor,
            status: orc.status,
            pagamento: orc.pagamento,
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
        const orc = await Orcamento.findOneAndDelete({ _id: req.params.id, created_by: req.user._id });
        if (!orc) {
            return res.status(404).json({ detail: 'Orçamento não encontrado ou sem permissão' });
        }
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

        // Regra de Negócio: Ao aprovar um novo orçamento, rejeita as demais 
        // cotações APENAS se estiverem "pendentes" (concorrentes).
        // Isso permite múltiplos ciclos aprovados/pagos (ex: vários fretes).
        await Orcamento.updateMany(
            {
                _id: { $ne: orc._id },
                dependencia_id: orc.dependencia_id,
                tipo_obra_id: orc.tipo_obra_id,
                created_by: req.user._id,
                status: 'pendente'
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
            Dependencia.findOne({ _id: orc.dependencia_id, created_by: req.user._id }),
            TipoObra.findById(orc.tipo_obra_id),
            Fornecedor.findOne({ _id: orc.fornecedor_id, created_by: req.user._id })
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
            created_by: req.user._id
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

// Desaprovar um orçamento (volta para pendente e remove tarefa do Kanban)
router.patch('/orcamentos/:id/desaprovar', authenticate, requireApproved, async (req, res) => {
    try {
        const orc = await Orcamento.findById(req.params.id);
        if (!orc) {
            return res.status(404).json({ detail: 'Orçamento não encontrado' });
        }

        if (orc.status !== 'aprovado') {
            return res.status(400).json({ detail: 'Apenas orçamentos aprovados podem ser desaprovados' });
        }

        // Verifica se a tarefa vinculada ainda está no estágio inicial 'orcamento'
        const tarefa = await Tarefa.findOne({ orcamento_id: orc._id });

        if (tarefa && tarefa.status !== 'orcamento') {
            return res.status(400).json({
                detail: 'Não é possível desaprovar este orçamento pois o serviço já está em andamento ou foi concluído no Kanban.'
            });
        }

        // Se a tarefa existir e estiver no estágio inicial, remove ela
        if (tarefa) {
            await Tarefa.findByIdAndDelete(tarefa._id);

            // Reorganiza ordens na coluna 'orcamento'
            await Tarefa.updateMany(
                { status: 'orcamento', ordem: { $gt: tarefa.ordem } },
                { $inc: { ordem: -1 } }
            );
        }

        // Volta o orçamento para pendente
        orc.status = 'pendente';
        orc.updated_at = new Date();
        await orc.save();

        res.json({
            message: 'Aprovação removida com sucesso. O orçamento voltou para o estado pendente e a tarefa foi removida do Kanban.',
            id: orc._id
        });
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// Atualizar informações de pagamento de um orçamento (e seu grupo por fornecedor e estágio)
router.patch('/orcamentos/:id/pagamento', authenticate, requireApproved, async (req, res) => {
    try {
        const { metodo, parcelas, valor_com_desconto } = req.body;

        const orc = await Orcamento.findOne({ _id: req.params.id, created_by: req.user._id });
        if (!orc) {
            return res.status(404).json({ detail: 'Orçamento não encontrado ou sem permissão' });
        }

        if (orc.status !== 'aprovado') {
            return res.status(400).json({ detail: 'Apenas orçamentos aprovados podem ter informações de pagamento' });
        }

        // Busca a tarefa vinculada para saber o status no Kanban
        const tarefa = await Tarefa.findOne({ orcamento_id: orc._id });
        const etapaInicial = !tarefa || tarefa.status === 'orcamento';

        const pagamentoData = {
            metodo,
            valor_com_desconto: valor_com_desconto ? Number(valor_com_desconto) : null,
            parcelas: parcelas.map(p => ({
                data_pagamento: new Date(p.data_pagamento),
                valor: Number(p.valor),
                pago: Boolean(p.pago)
            }))
        };


        // Identifica todos os orçamentos do mesmo fornecedor
        const orcamentosFornecedor = await Orcamento.find({
            fornecedor_id: orc.fornecedor_id,
            status: 'aprovado',
            created_by: req.user._id
        });

        // Filtra os IDs que estão na mesma etapa (inicial vs avançada)
        const idsParaAtualizar = [];
        for (const o of orcamentosFornecedor) {
            const t = await Tarefa.findOne({ orcamento_id: o._id });
            const e = !t || t.status === 'orcamento';
            if (e === etapaInicial) {
                idsParaAtualizar.push(o._id);
            }
        }

        await Orcamento.updateMany(
            { _id: { $in: idsParaAtualizar }, created_by: req.user._id },
            {
                $set: {
                    pagamento: pagamentoData,
                    updated_at: new Date()
                }
            }
        );

        res.json({
            message: 'Informações de pagamento do grupo atualizadas com sucesso',
            pagamento: pagamentoData,
            itens_atualizados: idsParaAtualizar.length
        });
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// Obter o total acumulado do grupo de pagamento (mesmo fornecedor e estágio)
router.get('/orcamentos/:id/grupo-total', authenticate, requireApproved, async (req, res) => {
    try {
        const orc = await Orcamento.findById(req.params.id);
        if (!orc) {
            return res.status(404).json({ detail: 'Orçamento não encontrado' });
        }

        // Identifica a etapa do orçamento atual
        const tarefaAtual = await Tarefa.findOne({ orcamento_id: orc._id });
        const etapaInicialAtual = !tarefaAtual || tarefaAtual.status === 'orcamento';

        // Busca todos os aprovados do fornecedor
        const orcamentosFornecedor = await Orcamento.find({
            fornecedor_id: orc.fornecedor_id,
            status: 'aprovado',
            created_by: req.user._id
        });

        let total = 0;
        let contagem = 0;

        for (const o of orcamentosFornecedor) {
            const t = await Tarefa.findOne({ orcamento_id: o._id });
            const e = !t || t.status === 'orcamento';
            if (e === etapaInicialAtual) {
                total += o.valor;
                contagem++;
            }
        }

        res.json({
            orcamento_id: orc.id,
            total_grupo: total,
            valor_com_desconto: orc.pagamento?.valor_com_desconto || null,
            quantidade_itens: contagem,
            etapa: etapaInicialAtual ? 'inicial' : 'avancada'
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
        const { imovel_id } = req.query;
        const matchStage = { status: 'aprovado' };

        const pipeline = [
            { $match: matchStage },
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
            // Filtro por imóvel e proprietário
            {
                $match: {
                    'dependencia.imovel_id': new mongoose.Types.ObjectId(imovel_id),
                    'created_by': req.user._id
                }
            },
            // Join com Tarefas para verificar o status no Kanban
            {
                $lookup: {
                    from: 'tarefas',
                    localField: '_id',
                    foreignField: 'orcamento_id',
                    as: 'tarefa'
                }
            },
            { $unwind: '$tarefa' },
            // Manter apenas orçamentos que ainda estão na coluna "Orçamento" (não iniciados)
            { $match: { 'tarefa.status': 'orcamento' } },
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
                            quantidade: '$quantidade',
                            valor_unitario: '$valor_unitario',
                            valor: '$valor',
                            arquivo_url: '$arquivo_url'
                        }
                    },
                    total: { $sum: '$valor' }
                }
            },
            { $sort: { fornecedor_nome: 1 } }
        ];

        const result = await Orcamento.aggregate(pipeline);
        res.json(result);
    } catch (error) {
        console.error('Erro no relatório por fornecedor:', error);
        res.status(500).json({ detail: error.message });
    }
});

// ===== DASHBOARD =====
router.get('/dashboard/stats', authenticate, requireApproved, async (req, res) => {
    try {
        const [totalImoveis, totalDeps, totalOrcs, totalTarefas] = await Promise.all([
            Imovel.countDocuments({ created_by: req.user._id }),
            Dependencia.countDocuments({ created_by: req.user._id }),
            Orcamento.countDocuments({ created_by: req.user._id }),
            Tarefa.countDocuments({ created_by: req.user._id }),
        ]);

        const valorTotal = await Orcamento.aggregate([
            { $match: { created_by: req.user._id } },
            { $group: { _id: null, total: { $sum: '$valor' } } }
        ]);

        const valorAprovado = await Orcamento.aggregate([
            { $match: { created_by: req.user._id, status: 'aprovado' } },
            { $group: { _id: null, total: { $sum: '$valor' } } }
        ]);

        const orcsPorStatus = await Orcamento.aggregate([
            { $match: { created_by: req.user._id } },
            { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$valor' } } }
        ]);

        const tarefasPorStatus = await Tarefa.aggregate([
            { $match: { created_by: req.user._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const parcelasStats = await Orcamento.aggregate([
            {
                $match: {
                    created_by: req.user._id,
                    status: 'aprovado',
                    'pagamento.parcelas': { $exists: true, $not: { $size: 0 } }
                }
            },
            { $unwind: '$pagamento.parcelas' },
            {
                $group: {
                    _id: '$pagamento.parcelas.pago',
                    total: { $sum: '$pagamento.parcelas.valor' }
                }
            }
        ]);

        const valorPago = parcelasStats.find(p => p._id === true)?.total || 0;
        const valorPendente = parcelasStats.find(p => p._id === false)?.total || 0;

        res.json({
            totais: {
                total_imoveis: totalImoveis,
                total_dependencias: totalDeps,
                total_orcamentos: totalOrcs,
                total_tarefas: totalTarefas,
                valor_total_orcamentos: valorTotal[0]?.total || 0,
                valor_total_aprovado: valorAprovado[0]?.total || 0,
                valor_pago: valorPago,
                valor_pendente: valorPendente,
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
            { $match: { created_by: req.user._id } },
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
            name: r.nome,
            imovel_id: r.imovel_id,
            total: r.total_orcamentos,
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
            { $match: { created_by: req.user._id } },
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
            name: r.nome,
            total: r.total_orcamentos,
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
            { $match: { created_by: req.user._id } },
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
            name: r.nome,
            total: r.total_orcamentos,
            total_aprovado: r.total_aprovado,
            count_total: r.count_total,
            count_aprovado: r.count_aprovado,
        })));
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

export default router;
