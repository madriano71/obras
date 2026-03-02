/**
 * Modal para criar/editar item
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function TipoObraModal({ isOpen, onClose, onSave, tipoObra = null }) {
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        categoria: 'obra',
        marca: '',
        tamanho: '',
    });

    const [loading, setLoading] = useState(false);

    // Atualiza form quando tipoObra muda (para edição)
    useEffect(() => {
        if (tipoObra) {
            setFormData({
                nome: tipoObra.nome || '',
                descricao: tipoObra.descricao || '',
                categoria: tipoObra.categoria || 'obra',
                marca: tipoObra.marca || '',
                tamanho: tipoObra.tamanho || '',
            });
        } else {
            setFormData({
                nome: '',
                descricao: '',
                categoria: 'obra',
                marca: '',
                tamanho: '',
            });
        }
    }, [tipoObra, isOpen]);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            await onSave(formData);
            onClose();
            setFormData({
                nome: '',
                descricao: '',
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
                        {tipoObra ? 'Editar Item' : 'Novo Item'}
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
                        <label htmlFor="nome" className="label">
                            Nome do Item
                        </label>
                        <input
                            id="nome"
                            name="nome"
                            type="text"
                            value={formData.nome}
                            onChange={handleChange}
                            className="input"
                            placeholder="Ex: Marcenaria, Elétrica, Hidráulica..."
                            required
                        />
                    </div>

                    {formData.categoria !== 'obra' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="marca" className="label">
                                    Marca / Modelo
                                </label>
                                <input
                                    id="marca"
                                    name="marca"
                                    type="text"
                                    value={formData.marca}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Ex: Samsung, LG, Tok&Stok"
                                />
                            </div>
                            <div>
                                <label htmlFor="tamanho" className="label">
                                    Tamanho / Medidas
                                </label>
                                <input
                                    id="tamanho"
                                    name="tamanho"
                                    type="text"
                                    value={formData.tamanho}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Ex: 500L, 2.00m, 110V"
                                />
                            </div>
                        </div>
                    )}

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
                            placeholder="Detalhes sobre este item..."
                        />
                    </div>

                    <div>
                        <label htmlFor="categoria" className="label">
                            Categoria
                        </label>
                        <select
                            id="categoria"
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleChange}
                            className="input"
                            required
                        >
                            <option value="obra">Obra / Serviço</option>
                            <option value="eletrodomestico">Eletrodoméstico</option>
                            <option value="mobilia">Mobília / Decoração</option>
                            <option value="outros">Outros</option>
                        </select>
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
