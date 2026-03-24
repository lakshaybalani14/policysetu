import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="relative bg-slate-900 text-slate-300 overflow-hidden">
            {/* Decorative gradient line at top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-primary-500 to-green-500" />

            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
                    {/* Brand Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-1"
                    >
                        <Link to="/" className="inline-block mb-4">
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
                                PolicySetu
                            </span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Bridging the gap between citizens and government welfare schemes through a transparent,
                            secure, and accessible digital platform.
                        </p>
                        <div className="flex space-x-3">
                            {['twitter', 'facebook', 'linkedin', 'youtube'].map((social) => (
                                <a
                                    key={social}
                                    href="#"
                                    className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-primary-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary-600/25"
                                    aria-label={social}
                                >
                                    <span className="text-xs font-bold uppercase text-slate-400 hover:text-white">
                                        {social.charAt(0).toUpperCase()}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Quick Links</h3>
                        <ul className="space-y-3">
                            {[
                                { label: 'Browse Policies', to: '/policies' },
                                { label: 'Dashboard', to: '/dashboard' },
                                { label: 'My Applications', to: '/my-applications' },
                                { label: 'Support Center', to: '/support' },
                                { label: 'Login', to: '/login' },
                            ].map((link) => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="text-slate-400 hover:text-primary-400 transition-colors duration-300 text-sm flex items-center gap-1.5 group"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-primary-400 transition-colors" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Popular Schemes */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Popular Schemes</h3>
                        <ul className="space-y-3">
                            {[
                                'PM-KISAN',
                                'Ayushman Bharat',
                                'MUDRA Loans',
                                'Skill India',
                                'PM Awas Yojana',
                            ].map((scheme) => (
                                <li key={scheme}>
                                    <Link
                                        to="/policies"
                                        className="text-slate-400 hover:text-primary-400 transition-colors duration-300 text-sm flex items-center gap-1.5 group"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-primary-400 transition-colors" />
                                        {scheme}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Mail size={16} className="text-primary-400 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-400 text-sm">support@policysetu.gov.in</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone size={16} className="text-primary-400 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-400 text-sm">1800-XXX-XXXX (Toll Free)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin size={16} className="text-primary-400 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-400 text-sm">Ministry of Digital Governance,<br />New Delhi, India</span>
                            </li>
                        </ul>
                        <a
                            href="#"
                            className="mt-5 inline-flex items-center gap-1.5 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                        >
                            <ExternalLink size={14} />
                            Visit india.gov.in
                        </a>
                    </motion.div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-500 text-xs">
                            © {new Date().getFullYear()} PolicySetu. A Digital India Initiative. All rights reserved.
                        </p>
                        <div className="flex items-center space-x-6">
                            {['Privacy Policy', 'Terms of Service', 'Accessibility'].map((item) => (
                                <a key={item} href="#" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
