import { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Download, User, MapPin, Package, Building2, Receipt } from 'lucide-react';
import { cn } from '../lib/utils';

export function RelatorioOrcamentos() {
    const [relatorio, setRelatorio] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRelatorio();
    }, []);

    async function loadRelatorio() {
        try {
            const response = await api.get('/orcamentos/relatorio-por-fornecedor');
            setRelatorio(response.data);
        } catch (error) {
            console.error('Erro ao carregar relatório:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="text-center py-12 text-slate-600 font-medium font-sans">Carregando relatório...</div>;
    }

    const valorTotalGeral = relatorio.reduce((acc, grupo) => acc + grupo.total, 0);

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Relatório de Orçamentos</h1>
                    <p className="text-slate-500 font-medium">Consolidado de orçamentos aprovados por fornecedor</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Investimento Total da Obra</span>
                    <div className="bg-slate-900 text-white px-6 py-2 rounded-2xl text-2xl font-black shadow-xl shadow-slate-200 ring-4 ring-slate-100">
                        R$ {valorTotalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {relatorio.length === 0 ? (
                <div className="card text-center py-20 bg-white/50 border-dashed border-2 flex flex-col items-center">
                    <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                        <FileText size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Sem orçamentos aprovados</h3>
                    <p className="text-slate-500 max-w-sm">Nenhum orçamento foi marcado como "Escolhido" ainda. Somente orçamentos aprovados aparecem neste relatório.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {relatorio.map((grupo) => (
                        <div key={grupo._id} className="card p-0 overflow-hidden border-none shadow-xl bg-white animate-in slide-in-from-bottom-4 duration-500">
                            {/* Cabeçalho do Grupo (Fornecedor) */}
                            <div className="bg-slate-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-white/10 text-white rounded-xl backdrop-blur-md">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-white tracking-tight uppercase leading-tight">{grupo.fornecedor_nome}</h2>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{grupo.orcamentos.length} ITENS APROVADOS</span>
                                            <span className="h-1 w-1 bg-slate-600 rounded-full" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">FORNECEDOR ID: {grupo._id.substring(grupo._id.length - 6)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block leading-none mb-0.5">Subtotal do Fornecedor</span>
                                        <span className="text-lg font-black text-emerald-400 tracking-tighter">
                                            R$ {grupo.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tabela de Itens */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-100">
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 w-1/4">Cômodo / Dependência</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 w-1/4">Item / Serviço</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Descrição Detalhada</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right w-[150px]">Valor</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center w-[80px]">Doc</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {grupo.orcamentos.map((orc) => (
                                            <tr key={orc.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                                                            <MapPin size={14} />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{orc.dependencia}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-100 text-slate-600 rounded-lg group-hover:scale-110 transition-transform">
                                                            <Package size={14} />
                                                        </div>
                                                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{orc.item}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-xs text-slate-500 font-medium italic line-clamp-2" title={orc.descricao}>
                                                        "{orc.descricao}"
                                                    </p>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <span className="text-base font-black text-slate-900 tabular-nums">
                                                        R$ {orc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    {orc.arquivo_url ? (
                                                        <a
                                                            href={`http://localhost:8000/${orc.arquivo_url}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex p-2 bg-slate-100 hover:bg-blue-600 text-slate-500 hover:text-white rounded-xl transition-all shadow-sm"
                                                            title="Ver Comprovante"
                                                        >
                                                            <Download size={16} />
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-slate-50/30">
                                            <td colSpan="3" className="px-6 py-4 text-right">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Fornecedor</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-xl font-black text-slate-900 border-t-2 border-slate-900 pt-1">
                                                    R$ {grupo.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
