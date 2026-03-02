/**
 * Modal para criar/editar imóvel
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function ImovelModal({ isOpen, onClose, onSave, imovel = null }) {
    const [formData, setFormData] = useState({
        tipo: 'casa',
        cliente: '',
        endereco: {
            rua: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: '',
        },
    });

    const [loading, setLoading] = useState(false);

    // Atualiza form quando imovel muda (para edição)
    useEffect(() => {
        if (imovel) {
            setFormData({
                tipo: imovel.tipo || 'casa',
                cliente: imovel.cliente || '',
                endereco: {
                    rua: imovel.endereco?.rua || '',
                    numero: imovel.endereco?.numero || '',
                    complemento: imovel.endereco?.complemento || '',
                    bairro: imovel.endereco?.bairro || '',
                    cidade: imovel.endereco?.cidade || '',
                    estado: imovel.endereco?.estado || '',
                    cep: imovel.endereco?.cep || '',
                },
            });
        } else {
            // Reset para criar novo
            setFormData({
                tipo: 'casa',
                cliente: '',
                endereco: {
                    rua: '',
                    numero: '',
                    complemento: '',
                    bairro: '',
                    cidade: '',
                    estado: '',
                    cep: '',
                },
            });
        }
    }, [imovel, isOpen]);

    function handleChange(e) {
        const { name, value } = e.target;

        if (name.startsWith('endereco.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                endereco: {
                    ...prev.endereco,
                    [field]: value,
                },
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            await onSave(formData);
            onClose();
            // Reset form
            setFormData({
                tipo: 'casa',
                cliente: '',
                endereco: {
                    rua: '',
                    numero: '',
                    complemento: '',
                    bairro: '',
                    cidade: '',
                    estado: '',
                    cep: '',
                },
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
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {imovel ? 'Editar Imóvel' : 'Novo Imóvel'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Tipo e Cliente */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="tipo" className="label">
                                Tipo de Imóvel
                            </label>
                            <select
                                id="tipo"
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                className="input"
                                required
                            >
                                <option value="casa">Casa</option>
                                <option value="apartamento">Apartamento</option>
                                <option value="comercial">Comercial</option>
                                <option value="terreno">Terreno</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="cliente" className="label">
                                Cliente
                            </label>
                            <input
                                id="cliente"
                                name="cliente"
                                type="text"
                                value={formData.cliente}
                                onChange={handleChange}
                                className="input"
                                placeholder="Nome do cliente"
                                required
                            />
                        </div>
                    </div>

                    {/* Endereço */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900">Endereço</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label htmlFor="rua" className="label">
                                    Rua
                                </label>
                                <input
                                    id="rua"
                                    name="endereco.rua"
                                    type="text"
                                    value={formData.endereco.rua}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Nome da rua"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="numero" className="label">
                                    Número
                                </label>
                                <input
                                    id="numero"
                                    name="endereco.numero"
                                    type="text"
                                    value={formData.endereco.numero}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="123"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="complemento" className="label">
                                    Complemento
                                </label>
                                <input
                                    id="complemento"
                                    name="endereco.complemento"
                                    type="text"
                                    value={formData.endereco.complemento}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Apto, Bloco, etc (opcional)"
                                />
                            </div>

                            <div>
                                <label htmlFor="bairro" className="label">
                                    Bairro
                                </label>
                                <input
                                    id="bairro"
                                    name="endereco.bairro"
                                    type="text"
                                    value={formData.endereco.bairro}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Nome do bairro"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="cidade" className="label">
                                    Cidade
                                </label>
                                <input
                                    id="cidade"
                                    name="endereco.cidade"
                                    type="text"
                                    value={formData.endereco.cidade}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Nome da cidade"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="estado" className="label">
                                    Estado
                                </label>
                                <input
                                    id="estado"
                                    name="endereco.estado"
                                    type="text"
                                    value={formData.endereco.estado}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="UF"
                                    maxLength={2}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="cep" className="label">
                                    CEP
                                </label>
                                <input
                                    id="cep"
                                    name="endereco.cep"
                                    type="text"
                                    value={formData.endereco.cep}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="00000-000"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botões */}
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
