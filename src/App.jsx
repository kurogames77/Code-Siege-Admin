import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { ToastProvider } from './contexts/ToastContext';
import AdminLogin from './components/auth/AdminLogin';
import AdminPage from './pages/AdminPage';

// Protected Route Wrapper
const ProtectedAdminRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useUser();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center flex-col gap-4">
                <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                <p className="text-cyan-500 font-mono text-xs font-bold uppercase tracking-widest animate-pulse">Establishing Connection...</p>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

const App = () => {
    return (
        <ToastProvider>
            <UserProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<AdminLogin />} />
                        <Route 
                            path="/dashboard" 
                            element={
                                <ProtectedAdminRoute>
                                    <AdminPage />
                                </ProtectedAdminRoute>
                            } 
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </UserProvider>
        </ToastProvider>
    );
};

export default App;
