import { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Shield, CheckCircle } from 'lucide-react';

export function UserModal({ isOpen, onClose, onSave, user = null }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        is_admin: false,
        is_approved: false,
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '', // Senha vazia por padrão na edição
                is_admin: user.is_admin || false,
                is_approved: user.is_approved || false,
            });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                is_admin: false,
                is_approved: true, // Novos usuários criados pelo admin já podem vir aprovados
            });
        }
    }, [user, isOpen]);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            alert('Falha ao salvar usuário. Verifique se o email é único.');
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b bg-gray-50">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        {user ? 'Editar Usuário' : 'Novo Usuário'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-gray-200 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-1 mb-1">
                                <User className="w-4 h-4" /> Nome Completo
                            </label>
                            <input
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                                placeholder="João Silva"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-1 mb-1">
                                <Mail className="w-4 h-4" /> Email
                            </label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                                placeholder="joao@exemplo.com"
                                required
                                disabled={!!user} // Não permite mudar email de usuário existente para evitar conflitos
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-1 mb-1">
                                <Lock className="w-4 h-4" /> {user ? 'Nova Senha (opcional)' : 'Senha'}
                            </label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                                placeholder={user ? "Deixe em branco para não alterar" : "••••••••"}
                                required={!user}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 pt-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        name="is_admin"
                                        type="checkbox"
                                        checked={formData.is_admin}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition-colors ${formData.is_admin ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.is_admin ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                                <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
                                    <Shield className={`w-4 h-4 ${formData.is_admin ? 'text-blue-600' : 'text-gray-400'}`} />
                                    Administrador
                                </span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        name="is_approved"
                                        type="checkbox"
                                        checked={formData.is_approved}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition-colors ${formData.is_approved ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.is_approved ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                                <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
                                    <CheckCircle className={`w-4 h-4 ${formData.is_approved ? 'text-green-600' : 'text-gray-400'}`} />
                                    Aprovado
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors shadow-sm"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Processando...' : user ? 'Salvar Alterações' : 'Criar Usuário'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
