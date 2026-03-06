/**
 * Página de Dashboard
 * Exibe estatísticas e resumo das obras
 */

import { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building2, Layers, DollarSign, ListTodo, Receipt, Wrench, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function Dashboard() {
    const [stats, setStats] = useState(null);
    const [orcamentosPorDependencia, setOrcamentosPorDependencia] = useState([]);
    const [orcamentosPorItem, setOrcamentosPorItem] = useState([]);
    const [orcamentosPorFornecedor, setOrcamentosPorFornecedor] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    async function loadDashboardData() {
        try {
            const [statsRes, depRes, itemRes, fornRes] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/dashboard/orcamentos-por-dependencia'),
                api.get('/dashboard/orcamentos-por-item'),
                api.get('/dashboard/orcamentos-por-fornecedor'),
            ]);

            setStats(statsRes.data);

            // Normaliza as chaves para garantir compatibilidade entre versões do backend
            const normalize = (data) => data.map(item => ({
                name: item.name || item.nome || 'Outro',
                total: item.total || item.total_orcamentos || 0
            }));

            setOrcamentosPorDependencia(normalize(depRes.data));
            setOrcamentosPorItem(normalize(itemRes.data));
            setOrcamentosPorFornecedor(normalize(fornRes.data));
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="h-full flex flex-col space-y-8 pb-12">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-10 w-48 bg-slate-200 animate-pulse rounded-lg" />
                        <div className="h-4 w-64 bg-slate-100 animate-pulse rounded-lg" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="card h-32 bg-slate-50 border-slate-100 animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="card h-96 bg-slate-50 border-slate-100 animate-pulse" />
                    <div className="card h-96 bg-slate-50 border-slate-100 animate-pulse" />
                </div>
            </div>
        );
    }

    const cards = [
        { title: 'Total de Imóveis', value: stats?.totais?.total_imoveis || 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Dependências', value: stats?.totais?.total_dependencias || 0, icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { title: 'Custos Aprovados', value: `R$ ${(stats?.totais?.valor_total_aprovado || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { title: 'Tarefas Ativas', value: stats?.totais?.total_tarefas || 0, icon: ListTodo, color: 'text-slate-600', bg: 'bg-slate-50' },
    ];

    const kanbanCards = [
        { title: 'Orçamento', value: stats?.tarefas_por_status?.find(t => t.status === 'orcamento')?.count || 0, icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-50' },
        { title: 'Em Andamento', value: stats?.tarefas_por_status?.find(t => t.status === 'doing')?.count || 0, icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Concluído', value: stats?.tarefas_por_status?.find(t => t.status === 'done')?.count || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 font-medium">Visão geral e estatísticas da sua obra</p>
                </div>
                <div className="flex items-center space-x-2 bg-white/50 p-1.5 rounded-2xl border border-slate-200/60 shadow-sm backdrop-blur-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-2" />
                    <span className="text-xs font-bold text-slate-600 pr-3 uppercase tracking-wider">Sistema Ativo</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="card group hover:shadow-xl transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <div className={cn("p-3 rounded-2xl transition-colors", card.bg, card.color)}>
                                <card.icon size={24} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{card.title}</h3>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter mt-1">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Status do Kanban</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {kanbanCards.map((card, i) => (
                        <div key={i} className="card group hover:shadow-xl transition-all duration-300 border-l-4" style={{ borderLeftColor: card.color.includes('amber') ? '#f59e0b' : card.color.includes('blue') ? '#3b82f6' : '#10b981' }}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</h3>
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter mt-1">{card.value}</p>
                                </div>
                                <div className={cn("p-4 rounded-2xl", card.bg, card.color)}>
                                    <card.icon size={32} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Resumo Financeiro</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card group hover:shadow-xl transition-all duration-300 border-l-4 border-emerald-500 bg-emerald-50/10">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pago (Efetivado)</h3>
                                <p className="text-4xl font-black text-emerald-600 tracking-tighter mt-1">
                                    R$ {(stats?.totais?.valor_pago || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-600">
                                <CheckCircle size={32} />
                            </div>
                        </div>
                    </div>
                    <div className="card group hover:shadow-xl transition-all duration-300 border-l-4 border-amber-500 bg-amber-50/10">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pendente (Não Efetivado)</h3>
                                <p className="text-4xl font-black text-amber-600 tracking-tighter mt-1">
                                    R$ {(stats?.totais?.valor_pendente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-amber-100 text-amber-600">
                                <Clock size={32} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico de Custos por Dependência */}
                <div className="card">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Custos por Cômodo</h3>
                            <p className="text-sm text-slate-500 mt-0.5">Distribuição financeira por dependência</p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                            <Building2 size={20} />
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={orcamentosPorDependencia}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000) + 'k' : value}`} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Total']}
                                />
                                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Resumo de Status */}
                <div className="card bg-slate-900 text-white border-none shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        < DollarSign size={120} />
                    </div>
                    <div className="relative z-10 h-full flex flex-col text-white">
                        <div className="mb-8">
                            <h3 className="text-2xl font-black tracking-tight">Status Geral</h3>
                            <p className="text-slate-400 font-medium">Consolidado de orçamentos e custos</p>
                        </div>
                        <div className="flex-1 space-y-6">
                            {[
                                { label: 'Orçamentos Escolhidos', value: stats?.orcamentos_por_status?.find(o => o.status === 'aprovado')?.count || 0, color: 'text-emerald-400' },
                                { label: 'Cotações Pendentes', value: stats?.orcamentos_por_status?.find(o => o.status === 'pendente')?.count || 0, color: 'text-amber-400' },
                                { label: 'Média por Item', value: `R$ ${((stats?.totais?.valor_total_aprovado || 0) / (stats?.orcamentos_por_status?.find(o => o.status === 'aprovado')?.count || 1)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, color: 'text-white' },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 transition-all hover:bg-white/10">
                                    <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">{item.label}</span>
                                    <span className={cn("font-black text-xl tracking-tight", item.color)}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 p-4 bg-white/5 border border-white/10 border-dashed rounded-2xl text-[11px] text-slate-400 font-medium leading-relaxed">
                            <p>O dashboard é alimentado automaticamente conforme você sinaliza os orçamentos como "Escolhidos" na página de <Link to="/orcamentos" className="text-emerald-400 hover:underline">Orçamentos</Link>.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
