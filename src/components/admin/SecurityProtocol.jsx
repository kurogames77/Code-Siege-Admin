import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Loader2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { securityAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const SecurityProtocol = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isRecaptchaEnabled, setIsRecaptchaEnabled] = useState(true);
    const [stats, setStats] = useState([]);
    const toast = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [settingsRes, statsRes] = await Promise.all([
                securityAPI.getRecaptchaSettings(),
                securityAPI.getRecaptchaStats()
            ]);
            setIsRecaptchaEnabled(settingsRes.enabled);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Failed to fetch security data:', error);
            toast.popup('Failed to load security protocol data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggle = async () => {
        setSaving(true);
        try {
            const newState = !isRecaptchaEnabled;
            await securityAPI.updateRecaptchaSettings(newState);
            setIsRecaptchaEnabled(newState);
            toast.popup(`reCAPTCHA has been ${newState ? 'activated' : 'deactivated'}`, 'success');
        } catch (error) {
            console.error('Failed to update settings:', error);
            toast.popup('Failed to update security settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                <Loader2 className="animate-spin" size={48} />
                <p>Loading security protocols...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Shield className="text-indigo-400" size={32} />
                        Security Protocol
                    </h2>
                    <p className="text-slate-400">Manage authentication security and monitor access attempts.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-2"
                    disabled={loading}
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh Data
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Enforcement Toggle Card */}
                <div className="col-span-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        {isRecaptchaEnabled ? <Shield className="text-emerald-400" /> : <ShieldAlert className="text-rose-400" />}
                        reCAPTCHA Enforcement
                    </h3>
                    
                    <p className="text-slate-400 text-sm mb-6">
                        When activated, all users (including admins) must pass the Google reCAPTCHA v2 verification before they can log in to the system.
                    </p>

                    <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                        <div>
                            <div className="text-white font-medium">Status:</div>
                            <div className={`text-sm ${isRecaptchaEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isRecaptchaEnabled ? 'Active & Enforcing' : 'Deactivated'}
                            </div>
                        </div>

                        <button
                            onClick={handleToggle}
                            disabled={saving}
                            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 ${
                                isRecaptchaEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                            }`}
                        >
                            <span className="sr-only">Toggle reCAPTCHA</span>
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                    isRecaptchaEnabled ? 'translate-x-3' : '-translate-x-3'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Statistics Graph Card */}
                <div className="col-span-1 md:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl relative overflow-hidden group">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <BarChart className="text-blue-400" />
                        Verification Statistics
                    </h3>

                    {stats.length > 0 ? (
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={stats}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" allowDecimals={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                        itemStyle={{ color: '#e2e8f0' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="success" name="Successful" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="failed" name="Failed (Bots/Errors)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-slate-500 bg-slate-900/30 rounded-lg border border-slate-700/50 border-dashed">
                            No reCAPTCHA logs available yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity Table (Optional extension) */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl mt-6">
                <h3 className="text-xl font-semibold text-white mb-4">Summary by Role</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="p-3 text-slate-400 font-medium">User Role</th>
                                <th className="p-3 text-emerald-400 font-medium text-center">Successful Verifications</th>
                                <th className="p-3 text-rose-400 font-medium text-center">Failed Verifications</th>
                                <th className="p-3 text-slate-400 font-medium text-center">Total Attempts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.map((row) => (
                                <tr key={row.name} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                                    <td className="p-3 text-white font-medium">{row.name}</td>
                                    <td className="p-3 text-center text-slate-300">
                                        <div className="flex items-center justify-center gap-2">
                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                            {row.success}
                                        </div>
                                    </td>
                                    <td className="p-3 text-center text-slate-300">
                                        <div className="flex items-center justify-center gap-2">
                                            <XCircle size={16} className="text-rose-500" />
                                            {row.failed}
                                        </div>
                                    </td>
                                    <td className="p-3 text-center text-slate-400 font-bold">
                                        {row.success + row.failed}
                                    </td>
                                </tr>
                            ))}
                            {stats.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-6 text-center text-slate-500">
                                        Data will appear here once users attempt to log in.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SecurityProtocol;
