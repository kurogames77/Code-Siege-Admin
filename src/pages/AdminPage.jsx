import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { Sun, Moon, ShieldAlert, Clock } from 'lucide-react';
import useIdleTimer from '../hooks/useIdleTimer';

import AdminDashboard from '../components/admin/AdminDashboard';
import InstructorManagement from '../components/admin/InstructorManagement';
import InstructorApplications from '../components/admin/InstructorApplications';
import SystemLogs from '../components/admin/SystemLogs';
import StudentCodesManager from '../components/admin/StudentCodesManager';
import StudentManagement from '../components/admin/StudentManagement';
import GuestManagement from '../components/admin/GuestManagement';
import ManualPayments from '../components/admin/ManualPayments';

const AdminPage = () => {
    const { user, isAuthenticated, loading, logout } = useUser();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [theme, setTheme] = useState('dark');

    // ── 5-Minute Inactivity Auto-Logout ─────────────────────
    const { isWarning, secondsLeft, isTimedOut, resetTimer } = useIdleTimer();

    useEffect(() => {
        if (isTimedOut) {
            // Session expired due to inactivity — force logout
            logout().then(() => {
                navigate('/', { replace: true, state: { timedOut: true } });
            });
        }
    }, [isTimedOut]);

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

    if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-cyan-500">Loading Console...</div>;

    // Strict Access Control
    if (!isAuthenticated || user?.role !== 'admin') return null;

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <AdminDashboard theme={theme} />;
            case 'instructors':
                return <InstructorManagement theme={theme} />;
            case 'students':
                return <StudentManagement theme={theme} setActiveTab={setActiveTab} />;
            case 'applications':
                return <InstructorApplications theme={theme} />;
            case 'codes':
                return <StudentCodesManager theme={theme} />;
            case 'guests':
                return <GuestManagement theme={theme} />;
            case 'payments':
                return <ManualPayments theme={theme} />;
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

            {/* ── Idle Warning Modal ──────────────────────────────── */}
            <AnimatePresence>
                {isWarning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={`w-full max-w-md p-8 rounded-2xl border shadow-2xl text-center ${
                                theme === 'dark'
                                    ? 'bg-[#0B1224] border-amber-500/30 shadow-amber-500/10'
                                    : 'bg-white border-amber-300 shadow-amber-200/30'
                            }`}
                        >
                            {/* Pulsing icon */}
                            <div className="flex justify-center mb-5">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center animate-pulse ${
                                    theme === 'dark'
                                        ? 'bg-amber-500/10 border border-amber-500/30'
                                        : 'bg-amber-50 border border-amber-200'
                                }`}>
                                    <Clock className="w-8 h-8 text-amber-500" />
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className={`text-xl font-black uppercase italic tracking-tight mb-2 ${
                                theme === 'dark' ? 'text-white' : 'text-slate-900'
                            }`}>
                                Session <span className="text-amber-500">Expiring</span>
                            </h2>

                            {/* Description */}
                            <p className={`text-sm mb-6 ${
                                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                                You've been inactive. For security, your session will end automatically.
                            </p>

                            {/* Countdown */}
                            <div className={`text-5xl font-black tabular-nums mb-6 ${
                                secondsLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-amber-500'
                            }`}>
                                {secondsLeft}<span className="text-lg ml-1 opacity-60">s</span>
                            </div>

                            {/* Progress bar */}
                            <div className={`w-full h-1.5 rounded-full mb-6 overflow-hidden ${
                                theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'
                            }`}>
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                                        secondsLeft <= 10 ? 'bg-red-500' : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${(secondsLeft / 60) * 100}%` }}
                                />
                            </div>

                            {/* Stay Logged In button */}
                            <button
                                onClick={resetTimer}
                                className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <ShieldAlert className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                                Stay Logged In
                            </button>

                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-4 ${
                                theme === 'dark' ? 'text-cyan-500/40' : 'text-cyan-600/50'
                            }`}>
                                {'< SECURITY PROTOCOL ACTIVE >'}
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPage;
