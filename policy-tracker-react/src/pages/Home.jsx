import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, FileText, TrendingUp, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <motion.h1
                            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-500 via-slate-500 to-green-600 dark:via-white bg-clip-text text-transparent"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            {t('hero_title')}
                        </motion.h1>

                        <motion.p
                            className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            {t('hero_subtitle')}
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                        >
                            <Link to="/login" className="btn-primary inline-flex items-center justify-center space-x-2">
                                <span>{t('nav_login')}</span>
                                <ArrowRight size={20} />
                            </Link>
                            <Link to="/register" className="btn-secondary inline-flex items-center justify-center">
                                {t('nav_register')}
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-white/50 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold text-center mb-16"
                    >
                        Why Choose Our Platform?
                    </motion.h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Shield className="w-12 h-12 text-primary-500" />}
                            title={t('feat_secure')}
                            description="Government-grade security for all your data and applications"
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={<FileText className="w-12 h-12 text-primary-500" />}
                            title={t('feat_fast')}
                            description="Simple online forms with document upload support"
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<Users className="w-12 h-12 text-primary-500" />}
                            title={t('feat_support')}
                            description="24/7 Support for all your queries"
                            delay={0.3}
                        />
                        <FeatureCard
                            icon={<Users className="w-12 h-12 text-primary-500" />}
                            title="Citizen First"
                            description="Designed with citizens' needs at the forefront"
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        <StatCard number="100+" label="Active Policies" delay={0.1} />
                        <StatCard number="10K+" label="Applications Processed" delay={0.2} />
                        <StatCard number="₹50Cr+" label="Benefits Disbursed" delay={0.3} />
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        whileHover={{ y: -10, scale: 1.02 }}
        className="glass-card p-8 rounded-2xl text-center group hover:shadow-2xl transition-all duration-300"
    >
        <motion.div
            className="mb-4 inline-block"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
        >
            {icon}
        </motion.div>
        <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400">{description}</p>
    </motion.div>
);

const StatCard = ({ number, label, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        className="glass-card p-8 rounded-2xl text-center border-t-4 border-primary-500"
    >
        <motion.div
            className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: delay + 0.3 }}
        >
            {number}
        </motion.div>
        <div className="text-slate-600 dark:text-slate-400 font-medium">{label}</div>
    </motion.div>
);

export default Home;
