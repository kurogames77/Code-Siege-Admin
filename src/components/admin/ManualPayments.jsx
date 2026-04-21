import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Search, RefreshCw, Send, ArrowLeft, AlertTriangle } from 'lucide-react';
import { paymentsAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import gemIcon from '../../assets/gem.png';

const ManualPayments = ({ setActiveTab, previousTab = 'students' }) => {
    const { user } = useUser();
    const { success, error: toastError } = useToast();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, newStatus: null });

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const statusFilter = filter === 'all' ? '' : filter;
            const role = previousTab === 'guests' ? 'guest' : 'student';
            const res = await paymentsAPI.getManualPayments(statusFilter, role);
            setPayments(Array.isArray(res) ? res : (res.data || []));
        } catch (err) {
            console.error("Failed to fetch payments:", err);
            toastError("Failed to load manual payments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [filter]);

    const initiateUpdate = (id, newStatus) => {
        setConfirmModal({ isOpen: true, id, newStatus });
    };

    const handleConfirmUpdate = async () => {
        const { id, newStatus } = confirmModal;
        if (!id || processing) return;
        
        setProcessing(true);
        try {
            await paymentsAPI.updatePaymentStatus(id, newStatus, user.id);
            success(`Payment marked as ${newStatus}`);
            fetchPayments();
            setConfirmModal({ isOpen: false, id: null, newStatus: null });
        } catch (err) {
            console.error(`Failed to ${newStatus} payment:`, err);
            toastError(err?.response?.data?.error || `Failed to mark payment as ${newStatus}`);
            // Also close the modal on error, or keep it open so they see the error
            setConfirmModal({ isOpen: false, id: null, newStatus: null });
        } finally {
            setProcessing(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'rejected': return <XCircle className="w-5 h-5 text-rose-500" />;
            case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
            default: return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
            case 'rejected': return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/30';
        }
    };

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <div>
                <button
                    onClick={() => setActiveTab(previousTab)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-black/20 hover:bg-black/40 text-slate-400 hover:text-white rounded-lg border border-white/10 transition-colors text-xs font-bold uppercase tracking-widest mb-2 w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to {previousTab === 'guests' ? 'Guest Management' : 'Student Management'}
                </button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-1 flex items-center gap-2">
                         Payment Verification
                    </h2>
                    <p className="text-slate-400 font-bold">Review and approve GCash reference numbers here.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchPayments}
                        disabled={loading}
                        className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500 transition-colors"
                    >
                        <option value="pending">Pending Only</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="all">All Payments</option>
                    </select>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/40 border-b border-white/10">
                            <tr>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest pl-6">Date</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Player</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Amount PHP</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Gems</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Reference #</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right pr-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && payments.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-500 font-bold animate-pulse">
                                        Loading payments...
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-500 font-bold">
                                        No manual payments found for this filter.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <motion.tr 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        key={payment.id}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="p-4 pl-6">
                                            <div className="text-white font-bold">{new Date(payment.created_at).toLocaleDateString()}</div>
                                            <div className="text-xs text-slate-500">{new Date(payment.created_at).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-cyan-400 font-bold">{payment.users?.username || 'Unknown'}</span>
                                                <span className="text-xs text-slate-500">{payment.users?.email || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-black tracking-widest">
                                                ₱ {payment.amount}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="text-amber-400 font-black">{payment.gems}</span>
                                                <img src={gemIcon} alt="gem" className="w-4 h-4" />
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-white font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 tracking-widest">
                                                {payment.reference_number}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-widest ${getStatusColor(payment.status)}`}>
                                                {getStatusIcon(payment.status)}
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right pr-6">
                                            {payment.status === 'pending' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        disabled={processing}
                                                        onClick={() => initiateUpdate(payment.id, 'approved')}
                                                        className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        disabled={processing}
                                                        onClick={() => initiateUpdate(payment.id, 'rejected')}
                                                        className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/30 rounded-lg text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                                                    Processed
                                                </span>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom Confirmation Modal */}
            {confirmModal.isOpen && createPortal(
                <AnimatePresence mode="wait">
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm p-6 rounded-2xl border border-cyan-500/20 bg-[#0B1224] shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${confirmModal.newStatus === 'approved' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500' : 'bg-rose-500/20 border-rose-500/30 text-rose-500'}`}>
                                    {confirmModal.newStatus === 'approved' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-wide text-white">
                                    {confirmModal.newStatus === 'approved' ? 'Approve Payment?' : 'Reject Payment?'}
                                </h3>
                            </div>

                            <p className="mb-6 text-sm font-medium text-slate-400">
                                Are you sure you want to mark this payment as <span className={`font-bold ${confirmModal.newStatus === 'approved' ? 'text-emerald-400' : 'text-rose-400'}`}>{confirmModal.newStatus}</span>? This action cannot be undone.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmModal({ isOpen: false, id: null, newStatus: null })}
                                    disabled={processing}
                                    className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmUpdate}
                                    disabled={processing}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                                        confirmModal.newStatus === 'approved' 
                                            ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50'
                                            : 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20 disabled:opacity-50'
                                    }`}
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default ManualPayments;
