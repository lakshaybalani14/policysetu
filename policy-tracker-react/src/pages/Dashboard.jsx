import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, AlertCircle, Plus, TrendingUp, DollarSign, Award, Bell, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { applicationHelpers, paymentHelpers, policyHelpers, adminHelpers, supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';

const Dashboard = ({ user }) => {
    const [applications, setApplications] = useState([]);
    const [payments, setPayments] = useState([]);
    const [recommendedPolicies, setRecommendedPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let appsResult, paymentsResult;

                if (user.role === 'admin') {
                    // Admin gets all data
                    [appsResult, paymentsResult] = await Promise.all([
                        adminHelpers.getAllApplications(),
                        paymentHelpers.getAll()
                    ]);
                } else {
                    // User gets only their data
                    [appsResult, paymentsResult] = await Promise.all([
                        applicationHelpers.getUserApplications(),
                        paymentHelpers.getUserPayments()
                    ]);
                }

                const policiesResult = await policyHelpers.getAll();

                setApplications(appsResult.data || []);
                setPayments(paymentsResult.data || []);

                // Generate recommendations from policiesData
                const appliedIds = (appsResult.data || []).map(a => a.policy_id);
                const notApplied = (policiesResult.data || []).filter(p => !appliedIds.includes(p.id) && p.status === 'active');
                setRecommendedPolicies(notApplied.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).slice(0, 3));
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Subscribe to changes
        const subscription = supabase
            .channel('dashboard-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'applications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    if (payload.eventType === 'UPDATE') {
                        // Refresh data on update
                        fetchData();
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'payments',
                    filter: `user_id=eq.${user.id}`
                },
                () => fetchData()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user.id]);



    const stats = {
        total: applications.length,
        approved: applications.filter(a => a.status === 'approved').length,
        pending: applications.filter(a => a.status === 'submitted' || a.status === 'under-review').length,
        totalBenefits: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    };

    const recentApplications = applications.slice(-5).reverse();
    const recentPayments = payments.slice(-3).reverse();

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
            case 'submitted': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
            case 'under-review': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
            default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircle size={16} />;
            case 'submitted': return <FileText size={16} />;
            case 'under-review': return <Clock size={16} />;
            case 'rejected': return <AlertCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2 capitalize">
                        {t('welcome_user', { name: (user?.name || user?.email || 'User').split('@')[0] })}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        {user.role === 'admin' ? "Here's an overview of all system applications" : "Here's an overview of your applications"}
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                    <StatCard
                        label={t('stats_total')}
                        value={stats.total}
                        icon={<FileText className="text-primary-500" size={24} />}
                        delay={0.1}
                    />
                    <StatCard
                        label={t('stats_approved')}
                        value={stats.approved}
                        icon={<CheckCircle className="text-green-500" size={24} />}
                        delay={0.2}
                    />
                    <StatCard
                        label={t('stats_pending')}
                        value={stats.pending}
                        icon={<Clock className="text-yellow-500" size={24} />}
                        delay={0.3}
                    />
                    <StatCard
                        label={t('stats_benefits')}
                        value={`₹${stats.totalBenefits.toLocaleString('en-IN')}`}
                        icon={<DollarSign className="text-purple-500" size={24} />}
                        delay={0.4}
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* Recent Applications */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="glass-card rounded-2xl overflow-hidden h-full"
                        >
                            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-800">{t('recent_apps')}</h2>
                                <Link to="/my-applications" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                                    {t('view_all')}
                                </Link>
                            </div>

                            <div className="p-6">
                                {recentApplications.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentApplications.map((app, index) => (
                                            <motion.div
                                                key={app.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors border border-slate-100 dark:border-slate-700"
                                            >
                                                <div>
                                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                                                        {app.policies?.name || `Application #${app.id.substring(0, 8)}`}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {new Date(app.submittedAt || app.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                                                    {getStatusIcon(app.status)}
                                                    <span className="capitalize">{app.status.replace('-', ' ')}</span>
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <FileText className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                                        <p className="text-slate-500 dark:text-slate-400 mb-4">No applications yet</p>
                                        <Link to="/policies" className="btn-primary inline-flex items-center space-x-2">
                                            <Plus size={16} />
                                            <span>Apply for a Policy</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Quick Actions & Notifications */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="glass-card rounded-2xl p-6"
                        >
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">{t('quick_actions')}</h3>
                            <div className="space-y-3">
                                {user?.role === 'admin' ? (
                                    <>
                                        <Link
                                            to="/admin?tab=applications"
                                            className="flex items-center space-x-3 p-3 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-xl transition-colors group"
                                        >
                                            <div className="p-2 bg-primary-600 rounded-lg text-white">
                                                <FileText size={18} />
                                            </div>
                                            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-primary-700 dark:group-hover:text-primary-300">View Applications</span>
                                        </Link>
                                        <Link
                                            to="/admin?tab=analytics"
                                            className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors group"
                                        >
                                            <div className="p-2 bg-slate-600 rounded-lg text-white">
                                                <BarChart3 size={18} />
                                            </div>
                                            <span className="font-medium text-slate-700 dark:text-slate-200">View Analysis</span>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/policies"
                                            className="flex items-center space-x-3 p-3 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-xl transition-colors group"
                                        >
                                            <div className="p-2 bg-primary-600 rounded-lg text-white">
                                                <Plus size={18} />
                                            </div>
                                            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-primary-700 dark:group-hover:text-primary-300">{t('new_app')}</span>
                                        </Link>
                                        <Link
                                            to="/my-applications"
                                            className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors group"
                                        >
                                            <div className="p-2 bg-slate-600 rounded-lg text-white">
                                                <FileText size={18} />
                                            </div>
                                            <span className="font-medium text-slate-700 dark:text-slate-200">{t('track_app')}</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.div>

                        {/* Notifications */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="glass-card rounded-2xl p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('notifications')}</h3>
                                <Bell className="text-slate-400" size={20} />
                            </div>
                            <div className="space-y-3">
                                {applications.length > 0 ? (
                                    <>
                                        <div className="text-sm text-slate-600 dark:text-slate-300 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <span className="font-semibold">Info:</span> You have {stats.pending} application(s) pending review
                                        </div>
                                        {stats.approved > 0 && (
                                            <div className="text-sm text-slate-600 dark:text-slate-300 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                <span className="font-semibold">Success:</span> {stats.approved} application(s) approved!
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                                        No new notifications
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Recommended Policies */}
                {
                    recommendedPolicies.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="glass-card rounded-2xl p-6"
                        >
                            <div className="flex items-center space-x-2 mb-6">
                                <Award className="text-primary-600" size={24} />
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('rec_policies')}</h2>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                {recommendedPolicies.map((policy, index) => (
                                    <motion.div
                                        key={policy.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.9 + index * 0.1 }}
                                        className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-lg transition-all hover:border-primary-300 dark:hover:border-primary-600"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-full">
                                                {policy.sector}
                                            </span>
                                            {policy.featured && (
                                                <span className="text-secondary-500">⭐</span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 line-clamp-2">{policy.name}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{policy.description}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="text-primary-600 font-bold">
                                                ₹{policy.benefitAmount.toLocaleString('en-IN')}
                                            </div>
                                            <Link
                                                to={`/policy/${policy.id}`}
                                                className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                                            >
                                                Learn More →
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )
                }

                {/* Recent Payments */}
                {
                    recentPayments.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 }}
                            className="glass-card rounded-2xl overflow-hidden mt-8"
                        >
                            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Recent Payments</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400">Policy</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400">Amount</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400">Date</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {recentPayments.map((payment, index) => (
                                            <motion.tr
                                                key={payment.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 1.1 + index * 0.1 }}
                                                className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                                            >
                                                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{payment.policyName}</td>
                                                <td className="px-6 py-4 text-green-600 dark:text-green-400 font-semibold">
                                                    ₹{payment.amount.toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                    {new Date(payment.completedAt || payment.initiatedAt).toLocaleDateString('en-IN')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                        {payment.status}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )
                }
            </div >
        </div >
    );
};

const StatCard = ({ label, value, icon, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className="glass-card p-4 md:p-6 rounded-2xl flex items-center space-x-3 md:space-x-4 hover:shadow-lg transition-shadow"
    >
        <div className="p-2 md:p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex-shrink-0">{icon}</div>
        <div className="min-w-0">
            <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">{label}</div>
            <div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">{value}</div>
        </div>
    </motion.div>
);

export default Dashboard;
