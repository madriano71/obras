/**
 * Modal para criar/editar orçamento
 */

import { useState, useEffect } from 'react';
import { X, Receipt, Building2, User, DollarSign, FileText, CheckCircle2, CreditCard, Calendar, Plus, Trash2, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export function OrcamentoModal({ isOpen, onClose, onSave, onUnapprove, imoveis, dependencias, fornecedores, itens, orcamento = null }) {
    const [formData, setFormData] = useState({
        dependencia_id: '',
        tipo_obra_id: '',
        fornecedor_id: '',
        descricao: '',
        valor: '',
        status: 'pendente'
    });

    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('geral'); // 'geral' ou 'pagamento'
    const [pagamento, setPagamento] = useState({
        metodo: 'pix',
        parcelas: []
    });
    const [grupoTotal, setGrupoTotal] = useState({ total: 0, count: 0 });

    const [file, setFile] = useState(null);

    // Atualiza form quando orçamento muda (para edição)
    useEffect(() => {
        if (orcamento) {
            setFormData({
                dependencia_id: orcamento.dependencia_id || '',
                tipo_obra_id: orcamento.tipo_obra_id || '',
                fornecedor_id: orcamento.fornecedor_id || '',
                descricao: orcamento.descricao || '',
                valor: orcamento.valor || '',
                status: orcamento.status || 'pendente'
            });
            setPagamento({
                metodo: orcamento.pagamento?.metodo || 'pix',
                parcelas: orcamento.pagamento?.parcelas || []
            });
            setFile(null); // Reset file input on edit
            setActiveTab('geral');
        } else {
            setFormData({
                dependencia_id: dependencias.length > 0 ? dependencias[0].id : '',
                tipo_obra_id: '',
                fornecedor_id: '',
                descricao: '',
                valor: '',
                status: 'pendente'
            });
            setFile(null);
        }
    }, [orcamento, isOpen, dependencias]);

    function handleChange(e) {
        const { name, value } = e.target;

        if (name === 'valor') {
            // Remove tudo que não é número
            const cleanValue = value.replace(/\D/g, '');
            // Converte para decimal (centavos)
            const decimalValue = cleanValue ? (parseInt(cleanValue) / 100).toFixed(2) : '';
            setFormData(prev => ({
                ...prev,
                [name]: decimalValue,
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleFileChange(e) {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    }

    // Formata o valor para exibição no input (Padrão Brasileiro)
    const formatCurrencyDisplay = (val) => {
        if (!val) return '';
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(val);
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            // Usa FormData para enviar arquivo
            const data = new FormData();
            data.append('dependencia_id', formData.dependencia_id);
            data.append('tipo_obra_id', formData.tipo_obra_id);
            data.append('fornecedor_id', formData.fornecedor_id);
            data.append('descricao', formData.descricao);
            data.append('valor', formData.valor);
            data.append('status', formData.status);

            if (file) {
                data.append('arquivo', file);
            }

            // Precisamos passar formData e não um objeto JSON simples
            await onSave(data);
            onClose();
        } catch (error) {
            console.error('Erro ao salvar:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handlePaymentSave() {
        setLoading(true);
        try {
            await api.patch(`/orcamentos/${orcamento.id}/pagamento`, pagamento);
            toast.success('Pagamento atualizado com sucesso');
            onSave(); // Trigger reload
            onClose();
        } catch (error) {
            console.error('Erro ao salvar pagamento:', error);
            toast.error('Erro ao salvar pagamento');
        } finally {
            setLoading(false);
        }
    }

    async function fetchGrupoTotal() {
        if (!orcamento?.id) return;
        try {
            const response = await api.get(`/orcamentos/${orcamento.id}/grupo-total`);
            setGrupoTotal({
                total: response.data.total_grupo,
                count: response.data.quantidade_itens
            });
        } catch (error) {
            console.error('Erro ao buscar total do grupo:', error);
        }
    }

    useEffect(() => {
        if (activeTab === 'pagamento' && orcamento?.status === 'aprovado') {
            fetchGrupoTotal();
        }
    }, [activeTab, orcamento]);

    function adicionarParcela() {
        const novaData = new Date();
        if (pagamento.parcelas.length > 0) {
            const ultimaData = new Date(pagamento.parcelas[pagamento.parcelas.length - 1].data_pagamento);
            novaData.setMonth(ultimaData.getMonth() + 1);
        }

        setPagamento(prev => ({
            ...prev,
            parcelas: [...prev.parcelas, {
                data_pagamento: novaData.toISOString().split('T')[0],
                valor: 0,
                pago: false
            }]
        }));
    }

    function removerParcela(index) {
        setPagamento(prev => ({
            ...prev,
            parcelas: prev.parcelas.filter((_, i) => i !== index)
        }));
    }

    function atualizarParcela(index, field, value) {
        setPagamento(prev => {
            const novas = [...prev.parcelas];
            novas[index] = { ...novas[index], [field]: value };
            return { ...prev, parcelas: novas };
        });
    }

    function gerarParcelasAutomaticas(num) {
        const valorTotal = grupoTotal.total || Number(formData.valor);
        const valorParcela = (valorTotal / num).toFixed(2);
        const novasParcelas = [];

        for (let i = 0; i < num; i++) {
            const data = new Date();
            data.setMonth(data.getMonth() + i);
            novasParcelas.push({
                data_pagamento: data.toISOString().split('T')[0],
                valor: valorParcela,
                pago: false
            });
        }

        setPagamento(prev => ({ ...prev, parcelas: novasParcelas }));
    }

    // Filtra itens baseados no fornecedor selecionado (opcional se quiser restringir)
    // Ou filtra fornecedores baseados no item selecionado
    const selectedItem = itens.find(i => i.id === formData.tipo_obra_id);
    const filteredFornecedores = fornecedores.filter(f =>
        !formData.tipo_obra_id || f.tipos_obra.includes(formData.tipo_obra_id)
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] overflow-y-auto flex justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full h-fit my-auto overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            {orcamento ? 'Editar Orçamento' : 'Novo Orçamento'}
                        </h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                            {activeTab === 'geral' ? 'Preencha os detalhes abaixo' : 'Gerencie o plano de pagamento'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {orcamento && orcamento.status === 'aprovado' && (
                    <div className="flex border-b border-slate-100 p-1 bg-slate-50/50">
                        <button
                            onClick={() => setActiveTab('geral')}
                            className={cn(
                                "flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-xl",
                                activeTab === 'geral' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Receipt size={16} />
                                <span>Geral</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('pagamento')}
                            className={cn(
                                "flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-xl",
                                activeTab === 'pagamento' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <CreditCard size={16} />
                                <span>Pagamento</span>
                            </div>
                        </button>
                    </div>
                )}

                {activeTab === 'geral' ? (
                    <form onSubmit={handleSubmit} className="p-8 space-y-5">
                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label htmlFor="dependencia_id" className="label">Dependência (Cômodo)</label>
                                <select
                                    id="dependencia_id"
                                    name="dependencia_id"
                                    value={formData.dependencia_id}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                >
                                    <option value="">Selecione uma dependência</option>
                                    {dependencias.map(dep => (
                                        <option key={dep.id} value={dep.id}>{dep.descricao || dep.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="tipo_obra_id" className="label">Item (Serviço)</label>
                                <select
                                    id="tipo_obra_id"
                                    name="tipo_obra_id"
                                    value={formData.tipo_obra_id}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                >
                                    <option value="">Selecione um item</option>
                                    {itens.map(item => (
                                        <option key={item.id} value={item.id}>{item.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="fornecedor_id" className="label">Fornecedor</label>
                                <select
                                    id="fornecedor_id"
                                    name="fornecedor_id"
                                    value={formData.fornecedor_id}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                >
                                    <option value="">Selecione um fornecedor</option>
                                    {filteredFornecedores.map(forn => (
                                        <option key={forn.id} value={forn.id}>{forn.nome}</option>
                                    ))}
                                </select>
                                {formData.tipo_obra_id && filteredFornecedores.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-2 font-medium bg-amber-50 p-2 rounded-lg border border-amber-100">Nenhum fornecedor cadastrado para este item.</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="valor" className="label">Valor do Orçamento</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold transition-colors group-focus-within:text-blue-500">R$</span>
                                    <input
                                        id="valor"
                                        name="valor"
                                        type="text"
                                        inputMode="numeric"
                                        value={formatCurrencyDisplay(formData.valor)}
                                        onChange={handleChange}
                                        className="input pl-12 text-lg font-black tracking-tight"
                                        placeholder="0,00"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="descricao" className="label">Descrição / Observações</label>
                                <textarea
                                    id="descricao"
                                    name="descricao"
                                    value={formData.descricao}
                                    onChange={handleChange}
                                    className="input min-h-[100px] resize-none"
                                    placeholder="Detalhes do que está incluso neste orçamento..."
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="arquivo" className="label flex items-center gap-2">
                                    <FileText size={16} />
                                    Anexo (Opcional)
                                </label>
                                <input
                                    id="arquivo"
                                    name="arquivo"
                                    type="file"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-slate-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-xs file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100
                                        cursor-pointer"
                                    accept="image/*,application/pdf"
                                />
                                {orcamento && orcamento.arquivo_url && !file && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        Arquivo atual: <a href={`http://localhost:3000/${orcamento.arquivo_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{orcamento.arquivo_nome}</a>
                                    </p>
                                )}
                            </div>

                            {orcamento && orcamento.status === 'aprovado' && (
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-sm">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-emerald-900 leading-tight">Orçamento Aprovado</p>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Aprovação confirmada</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer group">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (confirm('Tem certeza que deseja remover a aprovação deste orçamento? Isso removerá a tarefa vinculada do Kanban.')) {
                                                    onUnapprove(orcamento.id);
                                                    onClose();
                                                }
                                            }}
                                            className="btn bg-white hover:bg-red-50 text-red-600 border-red-100 text-[10px] py-1.5 px-3 h-auto min-h-0 font-black uppercase tracking-wider"
                                        >
                                            Remover Aprovação
                                        </button>
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-8 mt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-secondary"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary min-w-[140px]"
                                disabled={loading}
                            >
                                {loading ? 'Salvando...' : 'Salvar Orçamento'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="p-8 space-y-6">
                        <div className={cn(
                            "p-4 rounded-2xl border transition-all animate-in slide-in-from-top-2",
                            grupoTotal.count > 1
                                ? "bg-blue-50 border-blue-100"
                                : "bg-slate-50 border-slate-100"
                        )}>
                            <div className="flex gap-3">
                                <div className={cn(
                                    "p-2 rounded-xl h-fit",
                                    grupoTotal.count > 1 ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-500"
                                )}>
                                    <Receipt size={18} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className={cn(
                                            "text-sm font-black leading-tight",
                                            grupoTotal.count > 1 ? "text-blue-900" : "text-slate-700"
                                        )}>
                                            {grupoTotal.count > 1 ? 'Pagamento Agrupado' : 'Valor Total'}
                                        </p>
                                        <div className={cn(
                                            "text-lg font-black",
                                            grupoTotal.count > 1 ? "text-blue-800" : "text-slate-900"
                                        )}>
                                            R$ {formatCurrencyDisplay(grupoTotal.total || formData.valor)}
                                        </div>
                                    </div>
                                    {grupoTotal.count > 1 && (
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-1">
                                            Existem {grupoTotal.count} itens vinculados a este pagamento.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setPagamento(prev => ({ ...prev, metodo: 'pix' }))}
                                className={cn(
                                    "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                    pagamento.metodo === 'pix' ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-100 text-slate-400 hover:border-slate-200"
                                )}
                            >
                                <div className={cn("p-2 rounded-xl", pagamento.metodo === 'pix' ? "bg-blue-500 text-white" : "bg-slate-100")}>
                                    <CheckCircle size={20} />
                                </div>
                                <span className="font-black uppercase tracking-widest text-[10px]">Pagar com PIX</span>
                            </button>
                            <button
                                onClick={() => setPagamento(prev => ({ ...prev, metodo: 'cartao' }))}
                                className={cn(
                                    "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                    pagamento.metodo === 'cartao' ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-100 text-slate-400 hover:border-slate-200"
                                )}
                            >
                                <div className={cn("p-2 rounded-xl", pagamento.metodo === 'cartao' ? "bg-blue-500 text-white" : "bg-slate-100")}>
                                    <CreditCard size={20} />
                                </div>
                                <span className="font-black uppercase tracking-widest text-[10px]">Pagar com Cartão</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Parcelamento</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => gerarParcelasAutomaticas(3)}
                                        className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-lg"
                                    >
                                        3x auto
                                    </button>
                                    <button
                                        onClick={adicionarParcela}
                                        className="btn btn-secondary text-[10px] py-1.5 px-3 h-auto min-h-0 flex items-center gap-2"
                                    >
                                        <Plus size={14} />
                                        <span>Add Parcela</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {pagamento.parcelas.length === 0 ? (
                                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <Calendar size={32} className="mx-auto text-slate-300 mb-2" />
                                        <p className="text-xs text-slate-500 font-medium tracking-tight">Nenhuma parcela definida.</p>
                                    </div>
                                ) : (
                                    pagamento.parcelas.map((parc, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm animate-in slide-in-from-right-2 duration-300">
                                            <div className="flex-1">
                                                <input
                                                    type="date"
                                                    value={String(parc.data_pagamento).split('T')[0]}
                                                    onChange={(e) => atualizarParcela(idx, 'data_pagamento', e.target.value)}
                                                    className="w-full text-xs font-bold text-slate-900 border-none p-0 focus:ring-0"
                                                />
                                            </div>
                                            <div className="flex-[0.8] relative">
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">R$</span>
                                                <input
                                                    type="number"
                                                    value={parc.valor}
                                                    onChange={(e) => atualizarParcela(idx, 'valor', e.target.value)}
                                                    className="w-full text-xs font-black text-slate-900 border-none p-0 pl-4 focus:ring-0"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <button
                                                onClick={() => atualizarParcela(idx, 'pago', !parc.pago)}
                                                className={cn(
                                                    "p-2 rounded-xl transition-all",
                                                    parc.pago ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "bg-slate-100 text-slate-300 hover:bg-slate-200"
                                                )}
                                                title={parc.pago ? "Pagamento Realizado" : "Marcar como Pago"}
                                            >
                                                <CheckCircle size={16} />
                                            </button>
                                            <button
                                                onClick={() => removerParcela(idx)}
                                                className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-8 mt-4 border-t border-slate-100">
                            <button
                                onClick={onClose}
                                className="btn btn-secondary"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handlePaymentSave}
                                className="btn btn-primary min-w-[140px]"
                                disabled={loading}
                            >
                                {loading ? 'Salvando...' : 'Salvar Pagamento'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

