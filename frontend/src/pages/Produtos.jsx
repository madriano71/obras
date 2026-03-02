/**
 * Página de Lista de Compras (Produtos)
 * Exibe itens categorizados como eletrodomésticos, mobília, etc.
 */

import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import {
    Plus, ShoppingCart, Tv, Refrigerator, Bed,
    MoreHorizontal, CheckCircle2, Clock, Trash2, Edit
} from 'lucide-react';
import { TipoObraModal } from '../components/TipoObraModal';

const CATEGORIES = [
    { id: 'eletrodomestico', label: 'Eletrodomésticos', icon: Refrigerator },
    { id: 'mobilia', label: 'Mobília & Decoração', icon: Bed },
    { id: 'outros', label: 'Outros Produtos', icon: MoreHorizontal },
];

export function Produtos() {
    const [itens, setItens] = useState([]);
    const [orcamentos, setOrcamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [itensRes, orcRes] = await Promise.all([
                api.get('/tipos-obra'),
                api.get('/orcamentos')
            ]);

            // Filtra apenas itens que não são da categoria 'obra'
            setItens(itensRes.data.filter(i => i.categoria !== 'obra'));
            setOrcamentos(orcRes.data);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            toast.error('Erro ao carregar lista de produtos');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(formData) {
        try {
            if (editingItem) {
                await api.put(`/tipos-obra/${editingItem.id}`, formData);
                toast.success('Produto atualizado!');
            } else {
                await api.post('/tipos-obra', formData);
                toast.success('Produto adicionado à lista!');
            }
            loadData();
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            toast.error('Erro ao salvar produto');
            throw error;
        }
    }

    async function handleDelete(id) {
        if (!confirm('Remover este produto da lista?')) return;
        try {
            await api.delete(`/tipos-obra/${id}`);
            toast.success('Produto removido');
            loadData();
        } catch (error) {
            console.error('Erro ao deletar:', error);
            toast.error('Erro ao remover produto');
        }
    }

    function getItemStats(itemId) {
        const itemOrcs = orcamentos.filter(o => o.tipo_obra_id === itemId);
        const aprovado = itemOrcs.find(o => o.status === 'aprovado');

        if (aprovado) {
            return {
                status: 'comprado',
                valor: aprovado.valor,
                label: 'Escolhido'
            };
        }

        if (itemOrcs.length > 0) {
            const menorValor = Math.min(...itemOrcs.map(o => o.valor));
            return {
                status: 'cotando',
                valor: menorValor,
                label: `${itemOrcs.length} cotações`
            };
        }

        return {
            status: 'pendente',
            valor: null,
            label: 'Sem orçamento'
        };
    }

    if (loading) {
        return <div className="text-center py-12">Carregando lista de produtos...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Lista de Compras</h1>
                    <p className="text-slate-600">Gerencie os produtos e eletros para o apartamento</p>
                </div>
                <button
                    onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                    className="btn btn-primary flex items-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Adicionar Produto</span>
                </button>
            </div>

            {CATEGORIES.map(cat => {
                const catItens = itens.filter(i => i.categoria === cat.id);
                const Icon = cat.icon;

                return (
                    <div key={cat.id} className="space-y-4">
                        <div className="flex items-center space-x-2 pb-2 border-b">
                            <Icon size={20} className="text-blue-600" />
                            <h2 className="text-xl font-bold text-slate-800">{cat.label}</h2>
                            <span className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                {catItens.length}
                            </span>
                        </div>

                        {catItens.length === 0 ? (
                            <p className="text-sm text-slate-500 italic py-4">Nenhum item cadastrado nesta categoria.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {catItens.map(item => {
                                    const stats = getItemStats(item.id);
                                    return (
                                        <div key={item.id} className="card hover:shadow-md transition-all group">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{item.nome}</h3>
                                                    {(item.marca || item.tamanho) && (
                                                        <div className="flex flex-wrap gap-1 mt-1 mb-1">
                                                            {item.marca && (
                                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                                                    {item.marca}
                                                                </span>
                                                            )}
                                                            {item.tamanho && (
                                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                                                    {item.tamanho}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-slate-500 line-clamp-1">{item.descricao || 'Sem descrição'}</p>
                                                </div>
                                                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                                                        className="p-1 text-slate-400 hover:text-blue-600"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1 text-slate-400 hover:text-red-600"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-end mt-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1">
                                                        {stats.status === 'comprado' ? (
                                                            <CheckCircle2 size={14} className="text-emerald-500" />
                                                        ) : (
                                                            <Clock size={14} className="text-amber-500" />
                                                        )}
                                                        <span className={`text-[10px] uppercase font-bold ${stats.status === 'comprado' ? 'text-emerald-600' : 'text-amber-600'
                                                            }`}>
                                                            {stats.label}
                                                        </span>
                                                    </div>
                                                    <div className="text-lg font-black text-slate-900">
                                                        {stats.valor
                                                            ? `R$ ${stats.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                                            : '---'
                                                        }
                                                    </div>
                                                </div>
                                                <a
                                                    href="/orcamentos"
                                                    className="text-xs text-blue-600 hover:underline font-medium"
                                                >
                                                    Ver Orçamentos
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}

            <TipoObraModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                tipoObra={editingItem}
            />
        </div>
    );
}
