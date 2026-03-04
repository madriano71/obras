/**
 * Página de Gerenciamento de Orçamentos
 */

import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import {
    Plus, Receipt, Building2, Trash2, Edit,
    CheckCircle2, XCircle, Clock, Filter, Search,
    ArrowUpDown, FileText, LayoutGrid, Table as TableIcon
} from 'lucide-react';
import { OrcamentoModal } from '../components/OrcamentoModal';
import { cn } from '../lib/utils';

export function Orcamentos() {
    const [imoveis, setImoveis] = useState([]);
    const [selectedImovel, setSelectedImovel] = useState('');
    const [dependencias, setDependencias] = useState([]);
    const [fornecedores, setFornecedores] = useState([]);
    const [itens, setItens] = useState([]);
    const [orcamentos, setOrcamentos] = useState([]);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrcamento, setEditingOrcamento] = useState(null);
    const [viewMode, setViewMode] = useState('cards'); // 'cards' ou 'table'

    useEffect(() => {
        loadBaseData();
    }, []);

    useEffect(() => {
        if (selectedImovel) {
            loadOrcamentos();
            loadDependencias();
        }
    }, [selectedImovel]);

    async function loadBaseData() {
        try {
            const [imoveisRes, fornRes, itensRes] = await Promise.all([
                api.get('/imoveis'),
                api.get('/fornecedores'),
                api.get('/tipos-obra')
            ]);
            setImoveis(imoveisRes.data);
            setFornecedores(fornRes.data);
            setItens(itensRes.data);

            if (imoveisRes.data.length > 0) {
                setSelectedImovel(imoveisRes.data[0].id);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Erro ao carregar dados base:', error);
            toast.error('Erro ao carregar dados base');
            setLoading(false);
        }
    }

    async function loadDependencias() {
        try {
            const response = await api.get('/dependencias', {
                params: { imovel_id: selectedImovel }
            });
            setDependencias(response.data);
        } catch (error) {
            console.error('Erro ao carregar dependências:', error);
        }
    }

    async function loadOrcamentos() {
        try {
            const response = await api.get('/orcamentos');
            // Como a API de orçamentos não filtra por imóvel diretamente, filtramos no frontend
            // baseando-se nas dependências do imóvel selecionado
            setOrcamentos(response.data);
        } catch (error) {
            console.error('Erro ao carregar orçamentos:', error);
            toast.error('Erro ao carregar orçamentos');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(formData) {
        try {
            if (editingOrcamento) {
                await api.put(`/orcamentos/${editingOrcamento.id}`, formData);
                toast.success('Orçamento atualizado com sucesso!');
            } else {
                await api.post('/orcamentos', formData);
                toast.success('Orçamento cadastrado com sucesso!');
            }
            loadOrcamentos();
        } catch (error) {
            console.error('Erro ao salvar orçamento:', error);
            toast.error('Erro ao salvar orçamento');
            throw error;
        }
    }

    async function handleApprove(id) {
        if (!confirm('Ao aprovar este orçamento, todos os outros orçamentos para este mesmo item e cômodo serão rejeitados. Deseja continuar?')) return;

        try {
            await api.patch(`/orcamentos/${id}/aprovar`);
            toast.success('Orçamento escolhido com sucesso!');
            loadOrcamentos();
        } catch (error) {
            console.error('Erro ao aprovar orçamento:', error);
            toast.error('Erro ao aprovar orçamento');
        }
    }

    async function handleUnapprove(id) {
        try {
            await api.patch(`/orcamentos/${id}/desaprovar`);
            toast.success('Aprovação removida com sucesso');
            loadOrcamentos();
        } catch (error) {
            console.error('Erro ao desaprovar orçamento:', error);
            const detail = error.response?.data?.detail || 'Erro ao remover aprovação';
            toast.error(detail);
        }
    }

    async function handleDelete(id) {
        if (!confirm('Tem certeza que deseja deletar este orçamento?')) return;

        try {
            await api.delete(`/orcamentos/${id}`);
            toast.success('Orçamento removido');
            loadOrcamentos();
        } catch (error) {
            console.error('Erro ao deletar orçamento:', error);
            toast.error('Erro ao deletar orçamento');
        }
    }

    const currentImovelDeps = dependencias.map(d => d.id);
    const filteredOrcamentos = orcamentos.filter(o => currentImovelDeps.includes(o.dependencia_id));

    // Agrupa orçamentos por Dependência e Item para visualização comparativa
    const groupedOrcamentos = {};
    filteredOrcamentos.forEach(orc => {
        const key = `${orc.dependencia_id}-${orc.tipo_obra_id}`;
        if (!groupedOrcamentos[key]) {
            groupedOrcamentos[key] = [];
        }
        groupedOrcamentos[key].push(orc);
    });

    if (loading) {
        return <div className="text-center py-12 text-slate-600">Carregando orçamentos...</div>;
    }

    if (imoveis.length === 0) {
        return (
            <div className="text-center py-12">
                <Building2 size={48} className="mx-auto text-slate-400 mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Nenhum imóvel cadastrado</h2>
                <p className="text-slate-600 mb-4">Cadastre um imóvel antes de gerenciar orçamentos.</p>
                <a href="/imoveis" className="btn btn-primary">Ir para Imóveis</a>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Orçamentos</h1>
                    <p className="text-slate-500 font-medium">Compare e escolha os melhores fornecedores para sua obra</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                            onClick={() => setViewMode('cards')}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === 'cards' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                            title="Visualização em Cards"
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === 'table' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                            title="Visualização em Tabela"
                        >
                            <TableIcon size={20} />
                        </button>
                    </div>
                    <button
                        onClick={() => { setEditingOrcamento(null); setIsModalOpen(true); }}
                        className="btn btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
                    >
                        <Plus size={20} />
                        <span>Novo Orçamento</span>
                    </button>
                </div>
            </div>

            {/* Seletor de Imóvel */}
            <div className="card bg-white/50 backdrop-blur-sm border-slate-200/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Imóvel Selecionado</label>
                        <select
                            value={selectedImovel}
                            onChange={(e) => setSelectedImovel(e.target.value)}
                            className="bg-transparent border-none p-0 text-lg font-bold text-slate-900 focus:ring-0 cursor-pointer"
                        >
                            {imoveis.map(i => (
                                <option key={i.id} value={i.id}>{i.tipo} - {i.cliente}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium px-4 py-2 bg-slate-100/50 rounded-xl">
                    <Filter size={16} />
                    <span>{filteredOrcamentos.length} cotações encontradas</span>
                </div>
            </div>

            {/* Listagem de Orçamentos */}
            <div className="space-y-12">
                {Object.keys(groupedOrcamentos).length === 0 ? (
                    <div className="card text-center py-20 bg-slate-50/50 border-dashed border-2">
                        <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Receipt size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Sem orçamentos por aqui</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">Nenhum orçamento cadastrado para este imóvel. Comece adicionando uma nova cotação.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="btn btn-secondary mt-6"
                        >
                            Adicionar Primeiro Orçamento
                        </button>
                    </div>
                ) : viewMode === 'cards' ? (
                    Object.entries(groupedOrcamentos).map(([key, list]) => {
                        const dep = dependencias.find(d => d.id === list[0].dependencia_id);
                        const item = itens.find(i => i.id === list[0].tipo_obra_id);
                        const orcAprovado = list.find(o => o.status === 'aprovado');

                        return (
                            <div key={key} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-1 bg-blue-600 rounded-full" />
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider">{dep?.nome}</span>
                                                <span className="text-slate-300">/</span>
                                                <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider">{item?.categoria}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                                {item?.nome}
                                            </h3>
                                        </div>
                                    </div>
                                    {orcAprovado && (
                                        <div className="flex items-center bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider gap-2 shadow-sm shadow-emerald-100 border border-emerald-100">
                                            <CheckCircle2 size={16} />
                                            <span>Orçamento Finalizado</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {list.map(orc => {
                                        const forn = fornecedores.find(f => f.id === orc.fornecedor_id);
                                        const isAprovado = orc.status === 'aprovado';
                                        const isRejeitado = orc.status === 'rejeitado';

                                        return (
                                            <div
                                                key={orc.id}
                                                className={cn(
                                                    "glass-card group relative p-6 flex flex-col",
                                                    isAprovado ? "ring-2 ring-emerald-500 bg-emerald-50/80 border-emerald-200" :
                                                        isRejeitado ? "opacity-60 grayscale-[0.5]" : "hover:-translate-y-1"
                                                )}
                                            >
                                                {isAprovado && (
                                                    <div className="absolute top-0 right-12 bg-emerald-500 text-white px-3 py-1 text-[10px] font-black uppercase rounded-b-xl shadow-lg shadow-emerald-200">
                                                        Vencedor
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="max-w-[70%]">
                                                        <h4 className="font-black text-slate-900 text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                                            {forn?.nome}
                                                        </h4>
                                                        <p className="text-xs font-bold text-slate-400 truncate">{forn?.contato || 'Sem contato'}</p>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {orc.arquivo_url && (
                                                            <a
                                                                href={`http://localhost:8000/${orc.arquivo_url}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                                title={orc.arquivo_nome || 'Visualizar arquivo'}
                                                            >
                                                                <FileText size={16} />
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={() => { setEditingOrcamento(orc); setIsModalOpen(true); }}
                                                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(orc.id)}
                                                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mb-8 flex-grow">
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Investimento</div>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-sm font-black text-slate-400">R$</span>
                                                        <span className="text-3xl font-black text-slate-900 tracking-tighter">
                                                            {orc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                    <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                                        <p className="text-xs text-slate-600 font-medium italic line-clamp-3">
                                                            "{orc.descricao}"
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="pt-5 border-t border-slate-100 flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        {orc.status === 'pendente' && (
                                                            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                                                                <Clock size={12} />
                                                                <span>Pendente</span>
                                                            </div>
                                                        )}
                                                        {orc.status === 'aprovado' && (
                                                            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">
                                                                <CheckCircle2 size={12} />
                                                                <span>Aprovado</span>
                                                            </div>
                                                        )}
                                                        {orc.status === 'rejeitado' && (
                                                            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                                                <XCircle size={12} />
                                                                <span>Recusado</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {!isAprovado && (
                                                        <button
                                                            onClick={() => handleApprove(orc.id)}
                                                            className={cn(
                                                                "text-[10px] px-3 py-2 rounded-xl font-black uppercase tracking-wider transition-all shadow-sm active:scale-95",
                                                                isRejeitado
                                                                    ? 'bg-slate-100 text-slate-500 hover:bg-emerald-500 hover:text-white hover:shadow-emerald-200'
                                                                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100'
                                                            )}
                                                        >
                                                            {isRejeitado ? 'Reconsiderar' : 'Escolher este'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="card overflow-hidden border-none shadow-xl bg-white p-0">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900 text-white">
                                    <th className="px-6 py-4 text-sm font-black uppercase tracking-wider">Empresa / Fornecedor</th>
                                    <th className="px-6 py-4 text-sm font-black uppercase tracking-wider">Itens e Cômodos</th>
                                    <th className="px-6 py-4 text-sm font-black uppercase tracking-wider text-right">Valor Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {Object.entries(
                                    filteredOrcamentos.reduce((acc, orc) => {
                                        if (!acc[orc.fornecedor_id]) {
                                            acc[orc.fornecedor_id] = {
                                                fornecedor: fornecedores.find(f => f.id === orc.fornecedor_id),
                                                orcamentos: [],
                                                total: 0
                                            };
                                        }
                                        acc[orc.fornecedor_id].orcamentos.push(orc);
                                        acc[orc.fornecedor_id].total += orc.valor;
                                        return acc;
                                    }, {})
                                ).map(([fornId, data]) => (
                                    <tr key={fornId} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-6 vertical-top">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-tight">
                                                    {data.fornecedor?.nome}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400 mt-1">
                                                    {data.fornecedor?.contato || 'Sem contato'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="space-y-3">
                                                {data.orcamentos.map(orc => {
                                                    const dep = dependencias.find(d => d.id === orc.dependencia_id);
                                                    const item = itens.find(i => i.id === orc.tipo_obra_id);
                                                    return (
                                                        <div key={orc.id} className="flex justify-between items-center text-sm bg-slate-100/50 p-2 rounded-lg border border-slate-200/50">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-700">{dep?.descricao || dep?.nome}</span>
                                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item?.nome}</span>
                                                            </div>
                                                            <span className="font-black text-slate-900 whitespace-nowrap ml-4">
                                                                R$ {orc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Investimento Total</span>
                                                <span className="text-2xl font-black text-slate-900 tracking-tighter">
                                                    R$ {data.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>


            <OrcamentoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                onUnapprove={handleUnapprove}
                imoveis={imoveis}
                dependencias={dependencias}
                fornecedores={fornecedores}
                itens={itens}
                orcamento={editingOrcamento}
            />
        </div>
    );
}
