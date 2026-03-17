import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

import AdminDashboard from '../components/admin/AdminDashboard';
import InstructorManagement from '../components/admin/InstructorManagement';
import InstructorApplications from '../components/admin/InstructorApplications';
import SystemLogs from '../components/admin/SystemLogs';
import StudentCodesManager from '../components/admin/StudentCodesManager';

const AdminPage = () => {
    const { user, isAuthenticated, loading } = useUser();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [theme, setTheme] = useState('dark');
    const [isDuplicateTab, setIsDuplicateTab] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                // Use setTimeout to allow child components (like InstructorSidebar) to handle 
                // intentional navigation (e.g. logout) before this forced redirect kicks in.
                const timer = setTimeout(() => {
                    navigate('/', { state: { openLogin: true } });
                }, 0);
                return () => clearTimeout(timer);
            } else if (user?.role !== 'admin') {
                navigate('/'); // Redirect unauthorized users to home
            }
        }
    }, [loading, isAuthenticated, user, navigate]);

    // Implementation of 1-Tab Policy using BroadcastChannel API
    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') return;

        const channel = new BroadcastChannel('admin_dashboard_channel');
        
        // Listen for messages on the channel
        channel.onmessage = (event) => {
            if (event.data === 'PING') {
                // If I am already open, tell the new tab that the dashboard is already active!
                if (!isDuplicateTab) {
                    channel.postMessage('PONG');
                }
            } else if (event.data === 'PONG') {
                // If I just pinged and received a PONG, someone else is the leader. I should block myself.
                setIsDuplicateTab(true);
            }
        };

        // Broadcast to see if any other tab is already managing the Dashboard
        channel.postMessage('PING');

        return () => {
            channel.close();
        };
    }, [isAuthenticated, user, isDuplicateTab]);

    if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-cyan-500">Loading Console...</div>;

    // Strict Access Control
    if (!isAuthenticated || user?.role !== 'admin') return null;

    if (isDuplicateTab) {
        return (
            <div className={`flex flex-col items-center justify-center h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
                <div className="p-10 max-w-xl text-center">
                    <div className="w-20 h-20 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <div className="text-4xl text-white">🛡️</div>
                    </div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-red-500">Duplicate Session Detected</h1>
                    <p className={`text-lg mb-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        For maximum security isolation, the Admin Control Portal can only be active in one tab at a time. Another secure session is already running.
                    </p>
                    <p className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-cyan-500/50' : 'text-cyan-600/50'}`}>
                        {`< FORCE FIREWALL ACTIVE >`}
                    </p>
                </div>
            </div>
        );
    }

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <AdminDashboard theme={theme} />;
            case 'instructors':
                return <InstructorManagement theme={theme} />;
            case 'applications':
                return <InstructorApplications theme={theme} />;
            case 'codes':
                return <StudentCodesManager theme={theme} />;
            case 'logs':
                return <SystemLogs theme={theme} />;
            case 'security':
                return (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-cyan-500/50">
                        <div className="text-4xl mb-4">🛡️</div>
                        <h3 className="text-xl font-black uppercase italic tracking-widest"> Security Protocols</h3>
                        <p className="text-xs font-bold uppercase tracking-widest mt-2">{`< FIREWALL ACTIVE >`}</p>
                    </div>
                );
            default:
                return <AdminDashboard theme={theme} />;
        }
    };

    return (
        <div className={`flex h-screen transition-colors duration-500 overflow-hidden relative selection:bg-cyan-500/30 ${theme === 'dark' ? 'bg-[#020617] text-white' : 'bg-slate-50 text-slate-900'}`}>
            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className={`absolute inset-0 transition-opacity duration-700 ${theme === 'dark' ? 'opacity-[0.03]' : 'opacity-[0.05]'}`}
                    style={{ backgroundImage: theme === 'dark' ? 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)' : 'radial-gradient(circle at 2px 2px, #06b6d4 1px, transparent 0)', backgroundSize: '50px 50px' }}
                />
            </div>

            {/* Sidebar */}
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
                {/* Header with Theme Toggle */}
                <header className={`h-20 flex items-center justify-end px-12 z-20 transition-colors duration-500 ${theme === 'dark' ? 'bg-transparent' : 'bg-white/50 backdrop-blur-md border-b border-slate-200'}`}>
                    <button
                        onClick={toggleTheme}
                        className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center group/theme ${theme === 'dark'
                            ? 'bg-slate-900 border-white/5 text-yellow-400 hover:border-yellow-400/50 hover:shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-cyan-500 hover:text-cyan-500 shadow-sm'
                            }`}
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-5 h-5 group-hover/theme:rotate-90 transition-transform duration-500" />
                        ) : (
                            <Moon className="w-5 h-5 group-hover/theme:-rotate-12 transition-transform duration-500" />
                        )}
                    </button>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AdminPage;
