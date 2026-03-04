/**
 * Página de Gerenciamento de Itens
 * CRUD de itens de serviços (marcenaria, elétrica, hidráulica, etc)
 */

import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configurações</h1>
                    <p className="text-slate-500 font-medium italic">Tipos de itens e serviços para orçamentos</p>
                </div>
                {!loading && (
                    <button
                        onClick={handleNew}
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        <Plus size={20} />
                        <span>Novo Tipo</span>
                    </button>
                )}
            </div>

            {loading ? (
                <div className="card animate-pulse bg-white/50 border-slate-100 min-h-[300px] flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tiposObra.map((tipo) => (
                        <div key={tipo.id} className="card group hover:shadow-lg transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Package size={24} />
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => handleEdit(tipo)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tipo.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900 leading-tight">
                                    {tipo.nome}
                                </h3>
                                <p className="text-slate-500 text-sm font-medium line-clamp-2">
                                    {tipo.descricao}
                                </p>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Categoria: {tipo.categoria || 'Geral'}
                                </div>
                            </div>
                        </div>
                    ))}

                    {tiposObra.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package size={40} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Nenhum tipo encontrado</h3>
                            <p className="text-slate-500">Comece cadastrando seu primeiro tipo de obra.</p>
                        </div>
                    )}
                </div>
            )}

            <TipoObraModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                tipo={editingTipo}
            />
        </div>
    );
}
