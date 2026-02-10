import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileText, Calendar, IndianRupee, Users, Shield, Clock, Building } from 'lucide-react';
import { useState, useEffect } from 'react';
import { policyHelpers } from '../services/supabase';
import ApplicationForm from '../components/ApplicationForm';

const PolicyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [applicationSubmitted, setApplicationSubmitted] = useState(false);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const { data, error } = await policyHelpers.getById(id);
                if (!error && data) {
                    setPolicy(data);
                } else {
                    setPolicy(null);
                }
            } catch (error) {
                console.error("Failed to fetch policy:", error);
                setPolicy(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPolicy();
    }, [id]);

    const handleApplicationSubmit = (application) => {
        setShowApplicationForm(false);
        setApplicationSubmitted(true);

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
            setApplicationSubmitted(false);
        }, 5000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!policy) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Policy Not Found</h2>
                <Link to="/policies" className="btn-primary">Back to Policies</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-24 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <Link to="/policies" className="inline-flex items-center text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Policies
                    </Link>
                </motion.div>

                {/* Success Message */}
                <AnimatePresence>
                    {applicationSubmitted && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 bg-green-50 border border-green-200 rounded-xl p-6"
                        >
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="text-green-600" size={32} />
                                <div>
                                    <h3 className="text-lg font-bold text-green-800 dark:text-green-100">Application Submitted Successfully!</h3>
                                    <p className="text-green-700 dark:text-green-200">Your application has been received. Track it in <Link to="/my-applications" className="underline font-semibold">My Applications</Link></p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 rounded-2xl mb-8 border-t-4 border-primary-500"
                >
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-6">
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-primary-600">
                                    {policy.sector}
                                </span>
                                {policy.featured && (
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-secondary-500">
                                        ⭐ Featured
                                    </span>
                                )}
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${policy.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                    }`}>
                                    {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">{policy.name}</h1>
                            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-4">{policy.detailedDescription || policy.description}</p>
                            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-sm">
                                <Building size={16} />
                                <span>{policy.department}</span>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <div className="glass-card bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl text-center border border-primary-100 dark:border-primary-700/50">
                                <div className="text-sm text-primary-600 dark:text-primary-400 font-semibold mb-1">Benefit Amount</div>
                                <div className="text-3xl font-bold text-primary-700 dark:text-primary-300 mb-1">
                                    ₹{policy.benefitAmount?.toLocaleString('en-IN')}
                                </div>
                                <div className="text-xs text-primary-500 dark:text-primary-400">{policy.benefitType}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Info Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Eligibility */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6 rounded-2xl"
                    >
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                                <CheckCircle size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Eligibility Criteria</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Age Range</p>
                                <p className="text-slate-600 dark:text-slate-400">{policy.eligibility.ageMin} - {policy.eligibility.ageMax} years</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</p>
                                <p className="text-slate-600 dark:text-slate-400">{policy.eligibility.gender.join(', ')}</p>
                            </div>
                            {policy.eligibility.incomeMax && (
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Maximum Annual Income</p>
                                    <p className="text-slate-600 dark:text-slate-400">₹{(policy.eligibility.incomeMax / 100000).toFixed(1)} Lakhs</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Occupation</p>
                                <p className="text-slate-600 dark:text-slate-400">{policy.eligibility.occupation.join(', ')}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Beneficiary Categories</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {policy.eligibility.beneficiaryCategory.map((cat, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-full border border-green-200 dark:border-green-800">
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Documents */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-6 rounded-2xl"
                    >
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <FileText size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Required Documents</h2>
                        </div>
                        <ul className="space-y-3">
                            {policy.documents.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="mr-3 text-blue-500 mt-1">•</span>
                                    <span className="text-slate-600 dark:text-slate-400">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Key Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
                >
                    <div className="glass-card p-4 rounded-xl flex items-center space-x-3">
                        <Calendar className="text-primary-500" size={24} />
                        <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Deadline</div>
                            <div className="text-slate-800 dark:text-slate-100 font-medium">
                                {new Date(policy.applicationDeadline).toLocaleDateString('en-IN')}
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-4 rounded-xl flex items-center space-x-3">
                        <Clock className="text-primary-500" size={24} />
                        <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Processing Time</div>
                            <div className="text-slate-800 dark:text-slate-100 font-medium">{policy.processingTime}</div>
                        </div>
                    </div>
                    <div className="glass-card p-4 rounded-xl flex items-center space-x-3">
                        <Shield className="text-primary-500" size={24} />
                        <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Verification</div>
                            <div className="text-slate-800 dark:text-slate-100 font-medium">Digital API</div>
                        </div>
                    </div>
                </motion.div>

                {/* Amendment History */}
                {policy.amendments && policy.amendments.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="glass-card p-6 rounded-2xl mb-8"
                    >
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Amendment History</h2>
                        <div className="space-y-3">
                            {policy.amendments.map((amendment, idx) => (
                                <div key={idx} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                                    <Calendar className="text-slate-400 mt-1" size={16} />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{amendment.description}</p>
                                        <p className="text-xs text-slate-500">{new Date(amendment.date).toLocaleDateString('en-IN')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Apply Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                >
                    <button
                        onClick={() => setShowApplicationForm(true)}
                        className="btn-primary text-lg px-8 py-4 w-full md:w-auto"
                    >
                        Apply Now
                    </button>
                    <p className="mt-4 text-sm text-slate-500">
                        Fill out the application form to submit your request
                    </p>
                </motion.div>
            </div>

            {/* Application Form Modal */}
            <AnimatePresence>
                {showApplicationForm && (
                    <ApplicationForm
                        policy={policy}
                        onClose={() => setShowApplicationForm(false)}
                        onSubmit={handleApplicationSubmit}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default PolicyDetail;
