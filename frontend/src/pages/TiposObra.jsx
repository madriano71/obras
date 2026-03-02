/**
 * Página de Gerenciamento de Itens
 * CRUD de itens de serviços (marcenaria, elétrica, hidráulica, etc)
 */

import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Wrench } from 'lucide-react';
import { TipoObraModal } from '../components/TipoObraModal';

export function TiposObra() {
    const [tiposObra, setTiposObra] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTipo, setEditingTipo] = useState(null);

    useEffect(() => {
        loadTiposObra();
    }, []);

    async function loadTiposObra() {
        try {
            const response = await api.get('/tipos-obra');
            setTiposObra(response.data);
        } catch (error) {
            console.error('Erro ao carregar itens:', error);
            toast.error('Erro ao carregar itens');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(formData) {
        try {
            if (editingTipo) {
                await api.put(`/tipos-obra/${editingTipo.id}`, formData);
                toast.success('Item atualizado com sucesso!');
            } else {
                await api.post('/tipos-obra', formData);
                toast.success('Item cadastrado com sucesso!');
            }
            loadTiposObra();
        } catch (error) {
            console.error('Erro ao salvar item:', error);
            toast.error('Erro ao salvar item');
            throw error;
        }
    }

    async function handleDelete(id) {
        if (!confirm('Tem certeza que deseja deletar este item?')) return;

        try {
            await api.delete(`/tipos-obra/${id}`);
            toast.success('Item deletado com sucesso');
            loadTiposObra();
        } catch (error) {
            console.error('Erro ao deletar item:', error);
            toast.error('Erro ao deletar item');
        }
    }

    function handleNew() {
        setEditingTipo(null);
        setIsModalOpen(true);
    }

    function handleEdit(tipo) {
        setEditingTipo(tipo);
        setIsModalOpen(true);
    }

    function handleCloseModal() {
        setIsModalOpen(false);
        setEditingTipo(null);
    }

    if (loading) {
        return <div className="text-center py-12">Carregando...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Itens</h1>
                    <p className="text-slate-600 mt-1">
                        Gerencie os itens de serviços que podem ser realizados nas dependências
                    </p>
                </div>
                <button
                    onClick={handleNew}
                    className="btn btn-primary flex items-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Novo Item</span>
                </button>
            </div>

            {/* Exemplos Sugeridos */}
            {tiposObra.length === 0 && (
                <div className="card bg-blue-50 border-blue-200">
                    <div className="flex items-start space-x-3">
                        <Wrench className="text-blue-600 mt-1" size={20} />
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-2">Sugestões de Itens</h3>
                            <p className="text-sm text-blue-800 mb-3">
                                Aqui estão alguns exemplos comuns que você pode cadastrar:
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-700">
                                <div>• Marcenaria</div>
                                <div>• Elétrica</div>
                                <div>• Hidráulica</div>
                                <div>• Pintura</div>
                                <div>• Gesso</div>
                                <div>• Piso/Revestimento</div>
                                <div>• Bancada</div>
                                <div>• Iluminação</div>
                                <div>• Ar Condicionado</div>
                                <div>• Alvenaria</div>
                                <div>• Serralheria</div>
                                <div>• Vidraçaria</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lista de Itens */}
            <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                    Itens Cadastrados ({tiposObra.length})
                </h2>

                {tiposObra.length === 0 ? (
                    <div className="card text-center py-12">
                        <Wrench size={48} className="mx-auto text-slate-400 mb-4" />
                        <p className="text-slate-600">
                            Nenhum item cadastrado.
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                            Clique em "Novo Item" para começar.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tiposObra.map(tipo => (
                            <div key={tipo.id} className="card hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center space-x-2">
                                        <Wrench size={18} className="text-blue-600" />
                                        <h3 className="text-lg font-semibold text-slate-900">{tipo.nome}</h3>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(tipo)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tipo.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                {tipo.descricao && (
                                    <p className="text-sm text-slate-600 mb-2">{tipo.descricao}</p>
                                )}
                                {(tipo.marca || tipo.tamanho) && (
                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                                        {tipo.marca && (
                                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                                                Marca: {tipo.marca}
                                            </span>
                                        )}
                                        {tipo.tamanho && (
                                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                                                Tam: {tipo.tamanho}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <TipoObraModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                tipoObra={editingTipo}
            />
        </div>
    );
}
