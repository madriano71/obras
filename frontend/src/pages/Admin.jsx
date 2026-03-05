import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Users,
    UserPlus,
    UserMinus,
    Shield,
    ShieldOff,
    CheckCircle,
    XCircle,
    Trash2,
    RefreshCw,
    Search
} from 'lucide-react';

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    const handleToggleApproval = async (user) => {
        try {
            const updatedUser = await api.put(`/users/${user.id}`, {
                is_approved: !user.is_approved
            });
            setUsers(users.map(u => u.id === user.id ? updatedUser.data : u));
        } catch (err) {
            alert('Erro ao atualizar status de aprovação');
        }
    };

    const handleToggleAdmin = async (user) => {
        if (window.confirm(`Tem certeza que deseja alterar o status de Admin para ${user.name}?`)) {
            try {
                const updatedUser = await api.put(`/users/${user.id}`, {
                    is_admin: !user.is_admin
                });
                setUsers(users.map(u => u.id === user.id ? updatedUser.data : u));
            } catch (err) {
                alert('Erro ao atualizar privilégios');
            }
        }
    };

    const handleDeleteUser = async (user) => {
        if (window.confirm(`AVISO CRÍTICO: Você tem certeza que deseja EXCLUIR permanentemente o usuário ${user.name}? Esta ação não pode ser desfeita.`)) {
            try {
                await api.delete(`/users/${user.id}`);
                setUsers(users.filter(u => u.id !== user.id));
            } catch (err) {
                alert('Erro ao excluir usuário');
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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />
                        Gerenciamento de Usuários
                    </h1>
                    <p className="text-gray-600 mt-2">Aprove novos usuários e gerencie privilégios administrativos.</p>
                </div>
                <button
                    onClick={fetchUsers}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-300"
                >
                    <RefreshCw className="w-4 h-4" />
                    Atualizar
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm">
                    <div className="flex items-center">
                        <XCircle className="w-5 h-5 text-red-500 mr-2" />
                        <span className="text-red-700 font-medium">{error}</span>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                        Total: {filteredUsers.length} usuários
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                                <th className="px-6 py-4">Usuário</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Admin</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-800">{user.name}</span>
                                            <span className="text-sm text-gray-500 italic">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            {user.is_approved ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm">
                                                    Aprovado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm">
                                                    Pendente
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            {user.is_admin ? (
                                                <Shield className="w-5 h-5 text-blue-600" title="Administrador" />
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2 opacity-80 group-hover:opacity-100">
                                        <button
                                            onClick={() => handleToggleApproval(user)}
                                            className={`p-2 rounded-lg transition-all ${user.is_approved
                                                    ? 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'
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
                                            title="Excluir Usuário"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500 italic">
                                        Nenhum usuário encontrado para sua busca.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-6 flex gap-4 text-sm text-gray-500 italic bg-blue-50 p-4 rounded-lg border border-blue-100">
                <CheckCircle className="w-5 h-5 text-blue-500 shrink-0" />
                <p>
                    <strong>Nota:</strong> Como administrador, você tem poder total sobre o acesso dos usuários ao sistema.
                    Usuários pendentes não podem logar no sistema até serem aprovados.
                </p>
            </div>
        </div>
    );
};

export default Admin;
