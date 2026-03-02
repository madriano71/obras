/**
 * Modal para criar/editar orçamento
 */

import { useState, useEffect } from 'react';
import { X, Receipt, Building2, User, DollarSign, FileText } from 'lucide-react';
import api from '../services/api';

export function OrcamentoModal({ isOpen, onClose, onSave, imoveis, dependencias, fornecedores, itens, orcamento = null }) {
    const [formData, setFormData] = useState({
        dependencia_id: '',
        tipo_obra_id: '',
        fornecedor_id: '',
        descricao: '',
        valor: '',
        status: 'pendente'
    });

    const [loading, setLoading] = useState(false);

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
            setFile(null); // Reset file input on edit
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
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Preencha os detalhes abaixo</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <X size={24} />
                    </button>
                </div>

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
            </div>
        </div>
    );
}

