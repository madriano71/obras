/**
 * Context de Autenticação
 * Gerencia estado de autenticação e usuário logado
 */

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Carrega usuário ao iniciar
        loadUser();
    }, []);

    async function loadUser() {
        const token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    }

    async function login(email, password) {
        const response = await api.post('/auth/login', { email, password });
        const { access_token } = response.data;

        localStorage.setItem('token', access_token);
        await loadUser();

        return response.data;
    }

    function logout() {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}
