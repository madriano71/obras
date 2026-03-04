/**
 * Página de Login
 * Formulário de autenticação com tratamento de rate limiting
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('Iniciando login...');
            console.log('API URL:', import.meta.env.VITE_API_URL || '/api');
            await login(email, password);
            toast.success('Login realizado com sucesso!');
            navigate('/');
        } catch (error) {
            console.error('Erro detalhado no login:', error);
            if (error.response) {
                console.error('Dados da resposta:', error.response.data);
                console.error('Status da resposta:', error.response.status);
            } else if (error.request) {
                console.error('Nenhuma resposta recebida (Network/CORS error)');
            } else {
                console.error('Erro ao configurar requisição:', error.message);
            }
            const message = error.response?.data?.detail || 'Erro ao fazer login. Verifique o console do navegador para detalhes.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
            <div className="card max-w-md w-full mx-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Gerenciamento de Obras
                    </h1>
                    <p className="text-slate-600">
                        Entre com suas credenciais para acessar o sistema
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="label">
                            E-mail
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                            placeholder="seu@email.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="label">
                            Senha
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-600">
                    <p>Credenciais padrão do admin:</p>
                    <p className="font-mono mt-1">admin@admin.com / admin123</p>
                </div>
            </div>
        </div>
    );
}
