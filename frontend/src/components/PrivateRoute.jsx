/**
 * Componente de Rota Privada
 * Protege rotas que requerem autenticação
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Clock } from 'lucide-react';

export function PrivateRoute({ children }) {
    const { user, loading, logout } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Autenticando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!user.is_approved) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="card max-w-md w-full text-center shadow-2xl border-none p-8 space-y-6">
                    <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto rotate-3">
                        <Clock size={40} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Aguardando Aprovação</h2>
                        <p className="text-slate-500 mt-3 font-medium">
                            Sua conta enviada para análise. <br />
                            <span className="text-slate-900 font-bold">Aguarde a liberação do administrador</span> para acessar o painel.
                        </p>
                    </div>

                    <div className="pt-4 space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="btn btn-primary w-full py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-200"
                        >
                            Verificar Agora
                        </button>
                        <button
                            onClick={logout}
                            className="btn btn-secondary w-full py-4 text-sm font-black uppercase tracking-widest"
                        >
                            Sair do Sistema
                        </button>
                    </div>

                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                        Obras App v2.0
                    </p>
                </div>
            </div>
        );
    }

    return children;
}
