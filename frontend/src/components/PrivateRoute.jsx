/**
 * Componente de Rota Privada
 * Protege rotas que requerem autenticação
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Clock } from 'lucide-react';

export function PrivateRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!user.is_approved) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="card max-w-md text-center shadow-xl border-slate-200">
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Aguardando Aprovação</h2>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Sua conta foi criada com sucesso, mas ainda precisa ser <span className="font-bold text-slate-900">aprovada por um administrador</span> antes de acessar o sistema.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="btn btn-primary w-full shadow-lg shadow-blue-200"
                        >
                            Verificar Novamente
                        </button>
                        <button
                            onClick={logout}
                            className="btn btn-secondary w-full"
                        >
                            Sair da Conta
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return children;
}
