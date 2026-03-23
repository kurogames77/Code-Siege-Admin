import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Trash2, User, Calendar, Clock, Activity, Ban, AlertTriangle, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../../lib/supabase';

const GuestManagement = ({ theme = 'dark' }) => {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionMenu, setActionMenu] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [detailGuest, setDetailGuest] = useState(null);

    // Fetch real guest data from Supabase
    const fetchGuests = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('users')
                .select('id, username, email, student_code, role, level, xp, gems, is_banned, last_active_at, created_at, avatar_url')
                .eq('role', 'guest')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setGuests(data || []);
        } catch (err) {
            console.error('Failed to fetch guests:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuests();
    }, []);

    // Ban / Unban a guest
    const handleToggleBan = async (guest) => {
        try {
            const newBanStatus = !guest.is_banned;
            const { error: updateError } = await supabase
                .from('users')
                .update({ is_banned: newBanStatus })
                .eq('id', guest.id);

            if (updateError) throw updateError;

            setGuests(prev => prev.map(g =>
                g.id === guest.id ? { ...g, is_banned: newBanStatus } : g
            ));
            setConfirmAction(null);
            setActionMenu(null);
        } catch (err) {
            console.error('Failed to toggle ban:', err);
            alert(`Failed to ${guest.is_banned ? 'unban' : 'ban'} guest: ${err.message}`);
        }
    };

    // Delete a guest permanently
    const handleDelete = async (guest) => {
        try {
            const { error: deleteError } = await supabase
                .from('users')
                .delete()
                .eq('id', guest.id);

            if (deleteError) throw deleteError;

            setGuests(prev => prev.filter(g => g.id !== guest.id));
            setConfirmAction(null);
            setActionMenu(null);
        } catch (err) {
            console.error('Failed to delete guest:', err);
            alert(`Failed to delete guest: ${err.message}`);
        }
    };

    // Filtered guests
    const filteredGuests = guests.filter(guest => {
        const matchesSearch =
            (guest.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (guest.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (guest.id || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    const getGuestStatus = (guest) => {
        if (guest.is_banned) return 'banned';
        if (guest.last_active_at) {
            const lastActive = new Date(guest.last_active_at);
            const hoursSince = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60);
            return hoursSince < 1 ? 'online' : 'offline';
        }
        return 'offline';
    };

    // Stats
    const totalGuests = guests.length;
    const activeGuests = guests.filter(g => !g.is_banned).length;
    const bannedGuests = guests.filter(g => g.is_banned).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className={`text-2xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>GUEST MANAGEMENT</h2>
                    <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        System Visitors & Trial Accounts
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:w-72">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                        <input
                            type="text"
                            placeholder="Search guests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-9 pr-4 py-2 rounded-xl border outline-none transition-all text-sm font-medium ${
                                theme === 'dark'
                                    ? 'bg-[#0B1224] border-cyan-500/20 text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50'
                            }`}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Guests', value: totalGuests, icon: User, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                    { label: 'Active Guests', value: activeGuests, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                    { label: 'Banned Guests', value: bannedGuests, icon: Ban, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-xl border ${theme === 'dark' ? `bg-[#0B1224] ${stat.border}` : 'bg-white border-slate-100 shadow-sm'}`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                                <p className={`text-2xl font-black mt-1 font-mono ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                            </div>
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Error State */}
            {error && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${theme === 'dark' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">Failed to load guests: {error}</span>
                    <button onClick={fetchGuests} className="ml-auto text-xs font-bold uppercase tracking-widest underline">Retry</button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                        <p className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-cyan-500/60' : 'text-cyan-600'}`}>Loading Guest Data...</p>
                    </div>
                </div>
            )}

            {/* Main Table */}
            {!loading && (
                <div className={`border rounded-xl overflow-hidden shadow-sm ${theme === 'dark' ? 'bg-[#0B1224] border-cyan-500/20' : 'bg-white border-slate-200'}`}>
                    <style>{`
                        .guest-table-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
                        .guest-table-scroll::-webkit-scrollbar-track { background: ${theme === 'dark' ? '#0B1224' : '#f1f5f9'}; border-radius: 8px; }
                        .guest-table-scroll::-webkit-scrollbar-thumb { background: ${theme === 'dark' ? '#1e293b' : '#cbd5e1'}; border-radius: 8px; }
                        .guest-table-scroll::-webkit-scrollbar-thumb:hover { background: ${theme === 'dark' ? '#334155' : '#94a3b8'}; }
                    `}</style>
                    <div className="overflow-x-auto guest-table-scroll">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`border-b text-[10px] uppercase tracking-widest font-bold ${theme === 'dark' ? 'bg-cyan-950/20 border-cyan-500/20 text-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                    <th className="p-4 indent-2">Guest</th>
                                    <th className="p-4">Session Info</th>
                                    <th className="p-4 text-center">Stats</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredGuests.length > 0 ? (
                                    filteredGuests.map((guest, idx) => {
                                        const status = getGuestStatus(guest);
                                        return (
                                            <motion.tr
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                key={guest.id}
                                                className={`border-b last:border-0 transition-colors ${
                                                    theme === 'dark'
                                                        ? 'border-slate-800/50 hover:bg-white/[0.02]'
                                                        : 'border-slate-100 hover:bg-slate-50'
                                                } ${guest.is_banned ? 'opacity-60' : ''}`}
                                            >
                                                {/* Guest Identity */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                                                            theme === 'dark'
                                                                ? 'bg-slate-800 border-slate-700 text-slate-400'
                                                                : 'bg-slate-100 border-slate-200 text-slate-500'
                                                        }`}>
                                                            <User className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                                                {guest.username || 'Anonymous'}
                                                            </div>
                                                            <div className={`text-[10px] font-medium truncate max-w-[180px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                                                {guest.email || 'No email'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>


                                                {/* Session Info */}
                                                <td className="p-4">
                                                    <div className="space-y-1">
                                                        <div className={`flex items-center gap-1.5 text-xs font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                                            <Calendar className="w-3.5 h-3.5 opacity-70" /> Joined: {formatDate(guest.created_at)}
                                                        </div>
                                                        <div className={`flex items-center gap-1.5 text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                                            <Clock className="w-3.5 h-3.5 opacity-70" /> Last seen: {formatDate(guest.last_active_at)}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Stats */}
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-5">
                                                        <div className="flex flex-col items-center">
                                                            <div className={`font-black text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{guest.level || 1}</div>
                                                            <div className={`text-[9px] uppercase tracking-widest font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Level</div>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <div className={`font-black text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{guest.xp || 0}</div>
                                                            <div className={`text-[9px] uppercase tracking-widest font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>XP</div>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <div className={`font-black text-sm ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>{guest.gems || 0}</div>
                                                            <div className={`text-[9px] uppercase tracking-widest font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Gems</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="p-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-bold border ${
                                                        status === 'online'
                                                            ? (theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200')
                                                            : status === 'banned'
                                                            ? (theme === 'dark' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200')
                                                            : (theme === 'dark' ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200')
                                                    }`}>
                                                        {status}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="p-4 text-center relative">
                                                    <button
                                                        onClick={() => setActionMenu(actionMenu === guest.id ? null : guest.id)}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            theme === 'dark'
                                                                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                                                                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>

                                                    {/* Action Dropdown */}
                                                    <AnimatePresence>
                                                        {actionMenu === guest.id && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.95 }}
                                                                className={`absolute right-4 top-12 z-50 w-48 rounded-xl border shadow-xl overflow-hidden ${
                                                                    theme === 'dark' ? 'bg-[#0B1224] border-cyan-500/20' : 'bg-white border-slate-200'
                                                                }`}
                                                            >
                                                                <button
                                                                    onClick={() => { setDetailGuest(guest); setActionMenu(null); }}
                                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                                                                        theme === 'dark' ? 'text-cyan-400 hover:bg-cyan-500/10' : 'text-cyan-600 hover:bg-cyan-50'
                                                                    }`}
                                                                >
                                                                    <Eye className="w-4 h-4" /> View Details
                                                                </button>
                                                                <button
                                                                    onClick={() => { setConfirmAction({ type: 'ban', guest }); setActionMenu(null); }}
                                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                                                                        theme === 'dark' ? 'text-amber-400 hover:bg-amber-500/10' : 'text-amber-600 hover:bg-amber-50'
                                                                    }`}
                                                                >
                                                                    <Ban className="w-4 h-4" /> {guest.is_banned ? 'Unban Guest' : 'Ban Guest'}
                                                                </button>
                                                                <button
                                                                    onClick={() => { setConfirmAction({ type: 'delete', guest }); setActionMenu(null); }}
                                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                                                                        theme === 'dark' ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'
                                                                    }`}
                                                                >
                                                                    <Trash2 className="w-4 h-4" /> Delete Guest
                                                                </button>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center">
                                            <div className={`inline-flex flex-col items-center justify-center p-6 rounded-xl border border-dashed ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'}`}>
                                                <User className="w-8 h-8 mb-2 opacity-50" />
                                                <div className="font-bold text-sm">{guests.length === 0 ? 'No Guest Accounts' : 'No Guests Found'}</div>
                                                <div className="text-xs uppercase tracking-widest mt-1 opacity-70">
                                                    {guests.length === 0 ? 'No guests have registered yet' : 'Adjust search parameters'}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmAction && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`w-full max-w-sm p-6 rounded-2xl border shadow-xl ${theme === 'dark' ? 'bg-[#0B1224] border-cyan-500/20' : 'bg-white border-slate-200'}`}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className={`w-6 h-6 ${confirmAction.type === 'delete' ? 'text-red-500' : 'text-amber-500'}`} />
                                <h3 className={`text-lg font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                    {confirmAction.type === 'delete' ? 'Delete Guest?' : (confirmAction.guest.is_banned ? 'Unban Guest?' : 'Ban Guest?')}
                                </h3>
                            </div>

                            <p className={`mb-2 text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                {confirmAction.type === 'delete'
                                    ? 'This will permanently remove this guest account and all associated data. This action cannot be undone.'
                                    : confirmAction.guest.is_banned
                                    ? 'This will restore access for this guest account.'
                                    : 'This will block this guest from accessing the platform.'}
                            </p>
                            <p className={`mb-6 text-xs font-mono font-bold ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                                {confirmAction.guest.username || confirmAction.guest.email || confirmAction.guest.id}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmAction(null)}
                                    className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors ${theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => confirmAction.type === 'delete' ? handleDelete(confirmAction.guest) : handleToggleBan(confirmAction.guest)}
                                    className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 ${
                                        confirmAction.type === 'delete'
                                            ? 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20'
                                            : 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20'
                                    }`}
                                >
                                    {confirmAction.type === 'delete' ? 'Delete' : (confirmAction.guest.is_banned ? 'Unban' : 'Ban')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Detail Modal */}
            <AnimatePresence>
                {detailGuest && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`w-full max-w-md p-6 rounded-2xl border shadow-xl ${theme === 'dark' ? 'bg-[#0B1224] border-cyan-500/20' : 'bg-white border-slate-200'}`}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className={`text-lg font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Guest Details</h3>
                                <button onClick={() => setDetailGuest(null)} className={`p-1.5 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { label: 'User ID', value: detailGuest.id },
                                    { label: 'Username', value: detailGuest.username || 'N/A' },
                                    { label: 'Email', value: detailGuest.email || 'N/A' },

                                    { label: 'Level', value: detailGuest.level || 1 },
                                    { label: 'XP', value: detailGuest.xp || 0 },
                                    { label: 'Gems', value: detailGuest.gems || 0 },
                                    { label: 'Banned', value: detailGuest.is_banned ? 'Yes' : 'No' },
                                    { label: 'Joined', value: formatDate(detailGuest.created_at) },
                                    { label: 'Last Active', value: formatDate(detailGuest.last_active_at) },
                                ].map((row, i) => (
                                    <div key={i} className={`flex justify-between items-center py-2 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{row.label}</span>
                                        <span className={`text-sm font-bold font-mono max-w-[250px] truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{String(row.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Click outside to close action menu */}
            {actionMenu && (
                <div className="fixed inset-0 z-40" onClick={() => setActionMenu(null)} />
            )}
        </div>
    );
};

export default GuestManagement;
