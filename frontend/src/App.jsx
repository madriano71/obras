/**
 * Aplicação Principal
 * Configuração de rotas e providers
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Kanban } from './pages/Kanban';
import { Imoveis } from './pages/Imoveis';
import { Dependencias } from './pages/Dependencias';
import { TiposObra } from './pages/TiposObra';
import { Fornecedores } from './pages/Fornecedores';
import { Orcamentos } from './pages/Orcamentos';
import { Produtos } from './pages/Produtos';
import { RelatorioOrcamentos } from './pages/RelatorioOrcamentos';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Layout />
                            </PrivateRoute>
                        }
                    >
                        <Route index element={<Dashboard />} />
                        <Route path="kanban" element={<Kanban />} />
                        <Route path="imoveis" element={<Imoveis />} />
                        <Route path="dependencias" element={<Dependencias />} />
                        <Route path="tipos-obra" element={<TiposObra />} />
                        <Route path="fornecedores" element={<Fornecedores />} />
                        <Route path="orcamentos" element={<Orcamentos />} />
                        <Route path="relatorio-orcamentos" element={<RelatorioOrcamentos />} />
                        <Route path="produtos" element={<Produtos />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>

            <Toaster position="top-right" richColors />
        </AuthProvider>
    );
}

export default App;
