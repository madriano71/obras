/**
 * Modal para criar/editar fornecedor
 */

import { useState, useEffect } from 'react';
import { X, Building2, User, Phone, Mail, FileText, MapPin } from 'lucide-react';
import api from '../services/api';

export function FornecedorModal({ isOpen, onClose, onSave, fornecedor = null }) {
    const [formData, setFormData] = useState({
        nome: '',
        contato: '',
        telefone: '',
        email: '',
        documento: '',
        tipos_obra: [],
        endereco: {
            rua: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: '',
        }
    });

    const [itensDisponiveis, setItensDisponiveis] = useState([]);
    const [loading, setLoading] = useState(false);

    // Carrega itens (tipos de obra) disponíveis
    useEffect(() => {
        async function loadItens() {
            try {
                const response = await api.get('/tipos-obra');
                setItensDisponiveis(response.data);
            } catch (error) {
                console.error('Erro ao carregar itens:', error);
            }
        }
        if (isOpen) {
            loadItens();
        }
    }, [isOpen]);

    // Atualiza form quando fornecedor muda (para edição)
    useEffect(() => {
        if (fornecedor) {
            setFormData({
                nome: fornecedor.nome || '',
                contato: fornecedor.contato || '',
                telefone: fornecedor.telefone || '',
                email: fornecedor.email || '',
                documento: fornecedor.documento || '',
                tipos_obra: fornecedor.tipos_obra || [],
                endereco: {
                    rua: fornecedor.endereco?.rua || '',
                    numero: fornecedor.endereco?.numero || '',
                    complemento: fornecedor.endereco?.complemento || '',
                    bairro: fornecedor.endereco?.bairro || '',
                    cidade: fornecedor.endereco?.cidade || '',
                    estado: fornecedor.endereco?.estado || '',
                    cep: fornecedor.endereco?.cep || '',
                }
            });
        } else {
            setFormData({
                nome: '',
                contato: '',
                telefone: '',
                email: '',
                documento: '',
                tipos_obra: [],
                endereco: {
                    rua: '',
                    numero: '',
                    complemento: '',
                    bairro: '',
                    cidade: '',
                    estado: '',
                    cep: '',
                }
            });
        }
    }, [fornecedor, isOpen]);

    function handleChange(e) {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    }

    function handleItemToggle(itemId) {
        setFormData(prev => {
            const isSelected = prev.tipos_obra.includes(itemId);
            return {
                ...prev,
                tipos_obra: isSelected
                    ? prev.tipos_obra.filter(id => id !== itemId)
                    : [...prev.tipos_obra, itemId]
            };
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Erro ao salvar:', error);
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] overflow-y-auto flex justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full h-fit my-auto">
                <div className="flex justify-between items-center p-6 border-b bg-white rounded-t-lg">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {fornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Informações Básicas */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                            <Building2 size={20} /> Informações Básicas
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="nome" className="label">Nome / Empresa</label>
                                <input
                                    id="nome"
                                    name="nome"
                                    type="text"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="documento" className="label">CPF / CNPJ</label>
                                <input
                                    id="documento"
                                    name="documento"
                                    type="text"
                                    value={formData.documento}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label htmlFor="contato" className="label">Nome do Contato</label>
                                <input
                                    id="contato"
                                    name="contato"
                                    type="text"
                                    value={formData.contato}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="telefone" className="label">Telefone</label>
                                <input
                                    id="telefone"
                                    name="telefone"
                                    type="text"
                                    value={formData.telefone}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="email" className="label">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Endereço */}
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                            <MapPin size={20} /> Endereço
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label htmlFor="endereco.rua" className="label">Rua</label>
                                <input
                                    id="endereco.rua"
                                    name="endereco.rua"
                                    type="text"
                                    value={formData.endereco.rua}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label htmlFor="endereco.numero" className="label">Número</label>
                                <input
                                    id="endereco.numero"
                                    name="endereco.numero"
                                    type="text"
                                    value={formData.endereco.numero}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label htmlFor="endereco.complemento" className="label">Complemento</label>
                                <input
                                    id="endereco.complemento"
                                    name="endereco.complemento"
                                    type="text"
                                    value={formData.endereco.complemento}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label htmlFor="endereco.bairro" className="label">Bairro</label>
                                <input
                                    id="endereco.bairro"
                                    name="endereco.bairro"
                                    type="text"
                                    value={formData.endereco.bairro}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label htmlFor="endereco.cep" className="label">CEP</label>
                                <input
                                    id="endereco.cep"
                                    name="endereco.cep"
                                    type="text"
                                    value={formData.endereco.cep}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="endereco.cidade" className="label">Cidade</label>
                                <input
                                    id="endereco.cidade"
                                    name="endereco.cidade"
                                    type="text"
                                    value={formData.endereco.cidade}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label htmlFor="endereco.estado" className="label">Estado (UF)</label>
                                <input
                                    id="endereco.estado"
                                    name="endereco.estado"
                                    type="text"
                                    value={formData.endereco.estado}
                                    onChange={handleChange}
                                    className="input"
                                    maxLength={2}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Itens Atendidos */}
                    <div className="space-y-4 pt-4 border-t">
                        <label className="text-lg font-semibold text-slate-700 block">
                            Itens Atendidos (Serviços)
                        </label>
                        {itensDisponiveis.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">
                                Nenhum item cadastrado. Cadastre itens primeiro.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-3 border border-slate-200 rounded-md">
                                {itensDisponiveis.map(item => (
                                    <label
                                        key={item.id}
                                        className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-2 rounded"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.tipos_obra.includes(item.id)}
                                            onChange={() => handleItemToggle(item.id)}
                                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-700">{item.nome}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t bg-white">
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
                            {loading ? 'Salvando...' : 'Salvar Fornecedor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
