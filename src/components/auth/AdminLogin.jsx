import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Terminal, Lock, Loader2, ArrowRight } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../contexts/ToastContext';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { checkAuth } = useUser();
    const navigate = useNavigate();
    const toast = useToast();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await authAPI.login(email, password);
            await checkAuth();
            toast.popup('Authentication sequence accepted', 'success');
            navigate('/dashboard', { replace: true });
        } catch (error) {
            console.error('Login error:', error);
            // Vague error message for security
            toast.popup('Authentication failed. Connection terminated.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden selection:bg-cyan-500/30">
            {/* Background Grid */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', backgroundSize: '50px 50px' }}
                />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(6,182,212,0.15)] mb-4">
                        <ShieldAlert className="w-10 h-10 text-cyan-500" />
                    </div>
                    <div className="text-center space-y-1">
                        <h1 className="text-3xl font-black italic tracking-tighter text-white">SYSTEM<span className="text-cyan-500">OVERRIDE</span></h1>
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-600">Admin Control Terminal</p>
                    </div>
                </div>

                <div className="bg-[#0B1224]/80 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-cyan-500/70 mb-2 ml-1">Admin Identity</label>
                                <div className="relative">
                                    <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500/50" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                                        placeholder="admin@code-siege.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-cyan-500/70 mb-2 ml-1">Security Key</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500/50" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono tracking-widest"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative group overflow-hidden rounded-xl bg-cyan-600/10 border border-cyan-500/30 p-[1px] mt-8"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <div className="relative bg-cyan-950/50 backdrop-blur-sm px-6 py-3.5 rounded-xl flex items-center justify-center gap-3 transition-colors group-hover:bg-cyan-900/50">
                                {loading ? (
                                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                                ) : (
                                    <>
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 group-hover:text-cyan-300">Initiate Uplink</span>
                                        <ArrowRight className="w-4 h-4 text-cyan-500 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Unauthorized access is strictly prohibited.
                        <br />
                        All connection attempts are logged.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
