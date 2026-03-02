/**
 * Página de Gerenciamento de Imóveis
 * CRUD simplificado de imóveis
 */

import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ImovelModal } from '../components/ImovelModal';

export function Imoveis() {
    const [imoveis, setImoveis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingImovel, setEditingImovel] = useState(null);

    useEffect(() => {
        loadImoveis();
    }, []);

    async function loadImoveis() {
        try {
            const response = await api.get('/imoveis');
            setImoveis(response.data);
        } catch (error) {
            console.error('Erro ao carregar imóveis:', error);
            toast.error('Erro ao carregar imóveis');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(formData) {
        try {
            if (editingImovel) {
                // Editar imóvel existente
                await api.put(`/imoveis/${editingImovel.id}`, formData);
                toast.success('Imóvel atualizado com sucesso!');
            } else {
                // Criar novo imóvel
                await api.post('/imoveis', formData);
                toast.success('Imóvel cadastrado com sucesso!');
            }
            loadImoveis();
        } catch (error) {
            console.error('Erro ao salvar imóvel:', error);
            toast.error('Erro ao salvar imóvel');
            throw error;
        }
    }

    async function handleDelete(id) {
        if (!confirm('Tem certeza que deseja deletar este imóvel?')) return;

        try {
            await api.delete(`/imoveis/${id}`);
            toast.success('Imóvel deletado com sucesso');
            loadImoveis();
        } catch (error) {
            console.error('Erro ao deletar imóvel:', error);
            toast.error('Erro ao deletar imóvel');
        }
    }

    function handleNew() {
        setEditingImovel(null);
        setIsModalOpen(true);
    }

    function handleEdit(imovel) {
        setEditingImovel(imovel);
        setIsModalOpen(true);
    }

    function handleCloseModal() {
        setIsModalOpen(false);
        setEditingImovel(null);
    }

    if (loading) {
        return <div className="text-center py-12">Carregando...</div>;
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Imóveis</h1>
                    <p className="text-slate-500 font-medium">Gerencie suas propriedades e projetos</p>
                </div>
                <button
                    onClick={handleNew}
                    className="btn btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
                >
                    <Plus size={20} />
                    <span>Novo Imóvel</span>
                </button>
            </div>

            {imoveis.length === 0 ? (
                <div className="card text-center py-20 bg-slate-50/50 border-dashed border-2">
                    <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Plus size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum imóvel cadastrado</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">Comece cadastrando seu primeiro imóvel para gerenciar os orçamentos da obra.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {imoveis.map(imovel => (
                        <div key={imovel.id} className="card group hover:-translate-y-1 transition-all duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider">
                                            {imovel.tipo}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight capitalize">
                                        {imovel.cliente}
                                    </h3>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(imovel)}
                                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(imovel.id)}
                                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-slate-50">
                                <div className="flex items-start gap-3">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest w-20 pt-1">Endereço</div>
                                    <div className="text-sm text-slate-600 font-medium">
                                        <p>{imovel.endereco.rua}, {imovel.endereco.numero}</p>
                                        <p>{imovel.endereco.bairro}</p>
                                        <p className="text-xs text-slate-400 mt-1">{imovel.endereco.cidade} - {imovel.endereco.estado}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest w-20">CEP</div>
                                    <div className="text-sm text-slate-500 font-semibold">{imovel.endereco.cep}</div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => handleEdit(imovel)}
                                    className="text-[10px] font-black uppercase tracking-wider text-blue-600 hover:underline"
                                >
                                    Ver Detalhes
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ImovelModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                imovel={editingImovel}
            />
        </div>
    );
}

