import { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Download, User, Building2, Filter } from 'lucide-react';

export function RelatorioOrcamentos() {
    const [relatorio, setRelatorio] = useState([]);
    const [imoveis, setImoveis] = useState([]);
    const [selectedImovel, setSelectedImovel] = useState('');
    const [loading, setLoading] = useState(true);

    console.log('RelatorioOrcamentos v2 loaded');

    useEffect(() => {
        loadBaseData();
    }, []);

    useEffect(() => {
        if (selectedImovel) {
            loadRelatorio();
        }
    }, [selectedImovel]);

    async function loadBaseData() {
        try {
            const response = await api.get('/imoveis');
            setImoveis(response.data);
            if (response.data.length > 0) {
                setSelectedImovel(response.data[0].id);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Erro ao carregar imóveis:', error);
            setLoading(false);
        }
    }

    async function loadRelatorio() {
        setLoading(true);
        try {
            const response = await api.get('/orcamentos/relatorio-por-fornecedor', {
                params: { imovel_id: selectedImovel }
            });
            setRelatorio(response.data);
        } catch (error) {
            console.error('Erro ao carregar relatório:', error);
        } finally {
            setLoading(false);
        }
    }

    const valorTotalGeral = relatorio.reduce((acc, grupo) => acc + (grupo.total || 0), 0);

    const handleExportPDF = () => {
        window.print();
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        margin: 1.5cm;
                        size: A4;
                    }
                    nav, header, aside, .no-print, button, select, .filter-container {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        padding: 0 !important;
                    }
                    .main-content {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                    }
                    .card {
                        box-shadow: none !important;
                        border: 1px solid #e2e8f0 !important;
                        margin-bottom: 2rem !important;
                        page-break-inside: avoid;
                    }
                    .bg-slate-900 {
                        background-color: #0f172a !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .text-white {
                        color: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .bg-emerald-500\/20 {
                        background-color: #ecfdf5 !important;
                        border-color: #10b981 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .text-emerald-400 {
                        color: #059669 !important;
                    }
                    h1 {
                        font-size: 24pt !important;
                    }
                }
            `}} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Relatório de Orçamentos</h1>
                    <p className="text-slate-500 font-medium italic">Lista de compras: Apenas orçamentos aprovados e não iniciados</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleExportPDF}
                        disabled={loading || relatorio.length === 0}
                        className="no-print btn bg-white border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Download size={18} />
                        <span>Exportar PDF</span>
                    </button>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Investimento Total Aprovado</span>
                        <div className="bg-slate-900 text-white px-6 py-2 rounded-2xl text-2xl font-black shadow-xl whitespace-nowrap">
                            R$ {valorTotalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Seletor de Imóvel */}
            <div className="filter-container card bg-white/50 backdrop-blur-sm border-slate-200/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
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
                    <span>{relatorio.length} fornecedores com itens aprovados</span>
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
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Sem itens pendentes de compra</h3>
                    <p className="text-slate-500 max-w-sm">Nenhum orçamento aprovado foi encontrado para compra. Itens que já iniciaram no Kanban ou foram concluídos não aparecem aqui.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {relatorio.map((grupo) => (
                        <div key={grupo._id} className="card p-0 overflow-hidden border-none shadow-xl bg-white printable-card">
                            {/* Cabeçalho do Grupo (Fornecedor) */}
                            <div className="bg-slate-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-white/10 text-white rounded-xl no-print">
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
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Qtd</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Unitário</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center no-print">Doc</th>
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
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-sm font-medium text-slate-600">
                                                        {orc.quantidade || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-medium text-slate-600">
                                                        {orc.valor_unitario > 0 ? `R$ ${orc.valor_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-black text-slate-900">
                                                        R$ {orc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center no-print">
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
                                            <td colSpan="4" className="px-6 py-4 text-right font-black text-slate-400 text-[10px] uppercase tracking-widest">
                                                Total Fornecedor
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-base font-black text-slate-900 border-t-2 border-slate-900 pt-1">
                                                    R$ {grupo.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td className="no-print"></td>
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
