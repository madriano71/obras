/**
 * Página de Gerenciamento de Fornecedores
 */

import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Users, Phone, Mail, MapPin, Search } from 'lucide-react';
import { FornecedorModal } from '../components/FornecedorModal';

export function Fornecedores() {
    const [fornecedores, setFornecedores] = useState([]);
    const [itens, setItens] = useState([]); // Tipos de obra
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFornecedor, setEditingFornecedor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [fornRes, itensRes] = await Promise.all([
                api.get('/fornecedores'),
                api.get('/tipos-obra')
            ]);
            setFornecedores(fornRes.data);
            setItens(itensRes.data);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            toast.error('Erro ao carregar dados dos fornecedores');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(formData) {
        try {
            if (editingFornecedor) {
                await api.put(`/fornecedores/${editingFornecedor.id}`, formData);
                toast.success('Fornecedor atualizado com sucesso!');
            } else {
                await api.post('/fornecedores', formData);
                toast.success('Fornecedor cadastrado com sucesso!');
            }
            loadData();
        } catch (error) {
            console.error('Erro ao salvar fornecedor:', error);
            toast.error('Erro ao salvar fornecedor');
            throw error;
        }
    }

    async function handleDelete(id) {
        if (!confirm('Tem certeza que deseja deletar este fornecedor?')) return;

        try {
            await api.delete(`/fornecedores/${id}`);
            toast.success('Fornecedor deletado com sucesso');
            loadData();
        } catch (error) {
            console.error('Erro ao deletar fornecedor:', error);
            toast.error('Erro ao deletar fornecedor');
        }
    }

    function handleNew() {
        setEditingFornecedor(null);
        setIsModalOpen(true);
    }

    function handleEdit(fornecedor) {
        setEditingFornecedor(fornecedor);
        setIsModalOpen(true);
    }

    function handleCloseModal() {
        setIsModalOpen(false);
        setEditingFornecedor(null);
    }

    const filteredFornecedores = fornecedores.filter(f =>
        f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.contato.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="text-center py-12">Carregando fornecedores...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Fornecedores</h1>
                    <p className="text-slate-600 mt-1">
                        Gerencie os parceiros e profissionais da sua obra
                    </p>
                </div>
                <button
                    onClick={handleNew}
                    className="btn btn-primary flex items-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Novo Fornecedor</span>
                </button>
            </div>

            {/* Busca */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nome ou contato..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                />
            </div>

            {/* Grid de Fornecedores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFornecedores.length === 0 ? (
                    <div className="col-span-full card text-center py-12">
                        <Users size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-600">Nenhum fornecedor encontrado.</p>
                    </div>
                ) : (
                    filteredFornecedores.map(forn => (
                        <div key={forn.id} className="card hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                        {forn.nome.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 leading-tight">{forn.nome}</h3>
                                        <p className="text-sm text-slate-500">{forn.contato}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => handleEdit(forn)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                        title="Editar"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(forn.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                        title="Deletar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center text-slate-600 gap-2">
                                    <Phone size={14} />
                                    <span>{forn.telefone}</span>
                                </div>
                                {forn.email && (
                                    <div className="flex items-center text-slate-600 gap-2">
                                        <Mail size={14} />
                                        <span className="truncate">{forn.email}</span>
                                    </div>
                                )}
                                {forn.endereco?.cidade && (
                                    <div className="flex items-start text-slate-600 gap-2">
                                        <MapPin size={14} className="mt-1 flex-shrink-0" />
                                        <span>{forn.endereco.cidade} - {forn.endereco.estado}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Itens atendidos:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {forn.tipos_obra && forn.tipos_obra.length > 0 ? (
                                        forn.tipos_obra.map(tipoId => {
                                            const item = itens.find(i => i.id === tipoId);
                                            return (
                                                <span key={tipoId} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                                                    {item ? item.nome : 'Item não encontrado'}
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">Nenhum item associado</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <FornecedorModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                fornecedor={editingFornecedor}
            />
        </div>
    );
}
