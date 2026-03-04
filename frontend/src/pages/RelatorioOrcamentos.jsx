import { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Download, User, MapPin, Package, RefreshCw } from 'lucide-react';

export function RelatorioOrcamentos() {
    const [relatorio, setRelatorio] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRelatorio();
    }, []);

    async function loadRelatorio() {
        setLoading(true);
        try {
            const response = await api.get('/orcamentos/relatorio-por-fornecedor');
            setRelatorio(response.data);
        } catch (error) {
            console.error('Erro ao carregar relatório:', error);
        } finally {
            setLoading(false);
        }
    }

    const valorTotalGeral = relatorio.reduce((acc, grupo) => acc + (grupo.total || 0), 0);

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Relatório de Orçamentos</h1>
                    <p className="text-slate-500 font-medium italic">Consolidado de orçamentos aprovados por fornecedor</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Investimento Total Aprovado</span>
                    <div className="bg-slate-900 text-white px-6 py-2 rounded-2xl text-2xl font-black shadow-xl whitespace-nowrap">
                        R$ {valorTotalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="card min-h-[400px] flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Preparando Relatório...</p>
                </div>
            ) : relatorio.length === 0 ? (
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
                        <div key={grupo._id} className="card p-0 overflow-hidden border-none shadow-xl bg-white">
                            {/* Cabeçalho do Grupo (Fornecedor) */}
                            <div className="bg-slate-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-white/10 text-white rounded-xl">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-white tracking-tight uppercase leading-tight">{grupo.fornecedor_nome}</h2>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{grupo.orcamentos.length} ITENS APROVADOS</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block leading-none mb-0.5 text-center">Subtotal Fornecedor</span>
                                    <span className="text-lg font-black text-emerald-400 tracking-tighter whitespace-nowrap">
                                        R$ {grupo.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            {/* Tabela de Itens */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-100">
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Dependência / Item</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Valor</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Doc</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {grupo.orcamentos.map((orc) => (
                                            <tr key={orc.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-blue-600 uppercase mb-0.5">{orc.dependencia}</span>
                                                        <span className="text-sm font-bold text-slate-800">{orc.item}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs text-slate-500 italic max-w-xs">{orc.descricao}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-black text-slate-900">
                                                        R$ {orc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {orc.arquivo_url ? (
                                                        <a
                                                            href={`http://localhost:8000/${orc.arquivo_url}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-slate-400 hover:text-blue-600 transition-colors"
                                                        >
                                                            <Download size={16} />
                                                        </a>
                                                    ) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-slate-50/30">
                                            <td colSpan="2" className="px-6 py-4 text-right font-black text-slate-400 text-[10px] uppercase tracking-widest">
                                                Total Fornecedor
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-base font-black text-slate-900 border-t-2 border-slate-900 pt-1">
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
