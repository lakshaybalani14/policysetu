import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Phone, ArrowRight, Loader, ShieldCheck, X, RefreshCw } from 'lucide-react';
import { authHelpers } from '../services/supabase';
import emailApi from '../services/emailApi';

const Register = ({ setUser }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    // OTP State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const otpInputRefs = useRef([]);

    // Resend timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Step 1: Validate form and send OTP
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            // Send OTP to the email
            const result = await emailApi.sendOtp(formData.email);

            if (result.success) {
                setOtpSent(true);
                setShowOtpModal(true);
                setResendTimer(60);
                setOtp(['', '', '', '', '', '']);
                setOtpError('');
            } else {
                setError(result.message || 'Failed to send verification code. Please try again.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to send verification code. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP and complete registration
    const handleVerifyOtp = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setOtpError('Please enter the complete 6-digit code');
            return;
        }

        setOtpLoading(true);
        setOtpError('');

        try {
            // Verify OTP with server
            const verifyResult = await emailApi.verifyOtp(formData.email, otpString);

            if (!verifyResult.success) {
                setOtpError(verifyResult.message || 'Invalid OTP');
                setOtpLoading(false);
                return;
            }

            // OTP verified — proceed with Supabase registration
            const { data, error: signUpError } = await authHelpers.signUp(
                formData.email,
                formData.password,
                {
                    name: formData.fullName,
                    phone: formData.phone,
                    role: 'user'
                }
            );

            if (signUpError) {
                setOtpError(signUpError.message || 'Registration failed. Please try again.');
                setOtpLoading(false);
                return;
            }

            // Registration successful
            setShowOtpModal(false);
            setSuccess(true);

            // Send welcome email (fire and forget)
            emailApi.sendWelcome(formData.fullName, formData.email);

            // Auto-login
            if (data.user) {
                const userObj = {
                    id: data.user.id,
                    email: data.user.email,
                    name: formData.fullName,
                    role: 'user'
                };

                localStorage.setItem('user', JSON.stringify(userObj));
                if (setUser) setUser(userObj);

                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            }
        } catch (err) {
            console.error(err);
            setOtpError('Verification failed. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (resendTimer > 0) return;

        setOtpLoading(true);
        setOtpError('');

        try {
            const result = await emailApi.sendOtp(formData.email);
            if (result.success) {
                setResendTimer(60);
                setOtp(['', '', '', '', '', '']);
                setOtpError('');
            } else {
                setOtpError('Failed to resend OTP. Please try again.');
            }
        } catch (err) {
            setOtpError('Failed to resend OTP.');
        } finally {
            setOtpLoading(false);
        }
    };

    // OTP Input handlers
    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'Enter' && otp.join('').length === 6) {
            handleVerifyOtp();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            otpInputRefs.current[5]?.focus();
        }
    };

    return (
        <div className="min-h-screen py-24 px-4 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-card p-8 rounded-2xl w-full max-w-xl"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2">
                        Create Account
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">Join us to access government schemes</p>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm text-center border border-red-200 dark:border-red-800"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Success Message */}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg mb-6 text-sm text-center border border-green-200 dark:border-green-800"
                    >
                        ✅ Account created & verified! Redirecting...
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="tel"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                    placeholder="+91 98765 43210"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="password"
                                    required
                                    minLength="6"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="password"
                                    required
                                    minLength="6"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading || success}
                        className={`btn-primary w-full flex items-center justify-center space-x-2 ${loading || success ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <>
                                <Loader className="animate-spin" size={20} />
                                <span>Sending Verification Code...</span>
                            </>
                        ) : success ? (
                            <span>✅ Account Created!</span>
                        ) : (
                            <>
                                <ShieldCheck size={20} />
                                <span>Verify & Create Account</span>
                            </>
                        )}
                    </motion.button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 hover:underline">
                        Sign In
                    </Link>
                </div>
            </motion.div>

            {/* ─── OTP Verification Modal ─── */}
            <AnimatePresence>
                {showOtpModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
                        onClick={() => setShowOtpModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setShowOtpModal(false)}
                                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <ShieldCheck size={32} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Verify Your Email</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    We sent a 6-digit code to
                                </p>
                                <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-1">
                                    {formData.email}
                                </p>
                            </div>

                            {/* OTP Error */}
                            {otpError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2.5 rounded-lg mb-4 text-sm text-center border border-red-200 dark:border-red-800"
                                >
                                    {otpError}
                                </motion.div>
                            )}

                            {/* OTP Input */}
                            <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (otpInputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>

                            {/* Verify Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleVerifyOtp}
                                disabled={otpLoading || otp.join('').length !== 6}
                                className={`btn-primary w-full flex items-center justify-center space-x-2 ${otpLoading || otp.join('').length !== 6 ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {otpLoading ? (
                                    <>
                                        <Loader className="animate-spin" size={18} />
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={18} />
                                        <span>Verify & Create Account</span>
                                    </>
                                )}
                            </motion.button>

                            {/* Resend OTP */}
                            <div className="mt-4 text-center">
                                <p className="text-xs text-slate-400 mb-2">Didn't receive the code?</p>
                                <button
                                    onClick={handleResendOtp}
                                    disabled={resendTimer > 0 || otpLoading}
                                    className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-primary-600 dark:text-primary-400 hover:text-primary-700'}`}
                                >
                                    <RefreshCw size={14} />
                                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Register;
