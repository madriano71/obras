/**
 * Página de Gerenciamento de Dependências
 * Lista e gerencia dependências por imóvel
 */

import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { Plus, Trash2, Building2, Edit, RefreshCw } from 'lucide-react';
import { DependenciaModal } from '../components/DependenciaModal';

export function Dependencias() {
    const [dependencias, setDependencias] = useState([]);
    const [imoveis, setImoveis] = useState([]);
    const [selectedImovel, setSelectedImovel] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDependencia, setEditingDependencia] = useState(null);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        loadImoveis();
    }, []);

    useEffect(() => {
        if (selectedImovel) {
            loadDependencias();
        } else {
            setDependencias([]);
        }
    }, [selectedImovel]);

    async function loadImoveis() {
        try {
            const response = await api.get('/imoveis');
            setImoveis(response.data);
            if (response.data.length > 0) {
                setSelectedImovel(response.data[0].id);
            }
        } catch (error) {
            console.error('Erro ao carregar imóveis:', error);
            toast.error('Erro ao carregar imóveis');
        } finally {
            setLoading(false);
        }
    }

    async function loadDependencias() {
        try {
            const response = await api.get('/dependencias', {
                params: { imovel_id: selectedImovel }
            });
            setDependencias(response.data);
        } catch (error) {
            console.error('Erro ao carregar dependências:', error);
            toast.error('Erro ao carregar dependências');
        }
    }

    async function handleSave(formData) {
        try {
            if (editingDependencia) {
                await api.put(`/dependencias/${editingDependencia.id}`, formData);
                toast.success('Dependência atualizada com sucesso!');
            } else {
                await api.post('/dependencias', formData);
                toast.success('Dependência cadastrada com sucesso!');
            }
            loadDependencias();
            handleCloseModal(); // Close modal after save
        } catch (error) {
            console.error('Erro ao salvar dependência:', error);
            toast.error('Erro ao salvar dependência');
            throw error;
        }
    }

    function handleNew() {
        setEditingDependencia(null);
        setIsModalOpen(true);
    }

    function handleEdit(dependencia) {
        setEditingDependencia(dependencia);
        setIsModalOpen(true);
    }

    function handleCloseModal() {
        setIsModalOpen(false);
        setEditingDependencia(null);
    }

    async function handleDelete(id) {
        if (!confirm('Tem certeza que deseja deletar esta dependência?')) return;

        try {
            await api.delete(`/dependencias/${id}`);
            toast.success('Dependência deletada com sucesso');
            loadDependencias();
        } catch (error) {
            console.error('Erro ao deletar dependência:', error);
            toast.error('Erro ao deletar dependência');
        }
    }

    async function handleSyncProdutos() {
        setSyncing(true);
        try {
            const response = await api.post('/dependencias/sync-produtos');
            const { created_count } = response.data;
            if (created_count > 0) {
                toast.success(`${created_count} imóvel(is) atualizado(s) com a nova dependência.`);
                loadDependencias();
            } else {
                toast.info('Todos os imóveis já possuem a dependência "Produtos e Eletros".');
            }
        } catch (error) {
            console.error('Erro na sincronização:', error);
            toast.error('Erro ao sincronizar dependências');
        } finally {
            setSyncing(false);
        }
    }

    const currentImovel = imoveis.find(i => i.id === selectedImovel);

    if (loading) {
        return <div className="text-center py-12">Carregando...</div>;
    }

    if (imoveis.length === 0) {
        return (
            <div className="text-center py-12">
                <Building2 size={48} className="mx-auto text-slate-400 mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                    Nenhum imóvel cadastrado
                </h2>
                <p className="text-slate-600 mb-4">
                    Você precisa cadastrar um imóvel antes de adicionar dependências.
                </p>
                <a href="/imoveis" className="btn btn-primary">
                    Cadastrar Imóvel
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Dependências</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={handleSyncProdutos}
                        disabled={syncing}
                        className="btn btn-secondary flex items-center space-x-2"
                        title="Garantir que todos os imóveis tenham a dependência 'Produtos e Eletros'"
                    >
                        <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
                        <span>Sincronizar Padrão</span>
                    </button>
                    <button
                        onClick={handleNew}
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        <Plus size={20} />
                        <span>Nova Dependência</span>
                    </button>
                </div>
            </div>

            {/* Seletor de Imóvel */}
            <div className="card">
                <label htmlFor="imovel-select" className="label">
                    Selecione o Imóvel
                </label>
                <select
                    id="imovel-select"
                    value={selectedImovel}
                    onChange={(e) => setSelectedImovel(e.target.value)}
                    className="input"
                >
                    {imoveis.map(imovel => (
                        <option key={imovel.id} value={imovel.id}>
                            {imovel.tipo} - {imovel.cliente} ({imovel.endereco.rua}, {imovel.endereco.numero})
                        </option>
                    ))}
                </select>

                {currentImovel && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-semibold text-slate-900 mb-2">Detalhes do Imóvel</h3>
                        <div className="text-sm text-slate-600 space-y-1">
                            <p><strong>Tipo:</strong> {currentImovel.tipo}</p>
                            <p><strong>Cliente:</strong> {currentImovel.cliente}</p>
                            <p><strong>Endereço:</strong> {currentImovel.endereco.rua}, {currentImovel.endereco.numero} - {currentImovel.endereco.bairro}</p>
                            <p><strong>Cidade:</strong> {currentImovel.endereco.cidade} - {currentImovel.endereco.estado}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Lista de Dependências */}
            <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                    Dependências Cadastradas ({dependencias.length})
                </h2>

                {dependencias.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-slate-600">
                            Nenhuma dependência cadastrada para este imóvel.
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                            Clique em "Nova Dependência" para adicionar.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dependencias.map(dep => (
                            <div key={dep.id} className="card">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-slate-900">{dep.nome}</h3>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(dep)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dep.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                {dep.descricao && (
                                    <p className="text-sm text-slate-600">{dep.descricao}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <DependenciaModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                imoveis={imoveis}
                dependencia={editingDependencia}
            />
        </div>
    );
}
