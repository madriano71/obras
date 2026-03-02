/**
 * Modal para criar/editar dependência
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';

export function DependenciaModal({ isOpen, onClose, onSave, imoveis, dependencia = null }) {
    const [formData, setFormData] = useState({
        imovel_id: '',
        nome: '',
        descricao: '',
        tipos_obra: [],
    });

    const [tiposObraDisponiveis, setTiposObraDisponiveis] = useState([]);
    const [loading, setLoading] = useState(false);

    // Carrega itens disponíveis
    useEffect(() => {
        async function loadTiposObra() {
            try {
                const response = await api.get('/tipos-obra');
                setTiposObraDisponiveis(response.data);
            } catch (error) {
                console.error('Erro ao carregar itens:', error);
            }
        }
        if (isOpen) {
            loadTiposObra();
        }
    }, [isOpen]);

    // Atualiza form quando dependencia muda (para edição)
    useEffect(() => {
        if (dependencia) {
            setFormData({
                imovel_id: dependencia.imovel_id || '',
                nome: dependencia.nome || '',
                descricao: dependencia.descricao || '',
                tipos_obra: dependencia.tipos_obra || [],
            });
        } else {
            setFormData({
                imovel_id: '',
                nome: '',
                descricao: '',
                tipos_obra: [],
            });
        }
    }, [dependencia, isOpen]);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleTipoObraToggle(tipoId) {
        setFormData(prev => {
            const isSelected = prev.tipos_obra.includes(tipoId);
            return {
                ...prev,
                tipos_obra: isSelected
                    ? prev.tipos_obra.filter(id => id !== tipoId)
                    : [...prev.tipos_obra, tipoId]
            };
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            await onSave(formData);
            onClose();
            // Reset form
            setFormData({
                imovel_id: '',
                nome: '',
                descricao: '',
                tipos_obra: [],
            });
        } catch (error) {
            console.error('Erro ao salvar:', error);
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {dependencia ? 'Editar Dependência' : 'Nova Dependência'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="imovel_id" className="label">
                            Imóvel
                        </label>
                        <select
                            id="imovel_id"
                            name="imovel_id"
                            value={formData.imovel_id}
                            onChange={handleChange}
                            className="input"
                            required
                        >
                            <option value="">Selecione um imóvel</option>
                            {imoveis.map(imovel => (
                                <option key={imovel.id} value={imovel.id}>
                                    {imovel.tipo} - {imovel.cliente} ({imovel.endereco.rua}, {imovel.endereco.numero})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="nome" className="label">
                            Nome da Dependência
                        </label>
                        <select
                            id="nome"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            className="input"
                            required
                        >
                            <option value="">Selecione o tipo</option>
                            <option value="Sala">Sala</option>
                            <option value="Quarto">Quarto</option>
                            <option value="Suíte">Suíte</option>
                            <option value="Cozinha">Cozinha</option>
                            <option value="Banheiro">Banheiro</option>
                            <option value="Lavabo">Lavabo</option>
                            <option value="Área de Serviço">Área de Serviço</option>
                            <option value="Varanda">Varanda</option>
                            <option value="Garagem">Garagem</option>
                            <option value="Escritório">Escritório</option>
                            <option value="Despensa">Despensa</option>
                            <option value="Closet">Closet</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>

                    <div>
                        <label className="label mb-3">
                            Itens (selecione um ou mais)
                        </label>
                        {tiposObraDisponiveis.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">
                                Nenhum item cadastrado. Cadastre itens primeiro.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 border border-slate-200 rounded-md">
                                {tiposObraDisponiveis.map(tipo => (
                                    <label
                                        key={tipo.id}
                                        className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-2 rounded"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.tipos_obra.includes(tipo.id)}
                                            onChange={() => handleTipoObraToggle(tipo.id)}
                                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-700">{tipo.nome}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="descricao" className="label">
                            Descrição (opcional)
                        </label>
                        <textarea
                            id="descricao"
                            name="descricao"
                            value={formData.descricao}
                            onChange={handleChange}
                            className="input"
                            rows={3}
                            placeholder="Detalhes adicionais sobre a dependência..."
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
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
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
