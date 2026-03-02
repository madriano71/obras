/**
 * Página de Dashboard
 * Exibe estatísticas e resumo das obras
 */

import { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building2, Layers, DollarSign, ListTodo, Receipt, Wrench } from 'lucide-react';
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
            setOrcamentosPorDependencia(depRes.data);
            setOrcamentosPorItem(itemRes.data);
            setOrcamentosPorFornecedor(fornRes.data);
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="text-center py-12">Carregando...</div>;
    }

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

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Imóveis', value: stats?.totais?.imoveis || 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Custo Escolhido', value: `R$ ${(stats?.totais?.valor_total_aprovado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Orçamentos Totais', value: stats?.totais?.orcamentos || 0, icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Tarefas', value: stats?.totais?.tarefas || 0, icon: ListTodo, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                    <div key={i} className="card group relative overflow-hidden">
                        <div className={cn("absolute -right-4 -top-4 w-24 h-24 opacity-10 transition-transform group-hover:scale-110", stat.color)}>
                            <stat.icon size={96} />
                        </div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className={cn("text-2xl font-black tracking-tighter", stat.color)}>{stat.value}</p>
                            </div>
                            <div className={cn("p-3 rounded-2xl", stat.bg)}>
                                <stat.icon className={stat.color} size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Valor Detalhado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-gradient-to-br from-emerald-500 to-teal-600 border-none relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
                    <div className="relative">
                        <h2 className="text-lg font-bold text-white/90 mb-1">Custo Total Escolhido</h2>
                        <p className="text-4xl font-black text-white tracking-tighter">
                            R$ {(stats?.totais?.valor_total_aprovado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-emerald-100 mt-2 font-medium italic opacity-80">* Soma apenas dos orçamentos marcados como "Escolhidos"</p>
                    </div>
                </div>
                <div className="card border-dashed border-2 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all">
                    <h2 className="text-lg font-bold text-slate-500 mb-1">Total de Todas as Cotações</h2>
                    <p className="text-4xl font-black text-slate-400 tracking-tighter">
                        R$ {(stats?.totais?.valor_total_orcamentos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 font-medium italic opacity-70">* Soma de todos os orçamentos cadastrados no sistema</p>
                </div>
            </div>

            {/* Gráficos e Detalhes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Orçamentos por Dependência */}
                <div className="card shadow-md">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Custo por Cômodo</h2>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gastos Aprovados</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                            <Layers size={20} />
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={orcamentosPorDependencia}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="nome" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Custo Escolhido']}
                            />
                            <Bar dataKey="total_aprovado" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Status das Cotações */}
                <div className="card shadow-md">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Status das Cotações</h2>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Volume Financeiro</p>
                        </div>
                        <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                            <Receipt size={20} />
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stats?.orcamentos_por_status || []}
                                dataKey="total"
                                nameKey="status"
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={8}
                                stroke="none"
                            >
                                {(stats?.orcamentos_por_status || []).map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.status === 'aprovado' ? '#10b981' : entry.status === 'rejeitado' ? '#cbd5e1' : '#f59e0b'}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Orçamentos por Item */}
                <div className="card shadow-md">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Custo por Item</h2>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Serviços e Materiais</p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                            <Wrench size={20} />
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={orcamentosPorItem} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" axisLine={false} tickLine={false} hide />
                            <YAxis dataKey="nome" type="category" width={100} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Total']}
                            />
                            <Bar dataKey="total_aprovado" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Info Card - Atividades */}
                <div className="card bg-slate-900 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16" />

                    <h2 className="text-2xl font-black mb-6 flex items-center gap-3 relative">
                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                            <Receipt size={24} className="text-emerald-400" />
                        </div>
                        Resumo de Atividades
                    </h2>

                    <div className="space-y-4 relative">
                        {[
                            { label: 'Orçamentos Escolhidos', value: stats?.orcamentos_por_status?.find(o => o.status === 'aprovado')?.count || 0, color: 'text-emerald-400', bg: 'bg-emerald-400' },
                            { label: 'Cotações Pendentes', value: stats?.orcamentos_por_status?.find(o => o.status === 'pendente')?.count || 0, color: 'text-amber-400', bg: 'bg-amber-400' },
                            { label: 'Média por Item', value: `R$ ${((stats?.totais?.valor_total_aprovado || 0) / (stats?.orcamentos_por_status?.find(o => o.status === 'aprovado')?.count || 1)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, color: 'text-white', bg: 'bg-slate-700' },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 transition-all hover:bg-white/10">
                                <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">{item.label}</span>
                                <span className={cn("font-black text-xl tracking-tight", item.color)}>{item.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/20 border-dashed rounded-2xl text-[11px] text-slate-400 font-medium leading-relaxed relative">
                        <p>O dashboard é alimentado automaticamente conforme você sinaliza os orçamentos como "Escolhidos" na página de <Link to="/orcamentos" className="text-emerald-400 hover:underline">Orçamentos</Link>.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

