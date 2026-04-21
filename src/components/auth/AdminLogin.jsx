import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { Shield, Lock, Loader2, AlertCircle, Eye, EyeOff, Terminal } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../contexts/ToastContext';
import '../../styles/admin-login.css';

const AdminLogin = () => {
    const [adminId, setAdminId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const recaptchaRef = useRef(null);
    const { checkAuth } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();

    const [isRecaptchaRequired, setIsRecaptchaRequired] = useState(true);

    useEffect(() => {
        if (location.state?.loggedOut) {
            toast.popup('Admin logged out successfully', 'success');
            navigate('.', { replace: true, state: {} });
        }
    }, [location.state, navigate, toast]);

    useEffect(() => {
        authAPI.getRecaptchaSettingsPublic()
            .then(res => setIsRecaptchaRequired(res.enabled))
            .catch(err => console.error('Failed to fetch recaptcha setting:', err));
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (isRecaptchaRequired && !recaptchaToken) {
            setError('Please complete the reCAPTCHA verification');
            setLoading(false);
            return;
        }

        try {
            await authAPI.login(adminId, password, recaptchaToken);
            await checkAuth();
            toast.popup('Admin authenticated successfully', 'success');
            navigate('/dashboard', { replace: true });
        } catch (err) {
            console.error('Login error:', err);
            // Generic error message for security to not leak admin existence
            setError('Invalid credentials or unauthorized access.');
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
                setRecaptchaToken(null);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="landing-page">
            <div className="landing-modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
                <div className="landing-modal__panel landing-modal__panel--login">
                    <div className="landing-modal__header" id="login-title">
                        <div className="landing-modal__heading">
                            <h2>Admin Control Portal</h2>
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-2 text-center">
                            Restricted Access Zone
                        </p>
                    </div>

                    {error && (
                        <div className="landing-modal__error">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form className="landing-modal__form" onSubmit={handleLogin}>
                        <label className="landing-modal__field">
                            <span className="landing-modal__label">Admin Identity</span>
                            <div className="landing-modal__input">
                                <Terminal />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 22-A-00001"
                                    value={adminId}
                                    onChange={(e) => setAdminId(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </label>

                        <label className="landing-modal__field">
                            <span className="landing-modal__label">Security Key</span>
                            <div className="landing-modal__input">
                                <Lock />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="Enter your security key"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="p-1 hover:text-white text-slate-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </label>

                        {isRecaptchaRequired && (
                            <div className="flex justify-center mb-4 mt-2">
                                {import.meta.env.VITE_RECAPTCHA_SITE_KEY ? (
                                    <ReCAPTCHA
                                        ref={recaptchaRef}
                                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                                        onChange={(token) => setRecaptchaToken(token)}
                                        theme="dark"
                                    />
                                ) : (
                                    <div className="text-red-500 text-sm">Error: reCAPTCHA site key is missing in environment variables.</div>
                                )}
                            </div>
                        )}

                        <button
                            className="landing-modal__submit"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" size={18} />
                                    Authenticating...
                                </div>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>

                    <div className="landing-modal__footnote mt-6 flex-col gap-2">
                        <div className="flex items-center justify-center gap-2 text-rose-400 opacity-80">
                            <Shield size={14} />
                            <span>Unauthorized access is strictly prohibited.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
