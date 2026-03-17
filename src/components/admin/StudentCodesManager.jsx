import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Key, Search, Loader2, Trash2, CheckCircle, AlertCircle, Copy, Check, Upload, Wand2, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const StudentCodesManager = ({ theme }) => {
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [codesInput, setCodesInput] = useState('');
    const [generateCount, setGenerateCount] = useState(10);
    const [codePrefix, setCodePrefix] = useState('CS');
    const toast = useToast();
    const [copiedId, setCopiedId] = useState(null);
    
    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [codeToDelete, setCodeToDelete] = useState(null);

    const handleAutoGenerate = () => {
        let count = parseInt(generateCount, 10);
        if (isNaN(count) || count <= 0) count = 10;
        if (count > 500) count = 500; // Hard limit for safety

        const generateRandomString = (length) => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };

        const newCodes = [];
        for (let i = 0; i < count; i++) {
            // e.g. CS-9X4B-L2M1 or IT-XXXX-XXXX
            const code = `${codePrefix}-${generateRandomString(4)}-${generateRandomString(4)}`;
            newCodes.push(code);
        }

        const currentInput = codesInput.trim();
        if (currentInput) {
            setCodesInput(currentInput + ',\n' + newCodes.join(',\n'));
        } else {
            setCodesInput(newCodes.join(',\n'));
        }
        
        toast.popup(`Auto-generated ${count} secure codes`);
    };

    const fetchCodes = async () => {
        try {
            setLoading(true);
            const response = await api.instructor.getStudentCodes(page, 20, search);
            setCodes(response.codes);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error('Failed to fetch codes:', error);
            toast.popup('Failed to fetch student codes', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCodes();
    }, [page, search]);

    const handleUpload = async () => {
        if (!codesInput.trim()) {
            toast.popup('Please enter at least one code');
            return;
        }

        // Split by newline or comma, trim whitespace, and filter empty strings
        const codesArray = codesInput
            .split(/[\n,]+/)
            .map(c => c.trim())
            .filter(c => c.length > 0);

        if (codesArray.length === 0) {
            toast.popup('No valid codes to upload');
            return;
        }

        try {
            setGenerating(true);
            await api.instructor.uploadStudentCodes(codesArray);
            toast.popup(`Successfully uploaded ${codesArray.length} codes!`);
            setPage(1);
            setCodesInput('');
            fetchCodes();
        } catch (error) {
            console.error('Failed to upload codes:', error);
            toast.popup(error.message || 'Failed to upload codes', 'error');
        } finally {
            setGenerating(false);
        }
    };

    const handleDeleteClick = (id) => {
        setCodeToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!codeToDelete) return;

        try {
            await api.instructor.deleteStudentCode(codeToDelete);
            toast.popup('Code deleted');
            fetchCodes();
            setDeleteModalOpen(false);
            setTimeout(() => setCodeToDelete(null), 200);
        } catch (error) {
            console.error('Failed to delete code:', error);
            toast.popup('Failed to delete code', 'error');
        }
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedId(code);
        setTimeout(() => setCopiedId(null), 2000);
        toast.popup('Code copied to clipboard');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className={`text-3xl font-black uppercase italic tracking-widest ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        Student Codes
                    </h2>
                    <p className={`text-sm tracking-wide mt-1 ${theme === 'dark' ? 'text-cyan-500/80' : 'text-cyan-600'}`}>
                        Manage single-use registration codes for students
                    </p>
                </div>
            </div>

            {/* Actions Bar */}
            <div className={`p-6 rounded-2xl border flex flex-wrap gap-4 items-end transition-colors ${theme === 'dark' ? 'bg-[#0B1224] border-cyan-500/20' : 'bg-white border-slate-200'}`}>
                {/* Upload Block */}
                <div className="flex-[2] min-w-[300px] flex gap-4">
                    <div className="flex-1">
                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            Paste codes (comma or newline separated)
                        </label>
                        <textarea
                            value={codesInput}
                            onChange={(e) => setCodesInput(e.target.value)}
                            placeholder="e.g. BCP-12345, BCP-67890"
                            rows={3}
                            className={`w-full p-3 rounded-xl border transition-colors outline-none focus:border-cyan-500 font-mono text-sm resize-none ${theme === 'dark'
                                ? 'bg-slate-900/50 border-white/5 text-white placeholder-slate-600'
                                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                                }`}
                        />
                        <div className="flex items-center gap-3 mt-3">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border focus-within:border-cyan-500 transition-colors ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Prefix</span>
                                <select
                                    value={codePrefix}
                                    onChange={(e) => setCodePrefix(e.target.value)}
                                    className={`bg-transparent outline-none text-sm font-bold cursor-pointer ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
                                >
                                    <option value="CS" className={theme === 'dark' ? 'bg-slate-800' : ''}>CS</option>
                                    <option value="IS" className={theme === 'dark' ? 'bg-slate-800' : ''}>IS</option>
                                    <option value="IT" className={theme === 'dark' ? 'bg-slate-800' : ''}>IT</option>
                                </select>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border focus-within:border-cyan-500 transition-colors ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Quantity</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="500"
                                    value={generateCount}
                                    onChange={(e) => setGenerateCount(e.target.value)}
                                    className={`w-16 bg-transparent outline-none text-sm font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
                                />
                            </div>
                            <button
                                onClick={handleAutoGenerate}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                    theme === 'dark' 
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500 hover:text-white' 
                                    : 'bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-600 hover:text-white'
                                }`}
                                title="Auto-Generate Secure Codes"
                            >
                                <Wand2 className="w-3.5 h-3.5" />
                                Auto-Gen
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleUpload}
                        disabled={generating || !codesInput.trim()}
                        className="self-end px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-[46px]"
                    >
                        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Upload Codes
                    </button>
                </div>

                {/* Search Block */}
                <div className="flex-1 min-w-[300px] self-end mb-1">
                    <div className="relative">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="SEARCH CODES..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors outline-none focus:border-cyan-500 font-mono tracking-wider ${theme === 'dark'
                                ? 'bg-slate-900/50 border-white/5 text-white placeholder-slate-600'
                                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                                }`}
                        />
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className={`rounded-2xl border overflow-hidden transition-colors ${theme === 'dark' ? 'bg-[#0B1224] border-cyan-500/20' : 'bg-white border-slate-200'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`border-b text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'border-white/5 bg-slate-900/50 text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                                <th className="p-4">Code</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Used By</th>
                                <th className="p-4">Created At</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-cyan-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        <p className="text-xs uppercase tracking-widest font-bold">Loading Codes...</p>
                                    </td>
                                </tr>
                            ) : codes.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className={`p-8 text-center text-sm font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                        No codes found
                                    </td>
                                </tr>
                            ) : (
                                codes.map((code) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={code.id}
                                        className={`border-b transition-colors ${theme === 'dark' ? 'border-white/5 hover:bg-slate-800/30' : 'border-slate-100 hover:bg-slate-50'}`}
                                    >
                                        <td className="p-4 font-mono font-bold tracking-widest flex items-center gap-2 text-cyan-500">
                                            {code.code}
                                            <button
                                                onClick={() => handleCopy(code.code)}
                                                className={`p-1 rounded-md transition-colors ${copiedId === code.code ? 'text-green-500 bg-green-500/10' : theme === 'dark' ? 'text-slate-500 hover:text-cyan-400 hover:bg-slate-800' : 'text-slate-400 hover:text-cyan-600 hover:bg-slate-200'}`}
                                                title="Copy Code"
                                            >
                                                {copiedId === code.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            {code.is_used ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-500 text-xs font-bold uppercase tracking-wider border border-slate-500/20">
                                                    <AlertCircle className="w-3 h-3" /> Used
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                                                    <CheckCircle className="w-3 h-3" /> Available
                                                </span>
                                            )}
                                        </td>
                                        <td className={`p-4 text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                            {code.used_by ? (
                                                <div>
                                                    <span className={theme === 'dark' ? 'text-white font-bold' : 'text-slate-900 font-bold'}>{code.used_by.username}</span>
                                                    <br />
                                                    <span className="text-xs opacity-70">{code.used_by.email}</span>
                                                </div>
                                            ) : (
                                                <span className="opacity-50">-</span>
                                            )}
                                        </td>
                                        <td className={`p-4 text-xs tracking-wide ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                            {new Date(code.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDeleteClick(code.id)}
                                                className={`p-2 rounded-lg transition-colors group ${theme === 'dark' ? 'hover:bg-red-500/10 text-slate-500 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`}
                                                title="Delete Code"
                                            >
                                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={`p-4 border-t flex justify-center gap-2 ${theme === 'dark' ? 'border-white/5 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(prev => prev - 1)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${theme === 'dark'
                                ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 disabled:opacity-50'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50'
                                }`}
                        >
                            Prev
                        </button>
                        <span className={`px-4 py-2 text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                            {page} / {totalPages}
                        </span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(prev => prev + 1)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${theme === 'dark'
                                ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 disabled:opacity-50'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setDeleteModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={`relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border ${
                                theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                            }`}
                        >
                            <div className={`p-6 border-b flex items-center justify-between ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                                <h3 className={`text-xl font-black italic tracking-tighter flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    Confirm Deletion
                                </h3>
                                <button 
                                    onClick={() => setDeleteModalOpen(false)} 
                                    className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-6">
                                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Are you sure you want to permanently delete this registration code? This action cannot be undone.
                                </p>
                            </div>

                            <div className={`p-6 border-t flex justify-end gap-3 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                                        theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
                                    }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-6 py-2.5 rounded-xl font-bold text-sm bg-red-500 hover:bg-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentCodesManager;
