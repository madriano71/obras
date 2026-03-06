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

    // Formata o endereço para exibição, suportando tanto string quanto objeto
    const formatEndereco = (endereco) => {
        if (!endereco) return 'Endereço não informado';
        if (typeof endereco === 'string') return endereco;

        const { rua, numero, complemento, bairro, cidade, estado } = endereco;
        const partes = [
            rua && numero ? `${rua}, ${numero}` : rua || numero,
            complemento,
            bairro,
            cidade && estado ? `${cidade} - ${estado}` : cidade || estado
        ].filter(Boolean);

        return partes.join(', ') || 'Endereço incompleto';
    };

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

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Imóveis</h1>
                    <p className="text-slate-500 font-medium italic">Gerencie suas propriedades e projetos</p>
                </div>
                {!loading && (
                    <button
                        onClick={handleNew}
                        className="btn btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
                    >
                        <Plus size={20} />
                        <span>Novo Imóvel</span>
                    </button>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((it) => (
                        <div key={it} className="card animate-pulse bg-white/50 border-slate-100 min-h-[160px] flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                    ))}
                </div>
            ) : imoveis.length === 0 ? (
                <div className="card text-center py-20 bg-slate-50/50 border-dashed border-2">
                    <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Plus size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum imóvel cadastrado</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">Comece cadastrando seu primeiro imóvel para gerenciar os orçamentos da obra.</p>
                    <button
                        onClick={handleNew}
                        className="btn btn-secondary"
                    >
                        Criar Primeiro Imóvel
                    </button>
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
                                        {imovel.cliente || 'Sem Cliente'}
                                    </h3>
                                </div>
                                <div className="flex gap-1 opacity-100 transition-opacity">
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

                            <div className="space-y-3 pt-6 border-t border-slate-50 text-slate-600">
                                <p className="text-sm font-medium">{formatEndereco(imovel.endereco)}</p>
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

