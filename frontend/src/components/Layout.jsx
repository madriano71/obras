import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LogOut, Home, Building2, Users, Kanban,
    Layers, Wrench, Receipt, ShoppingCart, Menu, X, FileText
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    function handleLogout() {
        logout();
        navigate('/login');
    }

    const navigation = [
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'Imóveis', href: '/imoveis', icon: Building2 },
        { name: 'Dependências', href: '/dependencias', icon: Layers },
        { name: 'Itens', href: '/tipos-obra', icon: Wrench },
        { name: 'Fornecedores', href: '/fornecedores', icon: Users },
        { name: 'Orçamentos', href: '/orcamentos', icon: Receipt },
        { name: 'Produtos', href: '/produtos', icon: ShoppingCart },
        { name: 'Kanban', href: '/kanban', icon: Kanban },
    ];

    if (user?.is_admin) {
        navigation.push({ name: 'Usuários', href: '/users', icon: Users });
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[100px]" />
                <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-indigo-400/10 blur-[80px]" />
                <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] rounded-full bg-emerald-400/10 blur-[100px]" />
            </div>

            {/* Header */}
            <header className="glass sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-8">
                            <h1 className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Obras
                            </h1>

                            <nav className="hidden lg:flex space-x-1">
                                {navigation.map((item) => {
                                    const isActive = location.pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={cn(
                                                "flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                                                isActive
                                                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                                    : "text-slate-600 hover:bg-white/50 hover:text-blue-600"
                                            )}
                                        >
                                            <item.icon size={18} />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <span className="text-xs font-bold text-slate-800">{user?.name}</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{user?.role || 'Usuário'}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="hidden sm:flex items-center space-x-2 p-2 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                                title="Sair"
                            >
                                <LogOut size={20} />
                            </button>

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-white/50 transition-colors"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-white/90 backdrop-blur-xl border-t border-slate-100 animate-in slide-in-from-top duration-300">
                        <div className="px-4 pt-2 pb-6 space-y-1">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold transition-all",
                                            isActive
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                                : "text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        <item.icon size={20} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                            <div className="pt-4 mt-4 border-t border-slate-100">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-base font-semibold text-red-600 hover:bg-red-50 transition-all"
                                >
                                    <LogOut size={20} />
                                    <span>Sair da conta</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Outlet />
            </main>
        </div>
    );
}

