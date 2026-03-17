import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, MoreVertical, FileText, Mail, User, Calendar, Ban, Edit2, Shield, Trash2, Info, BookOpen, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { instructorAPI } from '../../services/api';

const InstructorManagement = ({ theme = 'dark' }) => {

    // Live Data for Users
    const [instructors, setInstructors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [instructorSearch, setInstructorSearch] = useState('');

    // Modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            // Fetch users (instructors & admin)
            const response = await instructorAPI.getUsers(1, 1000);
            if (response.users) {
                const filteredInstructors = response.users
                    .filter(u => u.role === 'instructor' || u.role === 'admin')
                    .map(u => ({
                        id: u.id,
                        name: u.username,
                        email: u.email,
                        instructorId: u.student_id || 'N/A',
                        languages: u.enrolled_language || '',
                        towers: u.handled_towers || '',
                        status: u.is_banned ? 'inactive' : 'active',
                        avatar: u.avatar_url
                    }));
                setInstructors(filteredInstructors);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeactivateUser = async (id, currentStatus, type) => {
        const isBanned = currentStatus === 'active';
        const action = isBanned ? 'deactivate' : 'reactivate';

        if (window.confirm(`Are you sure you want to ${action} this ${type} account?`)) {
            try {
                await instructorAPI.banUser(id, isBanned);
                fetchUsers(); // Refresh list
            } catch (error) {
                console.error('Failed to update ban status:', error);
                alert('Failed to update account status');
            }
        }
    };

    const handleDeleteUser = async (id, type) => {
        if (window.confirm(`Are you sure you want to PERMANENTLY delete this ${type} account? This cannot be undone.`)) {
            try {
                await instructorAPI.deleteUser(id);
                fetchUsers(); // Refresh list
            } catch (error) {
                console.error('Failed to delete user:', error);
                alert(`Failed to delete ${type} account`);
            }
        }
    };

    // --- Instructor Handlers ---
    const handleUpdateInstructor = (instructor) => {
        setEditingInstructor(instructor);
        setIsEditModalOpen(true);
    };

    const handleSaveInstructorUpdate = async (e) => {
        e.preventDefault();
        try {
            await instructorAPI.updateUser(editingInstructor.id, {
                username: editingInstructor.name,
                student_id: editingInstructor.instructorId,
                enrolled_language: editingInstructor.languages,
                handled_towers: editingInstructor.towers
            });
            setIsEditModalOpen(false);
            fetchUsers(); 
        } catch (error) {
            console.error('Failed to update user:', error);
            alert('Failed to update instructor details');
        }
    };

    const filteredInstructors = instructors.filter(i =>
        i.name.toLowerCase().includes(instructorSearch.toLowerCase()) ||
        i.email.toLowerCase().includes(instructorSearch.toLowerCase()) ||
        i.instructorId.toLowerCase().includes(instructorSearch.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return theme === 'dark' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'rejected': return theme === 'dark' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-rose-600 bg-rose-50 border-rose-200';
            case 'active': return theme === 'dark' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' : 'text-cyan-600 bg-cyan-50 border-cyan-200';
            case 'inactive': return theme === 'dark' ? 'text-slate-400 bg-slate-500/10 border-slate-500/20' : 'text-slate-500 bg-slate-50 border-slate-200';
            default: return theme === 'dark' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-amber-600 bg-amber-50 border-amber-200';
        }
    };

    const scrollbarStyles = `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.5); }
    `;

    return (
        <div className="flex flex-col h-full gap-8 overflow-y-auto overflow-x-hidden custom-scrollbar pb-10 pr-2">
            <style>{scrollbarStyles}</style>
            
            {/* ACTIVE INSTRUCTORS */}
            <div className={`flex flex-col flex-1 border rounded-2xl p-6 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0B1224] border-cyan-500/20' : 'bg-white border-slate-200'}`}>
                    <div className="mb-6 flex-none">
                        <h2 className={`text-xl font-black uppercase italic tracking-tighter flex items-center gap-2 mb-4 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            Instructor <span className="text-cyan-500">Management</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full not-italic tracking-normal transition-colors duration-500 ${theme === 'dark' ? 'text-slate-500 bg-slate-800' : 'text-slate-400 bg-slate-100'}`}>{instructors.filter(i => i.status === 'active').length} Active</span>
                        </h2>
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search instructors..."
                                value={instructorSearch}
                                onChange={(e) => setInstructorSearch(e.target.value)}
                                className={`w-full border rounded-lg pl-9 pr-4 py-3 text-sm focus:border-cyan-500/50 outline-none transition-all duration-500 ${theme === 'dark' ? 'bg-slate-950/50 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        <AnimatePresence mode="popLayout">
                            {filteredInstructors.map((instructor) => (
                                <motion.div
                                    key={instructor.id}
                                    layout
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className={`p-4 rounded-xl border transition-all duration-500 group ${instructor.status === 'active'
                                        ? (theme === 'dark' ? 'bg-[#0B1224]/60 border-white/5 hover:border-cyan-500/30' : 'bg-white border-slate-200 shadow-sm hover:border-cyan-500/50')
                                        : 'opacity-60 grayscale bg-slate-100/10 border-transparent'
                                        }`}
                                >
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border overflow-hidden ${getStatusColor(instructor.status)}`}>
                                                    {instructor.avatar ? (
                                                        <img src={instructor.avatar} alt={instructor.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-5 h-5" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold text-base flex items-center gap-2 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                                        {instructor.name}
                                                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${getStatusColor(instructor.status)}`}>{instructor.status}</span>
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-1 font-medium">
                                                        <span className="flex items-center gap-1.5 truncate max-w-[120px]" title={instructor.email}><Mail className="w-3 h-3 text-slate-500" /> {instructor.email}</span>
                                                        <span className="flex items-center gap-1.5 shrink-0"><Shield className="w-3 h-3 text-slate-500" /> {instructor.instructorId}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Management Actions */}
                                            <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleUpdateInstructor(instructor)}
                                                    className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-colors"
                                                    title="Edit Account"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeactivateUser(instructor.id, instructor.status, 'instructor')}
                                                    className={`p-2 rounded-lg border transition-colors ${instructor.status === 'active'
                                                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white'
                                                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                                                        }`}
                                                    title={instructor.status === 'active' ? "Disable Account" : "Enable Account"}
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(instructor.id, 'instructor')}
                                                    className="p-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-colors"
                                                    title="Delete Account"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

            {/* INSTRUCTOR Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && editingInstructor && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setIsEditModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className={`relative w-full max-w-lg rounded-[2rem] border p-8 shadow-2xl ${theme === 'dark' ? 'bg-[#0B1224] border-white/10' : 'bg-white border-slate-200'}`}
                        >
                            <h2 className="text-2xl font-black uppercase italic mb-6 tracking-tighter">Edit <span className="text-cyan-500">Instructor</span></h2>
                            <form onSubmit={handleSaveInstructorUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={editingInstructor.name}
                                        onChange={(e) => setEditingInstructor({ ...editingInstructor, name: e.target.value })}
                                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all ${theme === 'dark' ? 'bg-slate-950/50 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Instructor ID</label>
                                        <input
                                            type="text"
                                            value={editingInstructor.instructorId}
                                            onChange={(e) => setEditingInstructor({ ...editingInstructor, instructorId: e.target.value })}
                                            className={`w-full border rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all ${theme === 'dark' ? 'bg-slate-950/50 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Languages Handled</label>
                                        <input
                                            type="text"
                                            value={editingInstructor.languages}
                                            onChange={(e) => setEditingInstructor({ ...editingInstructor, languages: e.target.value })}
                                            placeholder="e.g. Python, Java"
                                            className={`w-full border rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all ${theme === 'dark' ? 'bg-slate-950/50 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Towers Handled</label>
                                    <input
                                        type="text"
                                        value={editingInstructor.towers}
                                        onChange={(e) => setEditingInstructor({ ...editingInstructor, towers: e.target.value })}
                                        placeholder="e.g. Eldoria, Mechanica"
                                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all ${theme === 'dark' ? 'bg-slate-950/50 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button" onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 py-3 rounded-xl border border-white/5 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-slate-400"
                                    >Cancel</button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                                    >Save Changes</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default InstructorManagement;
