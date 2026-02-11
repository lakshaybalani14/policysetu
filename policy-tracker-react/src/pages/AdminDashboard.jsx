import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    CheckCircle,
    XCircle,
    TrendingUp,
    Search,
    Eye,
    PieChart as PieIcon,
    BarChart3,
    Download,
    Clock,
    ExternalLink,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { BarChart, PieChart } from '../components/SimpleCharts';
import { useNotification } from '../context/NotificationContext';
import { adminHelpers, paymentHelpers, supabase, storageHelpers } from '../services/supabase';

/* ======================================================
   COLOR STYLES
====================================================== */
const colorStyles = {
    blue: { border: 'border-l-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
    green: { border: 'border-l-green-500', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
    yellow: { border: 'border-l-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400' },
    purple: { border: 'border-l-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
};

/* ======================================================
   REUSABLE COMPONENTS
====================================================== */
const StatCard = ({ label, value, icon, color }) => {
    const styles = colorStyles[color];
    return (
        <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700 border-l-4 ${styles.border}`}>
            <div className={`p-3 rounded-xl ${styles.bg} ${styles.text} mb-3`}>
                {icon}
            </div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        'under-review': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.submitted}`}>
            {status?.replace('-', ' ')}
        </span>
    );
};

/* ======================================================
   APPLICATION DETAILS MODAL
====================================================== */
const ApplicationDetailsModal = ({ application, onClose, onUpdateStatus }) => {
    const [downloading, setDownloading] = useState({});
    const { error: showError } = useNotification();

    // Debug logging
    console.log('Application Details:', application);
    console.log('Documents:', application.documents);
    console.log('Documents length:', application.documents?.length);

    const handleDownloadDocument = async (doc, index) => {
        setDownloading(prev => ({ ...prev, [index]: true }));
        try {
            const filePath = doc.filePath || doc.file_path;
            const bucket = doc.storageBucket || doc.storage_bucket || 'application-documents';

            if (!filePath) {
                showError('Document path not found');
                return;
            }

            const { data, error } = await storageHelpers.getDocumentDownloadUrl(bucket, filePath);

            if (error) {
                console.error('Download error:', error);
                showError('Failed to generate download link');
                return;
            }

            if (data?.signedUrl) {
                // Create a temporary link and trigger download
                const link = document.createElement('a');
                link.href = data.signedUrl;
                link.download = doc.fileName || doc.file_name || doc.name || `document-${index + 1}`;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (err) {
            console.error('Download error:', err);
            showError('Failed to download document');
        } finally {
            setDownloading(prev => ({ ...prev, [index]: false }));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Application Details</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XCircle />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Application ID</p>
                            <p className="text-slate-900 dark:text-white font-mono text-sm">{application.id?.substring(0, 8)}...</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Date Submitted</p>
                            <p className="text-slate-900 dark:text-white">
                                {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : (application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A')}
                            </p>
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Current Status</p>
                            <StatusBadge status={application.status} />
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Policy</p>
                            <p className="font-medium text-slate-900 dark:text-white">{application.policyName}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                                Personal Information
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500">Full Name</p>
                                    <p className="text-slate-900 dark:text-white font-medium">{application.fullName || application.applicantName}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500">Date of Birth</p>
                                        <p className="text-slate-900 dark:text-white">
                                            {application.dateOfBirth ? new Date(application.dateOfBirth).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Gender</p>
                                        <p className="text-slate-900 dark:text-white capitalize">{application.gender || '-'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Contact</p>
                                    <p className="text-slate-900 dark:text-white">{application.phone || '-'}</p>
                                    <p className="text-slate-900 dark:text-white text-sm">{application.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Financial & Address */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                                Financial & Location
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500">Annual Income</p>
                                        <p className="text-slate-900 dark:text-white font-medium">
                                            {application.annualIncome ? `₹${parseInt(application.annualIncome).toLocaleString('en-IN')}` : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Occupation</p>
                                        <p className="text-slate-900 dark:text-white capitalize">{application.occupation || '-'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Location</p>
                                    <p className="text-slate-900 dark:text-white">{application.city || '-'}, {application.state || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Bank Details</p>
                                    <p className="text-slate-900 dark:text-white text-sm">{application.bankName || '-'}</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs font-mono">{application.accountNumber || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents Section - Repositioned above approve/reject buttons */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                            📎 Uploaded Documents
                        </h3>
                        {application.documents && application.documents.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {application.documents.map((doc, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                    {doc.fileName || doc.file_name || doc.name || `Document ${index + 1}`}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {doc.documentType || doc.document_type || 'Document'}
                                                    {doc.fileSize && ` • ${(doc.fileSize / 1024).toFixed(1)} KB`}
                                                    {doc.file_size && ` • ${(doc.file_size / 1024).toFixed(1)} KB`}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownloadDocument(doc, index)}
                                            disabled={downloading[index]}
                                            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 text-white rounded-lg transition-colors text-sm font-medium"
                                        >
                                            {downloading[index] ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                    <span>Downloading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Download size={16} />
                                                    <span>Download</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <FileText className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">No documents uploaded</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">This application does not have any attached documents.</p>
                            </div>
                        )}
                    </div>

                    {/* Approve/Reject Buttons */}
                    {(application.status === 'submitted' ||
                        application.status === 'under-review') && (
                            <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() =>
                                        onUpdateStatus(application.id, 'approved')
                                    }
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                                >
                                    <CheckCircle size={20} />
                                    <span>Approve Application</span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() =>
                                        onUpdateStatus(application.id, 'rejected')
                                    }
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                                >
                                    <XCircle size={20} />
                                    <span>Reject Application</span>
                                </motion.button>
                            </div>
                        )}
                </div>
            </motion.div>
        </div>
    );
};

/* ======================================================
   MAIN ADMIN DASHBOARD
====================================================== */
const AdminDashboard = () => {
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabParam || 'overview');

    useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);
    const [applications, setApplications] = useState([]);
    const [payments, setPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedApplication, setSelectedApplication] = useState(null);
    const { success, error } = useNotification();

    const loadData = async () => {
        try {
            const { data: apps } = await adminHelpers.getAllApplications();
            const { data: pays } = await paymentHelpers.getAll();
            setApplications(apps || []);
            setPayments(pays || []);
        } catch {
            error('Failed to load dashboard');
        }
    };

    useEffect(() => {
        loadData();
        const channel = supabase
            .channel('admin-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, loadData)
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, []);

    /* ================= ANALYTICS ================= */
    const stats = useMemo(() => ({
        total: applications.length,
        pending: applications.filter(a => a.status === 'submitted' || a.status === 'under-review').length,
        approved: applications.filter(a => a.status === 'approved').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
        disbursed: payments.reduce((s, p) => s + (p.amount || 0), 0),
    }), [applications, payments]);

    const policyData = useMemo(() => {
        const map = {};
        applications.forEach(a => {
            const name = a.policyName || 'Unknown';
            map[name] = (map[name] || 0) + 1;
        });
        return Object.entries(map).map(([label, value]) => ({ label, value })).slice(0, 5);
    }, [applications]);

    const statusData = [
        { label: 'Approved', value: stats.approved, color: '#22c55e' },
        { label: 'Pending', value: stats.pending, color: '#eab308' },
        { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
    ];

    const filteredApplications = applications.filter(app => {
        const matchesSearch =
            app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.policyName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">Admin Dashboard</h1>

            {/* TABS */}
            <div className="flex flex-wrap sm:flex-nowrap gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl w-full sm:w-fit mb-8 border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
                {['overview', 'applications', 'analytics'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab
                            ? 'bg-slate-900 text-white shadow-md dark:bg-blue-600'
                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-400'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* OVERVIEW */}
                {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard label="Applications" value={stats.total} icon={<FileText />} color="blue" />
                            <StatCard label="Pending" value={stats.pending} icon={<Clock />} color="yellow" />
                            <StatCard label="Approved" value={stats.approved} icon={<CheckCircle />} color="green" />
                            <StatCard label="Disbursed" value={`₹${stats.disbursed.toLocaleString('en-IN')}`} icon={<TrendingUp />} color="purple" />
                        </div>
                    </motion.div>
                )}

                {/* APPLICATIONS */}
                {activeTab === 'applications' && (
                    <motion.div key="applications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                            {/* Search and Filter: Stack on mobile, row on desktop */}
                            <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 border-b dark:border-slate-700">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        placeholder="Search applications..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <select
                                    value={filterStatus}
                                    onChange={e => setFilterStatus(e.target.value)}
                                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-auto"
                                >
                                    <option value="all">All Status</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="under-review">Under Review</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            {/* Responsive Table Container */}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px]"> {/* Ensure min-w to force scroll on small devices */}
                                    <thead className="bg-slate-200 dark:bg-slate-950 border-b border-slate-300 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Applicant</th>
                                            <th className="px-6 py-4 text-left text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Policy</th>
                                            <th className="px-6 py-4 text-left text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredApplications.map(app => (
                                            <tr key={app.id} className="border-t hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="px-6 py-3">
                                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{app.applicantName}</div>
                                                    <div className="text-xs text-slate-500">{app.email}</div>
                                                </td>
                                                <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-300">{app.policyName}</td>
                                                <td className="px-6 py-3 text-sm text-slate-500 dark:text-slate-400">
                                                    {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : (app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-')}
                                                    <div className="text-xs text-slate-400">
                                                        {app.submittedAt ? new Date(app.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3"><StatusBadge status={app.status} /></td>
                                                <td className="px-6 py-3 text-right">
                                                    <button onClick={() => setSelectedApplication(app)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">View</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ANALYTICS */}
                {activeTab === 'analytics' && (
                    <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold mb-4 flex gap-2"><BarChart3 /> Popular Policies</h3>
                            <BarChart data={policyData} color="bg-purple-500" />
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold mb-4 flex gap-2"><PieIcon /> Application Status</h3>
                            <PieChart data={statusData} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedApplication && (
                    <ApplicationDetailsModal
                        application={selectedApplication}
                        onClose={() => setSelectedApplication(null)}
                        onUpdateStatus={async (id, status) => {
                            const { error: updateError } = await adminHelpers.updateApplicationStatus(id, status);
                            if (updateError) {
                                console.error(updateError);
                                error('Failed to update status');
                            } else {
                                success(`Application ${status}`);
                                loadData();
                                setSelectedApplication(null);
                            }
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;