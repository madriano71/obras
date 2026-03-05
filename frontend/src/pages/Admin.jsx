import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserModal } from '../components/UserModal';
import {
    Users,
    UserPlus,
    UserMinus,
    Shield,
    ShieldOff,
    Trash2,
    RefreshCw,
    Search,
    Edit2,
    Plus,
    XCircle
} from 'lucide-react';
import { toast } from 'sonner';

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data);
            setError(null);
        } catch (err) {
            setError('Falha ao carregar usuários. Verifique se você é um administrador.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user = null) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleSaveUser = async (formData) => {
        try {
            if (selectedUser) {
                // Update
                const response = await api.put(`/users/${selectedUser.id}`, formData);
                setUsers(users.map(u => u.id === selectedUser.id ? response.data : u));
                toast.success('Usuário atualizado com sucesso!');
            } else {
                // Create
                const response = await api.post('/users', formData);
                setUsers([response.data, ...users]);
                toast.success('Usuário criado com sucesso!');
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            throw err; // UserModal handles the error display
        }
    };

    const handleToggleApproval = async (user) => {
        try {
            const updatedUser = await api.put(`/users/${user.id}`, {
                is_approved: !user.is_approved
            });
            setUsers(users.map(u => u.id === user.id ? updatedUser.data : u));
            toast.info(`Usuário ${user.is_approved ? 'desativado' : 'aprovado'}`);
        } catch (err) {
            toast.error('Erro ao atualizar status');
        }
    };

    const handleToggleAdmin = async (user) => {
        if (window.confirm(`Tem certeza que deseja alterar o status de Admin para ${user.name}?`)) {
            try {
                const updatedUser = await api.put(`/users/${user.id}`, {
                    is_admin: !user.is_admin
                });
                setUsers(users.map(u => u.id === user.id ? updatedUser.data : u));
                toast.info('Permissões alteradas');
            } catch (err) {
                toast.error('Erro ao atualizar privilégios');
            }
        }
    };

    const handleDeleteUser = async (user) => {
        if (window.confirm(`AVISO CRÍTICO: Você tem certeza que deseja EXCLUIR permanentemente o usuário ${user.name}? Esta ação não pode ser desfeita.`)) {
            try {
                await api.delete(`/users/${user.id}`);
                setUsers(users.filter(u => u.id !== user.id));
                toast.success('Usuário excluído');
            } catch (err) {
                toast.error('Erro ao excluir usuário');
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-lg font-medium">Carregando painel administrativo...</span>
        </div>
    );

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />
                        Gerenciamento de Usuários
                    </h1>
                    <p className="text-gray-600 mt-2">Aprove novos usuários e gerencie privilégios administrativos.</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-200 font-bold"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Usuário
                    </button>
                    <button
                        onClick={fetchUsers}
                        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl transition-colors border border-gray-300 font-bold shadow-sm"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm">
                    <div className="flex items-center">
                        <XCircle className="w-5 h-5 text-red-500 mr-2" />
                        <span className="text-red-700 font-medium">{error}</span>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-gray-500 font-bold">
                        Total: {filteredUsers.length}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100/50 text-gray-600 uppercase text-xs font-black tracking-wider">
                                <th className="px-6 py-4">Usuário</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Admin</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-blue-50/40 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800">{user.name}</span>
                                            <span className="text-sm text-gray-500 font-medium">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            {user.is_approved ? (
                                                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tighter bg-green-100 text-green-700 border border-green-200">
                                                    Ativo
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tighter bg-amber-100 text-amber-700 border border-amber-200 font-medium">
                                                    Pendente
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            {user.is_admin ? (
                                                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100">
                                                    <Shield size={14} className="fill-blue-700" />
                                                    <span className="text-[10px] font-black uppercase">Sim</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 font-medium text-xs">Não</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleOpenModal(user)}
                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Editar Perfil"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={() => handleToggleApproval(user)}
                                            className={`p-2 rounded-lg transition-all ${user.is_approved
                                                    ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                                                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                                }`}
                                            title={user.is_approved ? "Desativar" : "Aprovar"}
                                        >
                                            {user.is_approved ? <UserMinus className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                                        </button>

                                        <button
                                            onClick={() => handleToggleAdmin(user)}
                                            className={`p-2 rounded-lg transition-all ${user.is_admin
                                                    ? 'text-blue-600 hover:bg-blue-50'
                                                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                                }`}
                                            title={user.is_admin ? "Remover Admin" : "Tornar Admin"}
                                        >
                                            {user.is_admin ? <ShieldOff className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                                        </button>

                                        <button
                                            onClick={() => handleDeleteUser(user)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <p className="text-gray-400 italic font-medium">Nenhum usuário encontrado...</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveUser}
                user={selectedUser}
            />
        </div>
    );
};

export default Admin;
