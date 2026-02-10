import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Shield, UserCircle, Loader } from 'lucide-react';
import { authHelpers, adminHelpers } from '../services/supabase';

const Login = ({ setUser }) => {
    const [loginRole, setLoginRole] = useState('citizen');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data, error: signInError } = await authHelpers.signIn(formData.email, formData.password);

            if (signInError) {
                setError(signInError.message || 'Login failed. Please check your credentials.');
                setLoading(false);
                return;
            }

            if (!data.user) {
                setError('Login failed. Please try again.');
                setLoading(false);
                return;
            }

            // Check if user is admin by querying admins table
            const { isAdmin, data: adminData } = await adminHelpers.isAdmin(data.user.id);

            // If trying to login as admin, verify admin status
            if (loginRole === 'admin' && !isAdmin) {
                setError('Access Denied: Not an admin account');
                setLoading(false);
                return;
            }

            // Determine actual role
            const userRole = isAdmin ? 'admin' : 'user';

            // Update last login for admins
            if (isAdmin) {
                await adminHelpers.updateLastLogin(data.user.id);
            }

            // Create user object
            const userObj = {
                id: data.user.id,
                email: data.user.email,
                name: adminData?.full_name || data.user.user_metadata?.name || data.user.email.split('@')[0],
                role: userRole
            };

            // Save to local storage
            localStorage.setItem('user', JSON.stringify(userObj));

            if (setUser) setUser(userObj);

            navigate(userRole === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            console.error(err);
            setError('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const fillTestCredentials = () => {
        if (loginRole === 'admin') {
            setFormData({ email: 'admin@test.com', password: 'admin123' });
        } else {
            setFormData({ email: 'user@test.com', password: 'user123' });
        }
    };

    return (
        <div className="min-h-screen py-24 px-4 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-card p-8 rounded-2xl w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">Sign in to access your account</p>
                </div>

                {/* Role Selection */}
                <div className="flex gap-4 mb-6">
                    <button
                        type="button"
                        onClick={() => setLoginRole('citizen')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${loginRole === 'citizen'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                    >
                        <UserCircle className={`mx-auto mb-2 ${loginRole === 'citizen' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}`} size={32} />
                        <div className={`font-semibold ${loginRole === 'citizen' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300'}`}>
                            Citizen
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setLoginRole('admin')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${loginRole === 'admin'
                            ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                    >
                        <Shield className={`mx-auto mb-2 ${loginRole === 'admin' ? 'text-secondary-600 dark:text-secondary-400' : 'text-slate-400 dark:text-slate-500'}`} size={32} />
                        <div className={`font-semibold ${loginRole === 'admin' ? 'text-secondary-600 dark:text-secondary-400' : 'text-slate-600 dark:text-slate-300'}`}>
                            Admin
                        </div>
                    </button>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                placeholder="your.email@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2 rounded" />
                            <span className="text-slate-600 dark:text-slate-400">Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader className="animate-spin" size={20} />
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={fillTestCredentials}
                        className="w-full py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                        Fill Test Credentials
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold">
                        Sign Up
                    </Link>
                </div>

                {/* Test Accounts Info */}
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                    <p className="font-semibold mb-2">Test Accounts:</p>
                    <p>👤 User: user@test.com / user123</p>
                    <p>🛡️ Admin: admin@test.com / admin123</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
