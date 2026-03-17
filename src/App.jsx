import React, { useState, useEffect } from 'react';
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
    const [isDuplicateTab, setIsDuplicateTab] = useState(false);

    // Implementation of global 1-Tab Policy across the entire domain
    useEffect(() => {
        const channel = new BroadcastChannel('admin_global_channel');
        
        // Listen for messages on the channel
        channel.onmessage = (event) => {
            if (event.data === 'PING') {
                // If I am already open, tell the new tab that the portal is active!
                if (!isDuplicateTab) {
                    channel.postMessage('PONG');
                }
            } else if (event.data === 'PONG') {
                // If I just pinged and received a PONG, someone else is the leader. I block myself.
                setIsDuplicateTab(true);
            }
        };

        // Broadcast to see if any other tab is already managing the Portal
        channel.postMessage('PING');

        return () => {
            channel.close();
        };
    }, [isDuplicateTab]);

    if (isDuplicateTab) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#020617] text-slate-200">
                <div className="p-10 max-w-xl text-center">
                    <div className="w-20 h-20 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <div className="text-4xl text-white">🛡️</div>
                    </div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-red-500">Duplicate Session Detected</h1>
                    <p className="text-lg mb-8 text-slate-400">
                        For maximum security isolation, the Admin Control Portal can only be active in one tab at a time. Another secure session is already running.
                    </p>
                    <p className="text-xs font-bold uppercase tracking-widest text-cyan-500/50">
                        {`< FORCE FIREWALL ACTIVE >`}
                    </p>
                </div>
            </div>
        );
    }

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
