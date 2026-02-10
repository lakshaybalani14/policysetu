import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye, Download, Calendar, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { applicationHelpers } from '../services/supabase';

const MyApplications = () => {
    const { t } = useLanguage();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'submitted', 'under-review', 'approved', 'rejected'

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const { data, error } = await applicationHelpers.getUserApplications();
                if (error) {
                    console.error("Error fetching applications:", error);
                    setApplications([]);
                } else {
                    setApplications(data || []);
                }
            } catch (error) {
                console.error("Failed to fetch applications:", error);
                setApplications([]);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'submitted':
                return <Clock className="text-blue-600 dark:text-blue-400" size={24} />;
            case 'under-review':
                return <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={24} />;
            case 'approved':
                return <CheckCircle className="text-green-600 dark:text-green-400" size={24} />;
            case 'rejected':
                return <XCircle className="text-red-600 dark:text-red-400" size={24} />;
            default:
                return <FileText className="text-slate-600 dark:text-slate-400" size={24} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'submitted':
                return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
            case 'under-review':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
        }
    };

    const getStatusText = (status) => {
        return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const filteredApplications = applications.filter(app =>
        filter === 'all' || app.status === filter
    );

    const stats = {
        total: applications.length,
        submitted: applications.filter(a => a.status === 'submitted').length,
        underReview: applications.filter(a => a.status === 'under-review').length,
        approved: applications.filter(a => a.status === 'approved').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
    };

    return (
        <div className="min-h-screen py-24 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                        {t('my_apps_title')}
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400">
                        {t('my_apps_subtitle')}
                    </p>
                </motion.div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <StatCard
                        label={t('stat_total')}
                        value={stats.total}
                        icon={<FileText size={24} />}
                        color="bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300"
                        active={filter === 'all'}
                        onClick={() => setFilter('all')}
                    />
                    <StatCard
                        label={t('stat_submitted')}
                        value={stats.submitted}
                        icon={<Clock size={24} />}
                        color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        active={filter === 'submitted'}
                        onClick={() => setFilter('submitted')}
                    />
                    <StatCard
                        label={t('stat_review')}
                        value={stats.underReview}
                        icon={<AlertCircle size={24} />}
                        color="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                        active={filter === 'under-review'}
                        onClick={() => setFilter('under-review')}
                    />
                    <StatCard
                        label={t('stat_approved')}
                        value={stats.approved}
                        icon={<CheckCircle size={24} />}
                        color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        active={filter === 'approved'}
                        onClick={() => setFilter('approved')}
                    />
                    <StatCard
                        label={t('stat_rejected')}
                        value={stats.rejected}
                        icon={<XCircle size={24} />}
                        color="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        active={filter === 'rejected'}
                        onClick={() => setFilter('rejected')}
                    />
                </div>

                {/* Applications List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader className="animate-spin text-primary-600" size={48} />
                    </div>
                ) : filteredApplications.length > 0 ? (
                    <div className="space-y-4">
                        {filteredApplications.map((application, index) => (
                            <ApplicationCard
                                key={application.id}
                                application={application}
                                index={index}
                                getStatusIcon={getStatusIcon}
                                getStatusColor={getStatusColor}
                                getStatusText={getStatusText}
                                t={t}
                            />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 glass-card rounded-2xl"
                    >
                        <FileText className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={64} />
                        <p className="text-2xl text-slate-400 dark:text-slate-500 mb-2">
                            {filter === 'all' ? t('no_apps') : t('no_apps_filter').replace('{status}', getStatusText(filter))}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            {t('start_applying')}
                        </p>
                        <Link to="/policies" className="btn-primary">
                            {t('btn_browse')}
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon, color, active, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`glass-card p-6 rounded-xl cursor-pointer transition-all ${active ? 'ring-2 ring-primary-500 shadow-lg' : ''
            }`}
    >
        <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
            {icon}
        </div>
        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">{value}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
    </motion.button>
);

const ApplicationCard = ({ application, index, getStatusIcon, getStatusColor, getStatusText, t }) => {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all"
        >
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                        <div className="mt-1">
                            {getStatusIcon(application.status)}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                                {application.policyName}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                {t('app_id')}: #{application.id}
                            </p>
                        </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                    </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                        <Calendar size={18} />
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-500">{t('lbl_submitted')}</p>
                            <p className="font-medium text-slate-700 dark:text-slate-300">
                                {new Date(application.submittedAt).toLocaleDateString('en-IN')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                        <FileText size={18} />
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-500">{t('lbl_documents')}</p>
                            <p className="font-medium text-slate-700 dark:text-slate-300">{application.documents?.length || 0} files</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                        <Clock size={18} />
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-500">{t('lbl_last_updated')}</p>
                            <p className="font-medium text-slate-700 dark:text-slate-300">
                                {new Date(application.lastUpdated).toLocaleDateString('en-IN')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Application Timeline */}
                {application.status !== 'submitted' && (
                    <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">{t('lbl_timeline')}</h4>
                        <div className="space-y-3">
                            <TimelineItem
                                status="completed"
                                label={t('lbl_submitted')}
                                date={new Date(application.submittedAt).toLocaleString('en-IN')}
                            />
                            {application.status !== 'submitted' && (
                                <TimelineItem
                                    status="completed"
                                    label={t('stat_review')}
                                    date={new Date(application.lastUpdated).toLocaleString('en-IN')}
                                />
                            )}
                            {application.status === 'approved' && (
                                <TimelineItem
                                    status="completed"
                                    label={t('stat_approved')}
                                    date={new Date(application.lastUpdated).toLocaleString('en-IN')}
                                />
                            )}
                            {application.status === 'rejected' && (
                                <TimelineItem
                                    status="rejected"
                                    label={t('stat_rejected')}
                                    date={new Date(application.lastUpdated).toLocaleString('en-IN')}
                                    reason="Incomplete documentation"
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <Eye size={18} />
                        <span>{showDetails ? t('btn_hide_details') : t('btn_view_details')}</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Download size={18} />
                        <span>{t('btn_download')}</span>
                    </button>
                    <Link
                        to={`/policy/${application.policyId}`}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                    >
                        <FileText size={18} />
                        <span>{t('btn_view_policy')}</span>
                    </Link>
                </div>

                {/* Expanded Details */}
                {showDetails && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700"
                    >
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">{t('dtl_app_details')}</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <DetailRow label={t('input_fullname')} value={application.fullName} />
                            <DetailRow label={t('input_email')} value={application.email} />
                            <DetailRow label={t('input_phone')} value={application.phone} />
                            <DetailRow label={t('lbl_dob')} value={new Date(application.dateOfBirth).toLocaleDateString('en-IN')} />
                            <DetailRow label={t('lbl_gender')} value={application.gender} />
                            <DetailRow label={t('lbl_occupation')} value={application.occupation} />
                            <DetailRow label={t('lbl_income')} value={`₹${parseInt(application.annualIncome).toLocaleString('en-IN')}`} />
                            <DetailRow label={t('lbl_category')} value={application.category} />
                            <DetailRow label={t('lbl_city')} value={application.city} />
                            <DetailRow label={t('lbl_state')} value={application.state} />
                            <DetailRow label={t('lbl_bank')} value={application.bankName} />
                            <DetailRow label={t('lbl_account')} value={application.accountNumber} />
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

const TimelineItem = ({ status, label, date, reason }) => (
    <div className="flex items-start space-x-3">
        <div className={`mt-1 w-2 h-2 rounded-full ${status === 'completed' ? 'bg-green-500' :
            status === 'rejected' ? 'bg-red-500' :
                'bg-slate-300 dark:bg-slate-600'
            }`} />
        <div className="flex-1">
            <p className="font-medium text-slate-800 dark:text-slate-200">{label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{date}</p>
            {reason && <p className="text-xs text-red-600 dark:text-red-400 mt-1">Reason: {reason}</p>}
        </div>
    </div>
);

const DetailRow = ({ label, value }) => (
    <div>
        <p className="text-slate-500 dark:text-slate-400 mb-1">{label}</p>
        <p className="font-medium text-slate-800 dark:text-slate-200">{value}</p>
    </div>
);

export default MyApplications;
