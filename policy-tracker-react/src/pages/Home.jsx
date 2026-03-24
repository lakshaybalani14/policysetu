import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import {
    ArrowRight, Shield, FileText, TrendingUp, Users,
    CheckCircle, Zap, Globe, Clock, Star, ChevronRight,
    Search, Upload, Bell, Sparkles, Heart, Award
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Footer from '../components/Footer';

const Home = () => {
    const { t } = useLanguage();
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <div className="min-h-screen overflow-hidden">
            {/* ═══════════════════════════════════ HERO ═══════════════════════════════════ */}
            <section ref={heroRef} className="relative min-h-[92vh] flex items-center justify-center px-4 overflow-hidden">
                {/* Animated gradient orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-10"
                        style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)' }}
                        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20 dark:opacity-10"
                        style={{ background: 'radial-gradient(circle, #16a34a 0%, transparent 70%)' }}
                        animate={{ scale: [1, 1.15, 1], x: [0, -40, 0], y: [0, 30, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full opacity-15 dark:opacity-5"
                        style={{ background: 'radial-gradient(circle, #0c8ce9 0%, transparent 70%)' }}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>

                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative max-w-5xl mx-auto text-center z-10">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/80 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8 backdrop-blur-sm border border-primary-200/50 dark:border-primary-700/30"
                    >
                        <Sparkles size={16} className="text-primary-500" />
                        <span>A Digital India Initiative</span>
                        <ChevronRight size={14} />
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-[1.05] tracking-tight"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.15 }}
                    >
                        <span className="bg-gradient-to-r from-orange-500 via-slate-700 to-green-600 dark:from-orange-400 dark:via-white dark:to-green-400 bg-clip-text text-transparent">
                            {t('hero_title')}
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        className="text-lg sm:text-xl md:text-2xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        {t('hero_subtitle')}
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.45 }}
                    >
                        <Link
                            to="/login"
                            className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/30 hover:scale-105 transition-all duration-300"
                        >
                            {t('nav_login')}
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-lg transition-all duration-300"
                        >
                            {t('nav_register')}
                        </Link>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                        className="mt-14 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-slate-400 dark:text-slate-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                    >
                        {[
                            { icon: Shield, text: 'Government Secured' },
                            { icon: Users, text: '10K+ Citizens' },
                            { icon: CheckCircle, text: '₹50Cr+ Disbursed' },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-2 text-sm">
                                <Icon size={16} className="text-primary-500" />
                                <span>{text}</span>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-6 h-10 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-start justify-center p-1.5">
                        <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-primary-500"
                            animate={{ y: [0, 16, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            </section>

            {/* ═══════════════════════════════ KEY FEATURES ═══════════════════════════════ */}
            <section className="py-24 px-4 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-50/30 to-transparent dark:via-primary-950/20" />
                <div className="relative max-w-7xl mx-auto">
                    <SectionHeader
                        tag="Platform Features"
                        title="Why Choose PolicySetu?"
                        subtitle="Everything you need to discover, apply, and track government schemes — all in one modern platform."
                    />

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
                        {[
                            {
                                icon: Shield,
                                title: t('feat_secure'),
                                description: 'Government-grade encryption protects your data and personal documents at every step.',
                                gradient: 'from-blue-500 to-cyan-400',
                            },
                            {
                                icon: Zap,
                                title: t('feat_fast'),
                                description: 'Streamlined digital pipeline processes applications in days, not months.',
                                gradient: 'from-orange-500 to-amber-400',
                            },
                            {
                                icon: Globe,
                                title: 'Multi-Language',
                                description: 'Access the platform in English, Hindi, Punjabi, and more regional languages.',
                                gradient: 'from-green-500 to-emerald-400',
                            },
                            {
                                icon: Heart,
                                title: t('feat_support'),
                                description: 'AI-powered chat assistant and human support available around the clock.',
                                gradient: 'from-purple-500 to-pink-400',
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                whileHover={{ y: -8 }}
                                className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-7 border border-slate-100 dark:border-slate-700/60 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-500"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon size={22} className="text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>

                                {/* Hover glow */}
                                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${feature.gradient} blur-3xl -z-10 scale-90`} style={{ opacity: 0.06 }} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════ HOW IT WORKS ═══════════════════════════════ */}
            <section className="py-24 px-4 bg-white/50 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <SectionHeader
                        tag="Simple Process"
                        title="How It Works"
                        subtitle="Get started in three simple steps — no paperwork, no long queues."
                    />

                    <div className="grid md:grid-cols-3 gap-8 mt-16 relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-20 left-[16.5%] right-[16.5%] h-0.5 bg-gradient-to-r from-primary-300 via-primary-500 to-green-400 dark:from-primary-700 dark:via-primary-500 dark:to-green-600" />

                        {[
                            {
                                step: '01',
                                icon: Search,
                                title: 'Discover Schemes',
                                description: 'Browse hundreds of central and state government schemes filtered by your eligibility, income, sector, and more.',
                                color: 'from-primary-500 to-primary-600',
                            },
                            {
                                step: '02',
                                icon: Upload,
                                title: 'Apply Online',
                                description: 'Fill in a simple digital form, upload your documents, and submit — all from the comfort of your home.',
                                color: 'from-orange-500 to-orange-600',
                            },
                            {
                                step: '03',
                                icon: Bell,
                                title: 'Track & Receive',
                                description: 'Get real-time status updates via notifications and receive benefits directly into your bank account.',
                                color: 'from-green-500 to-green-600',
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.15 }}
                                className="relative text-center"
                            >
                                {/* Step circle */}
                                <div className="relative z-10 mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br shadow-xl flex items-center justify-center mb-6" style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }}>
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} shadow-xl flex items-center justify-center`}>
                                        <item.icon size={28} className="text-white" />
                                    </div>
                                </div>

                                <span className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-2 block">Step {item.step}</span>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{item.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════ IMPACT STATS ═══════════════════════════════ */}
            <section className="py-24 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900" />
                <div className="absolute inset-0 opacity-10">
                    <div style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                        backgroundSize: '32px 32px',
                        width: '100%',
                        height: '100%'
                    }} />
                </div>

                <div className="relative max-w-7xl mx-auto text-center">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-primary-400 text-sm font-semibold uppercase tracking-widest mb-4"
                    >
                        Our Impact
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-bold text-white mb-16"
                    >
                        Numbers That Speak
                    </motion.h2>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                        {[
                            { number: '100+', label: 'Active Policies', icon: FileText },
                            { number: '10K+', label: 'Applications Processed', icon: TrendingUp },
                            { number: '₹50Cr+', label: 'Benefits Disbursed', icon: Award },
                            { number: '3', label: 'Languages Supported', icon: Globe },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="relative group"
                            >
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-500 group-hover:border-primary-500/30">
                                    <stat.icon size={24} className="text-primary-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                    <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">{stat.number}</div>
                                    <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════ POPULAR SCHEMES ═══════════════════════════════ */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <SectionHeader
                        tag="Trending"
                        title="Popular Government Schemes"
                        subtitle="Most applied schemes by citizens across India"
                    />

                    <div className="grid md:grid-cols-3 gap-6 mt-16">
                        {[
                            {
                                name: t('policy_name_1'),
                                desc: t('policy_desc_1'),
                                tag: 'Agriculture',
                                tagColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                benefit: '₹6,000/year',
                            },
                            {
                                name: t('policy_name_3'),
                                desc: t('policy_desc_3'),
                                tag: 'Health',
                                tagColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
                                benefit: '₹5 Lakh/year',
                            },
                            {
                                name: t('policy_name_5'),
                                desc: t('policy_desc_5'),
                                tag: 'MSME',
                                tagColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                                benefit: 'Up to ₹10 Lakh',
                            },
                        ].map((scheme, i) => (
                            <motion.div
                                key={scheme.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                whileHover={{ y: -6 }}
                                className="group bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden hover:shadow-2xl hover:shadow-primary-100/30 dark:hover:shadow-primary-900/20 transition-all duration-500"
                            >
                                {/* Card top gradient bar */}
                                <div className="h-1.5 bg-gradient-to-r from-orange-500 via-primary-500 to-green-500" />
                                <div className="p-7">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${scheme.tagColor}`}>
                                            {scheme.tag}
                                        </span>
                                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                                            {scheme.benefit}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-1">{scheme.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5 line-clamp-2">{scheme.desc}</p>
                                    <Link
                                        to="/policies"
                                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 group-hover:gap-3 transition-all duration-300"
                                    >
                                        View Details
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mt-12"
                    >
                        <Link
                            to="/policies"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 transition-all duration-300"
                        >
                            View All Policies
                            <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════ TESTIMONIALS ═══════════════════════════════ */}
            <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900/30">
                <div className="max-w-7xl mx-auto">
                    <SectionHeader
                        tag="Testimonials"
                        title="What Citizens Say"
                        subtitle="Real stories from people who benefited through our platform"
                    />

                    <div className="grid md:grid-cols-3 gap-6 mt-16">
                        {[
                            {
                                name: 'Ramesh Kumar',
                                role: 'Farmer, Uttar Pradesh',
                                text: 'I received PM-KISAN benefits within 15 days of applying through PolicySetu. The process was so simple and hassle-free!',
                                rating: 5,
                            },
                            {
                                name: 'Priya Sharma',
                                role: 'Student, Rajasthan',
                                text: 'Got my scholarship approved quickly! The multilingual support helped my family understand and fill the forms in Hindi easily.',
                                rating: 5,
                            },
                            {
                                name: 'Arjun Patel',
                                role: 'Small Business Owner, Gujarat',
                                text: 'The MUDRA loan application was straightforward. I could track every step of my application in real-time. Truly a digital revolution!',
                                rating: 5,
                            },
                        ].map((testimonial, i) => (
                            <motion.div
                                key={testimonial.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                                className="bg-white dark:bg-slate-800/80 rounded-2xl p-7 border border-slate-100 dark:border-slate-700/50 relative"
                            >
                                {/* Quote mark */}
                                <div className="absolute top-5 right-6 text-6xl font-serif text-primary-100 dark:text-primary-900/30 leading-none select-none">"</div>

                                <div className="flex gap-1 mb-4">
                                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                                        <Star key={j} size={16} className="fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 relative z-10">
                                    "{testimonial.text}"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm text-slate-800 dark:text-white">{testimonial.name}</div>
                                        <div className="text-xs text-slate-400">{testimonial.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════ CTA SECTION ═══════════════════════════════ */}
            <section className="py-24 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-500 to-green-500" />
                <div className="absolute inset-0 opacity-10">
                    <div style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                        backgroundSize: '24px 24px',
                        width: '100%',
                        height: '100%'
                    }} />
                </div>

                <div className="relative max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Sparkles className="mx-auto mb-6 text-white/80" size={36} />
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Ready to access your entitled benefits?
                        </h2>
                        <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
                            Create your free account today and start exploring hundreds of government schemes tailored for you.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                            >
                                Get Started Free
                                <ArrowRight size={20} />
                            </Link>
                            <Link
                                to="/policies"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg text-white border-2 border-white/30 hover:bg-white/10 transition-all duration-300"
                            >
                                Explore Policies
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════ FOOTER ═══════════════════════════════ */}
            <Footer />
        </div>
    );
};

/* ═══════════════════════════════ REUSABLE SECTION HEADER ═══════════════════════════════ */
const SectionHeader = ({ tag, title, subtitle }) => (
    <div className="text-center max-w-2xl mx-auto">
        <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary-600 dark:text-primary-400 text-sm font-semibold uppercase tracking-widest mb-3"
        >
            {tag}
        </motion.p>
        <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4"
        >
            {title}
        </motion.h2>
        <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 leading-relaxed"
        >
            {subtitle}
        </motion.p>
    </div>
);

export default Home;
