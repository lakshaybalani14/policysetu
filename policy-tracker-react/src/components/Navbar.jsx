import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, X, User, LogOut, Sun, Moon, Bell, Check, CircleHelp } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import supabase, { notificationHelpers } from '../services/supabase';
import LanguageSelector from './LanguageSelector';

const Navbar = ({ user, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { t } = useLanguage();
    const { isDarkMode, toggleTheme } = useTheme();

    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const { info: toastInfo } = useNotification();
    const notificationRef = useRef(null);

    // Close notification dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch and Subscribe to Notifications
    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            const { data } = await notificationHelpers.getUserNotifications(user.id);
            if (data) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            }
        };

        fetchNotifications();

        // Real-time subscription
        const subscription = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    const newNotification = payload.new;
                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    toastInfo(newNotification.message); // Show toast
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user, toastInfo]);

    const handleMarkAsRead = async (id) => {
        await notificationHelpers.markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleMarkAllAsRead = async () => {
        await notificationHelpers.markAllAsRead(user.id);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-slate-200/50 dark:bg-slate-900/80 dark:border-slate-800/50 backdrop-blur-lg"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent"
                        >
                            PolicySetu
                        </motion.div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {!user && <NavLink to="/">{t('nav_home')}</NavLink>}
                        {user && user.role !== 'admin' && (
                            <NavLink to="/policies">{t('nav_policies')}</NavLink>
                        )}
                        {user && (
                            <>
                                {['citizen', 'user', 'admin'].includes(user.role) && (
                                    <>
                                        <NavLink to="/dashboard">{t('nav_dashboard')}</NavLink>
                                    </>
                                )}
                                {user.role === 'admin' && <NavLink to="/admin">{t('nav_admin')}</NavLink>}
                                {user.role === 'government' && <NavLink to="/government">{t('nav_govt')}</NavLink>}
                            </>
                        )}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-primary-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-primary-400 transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <LanguageSelector />
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                {/* Notification Bell */}
                                <div className="relative" ref={notificationRef}>
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors relative"
                                    >
                                        <Bell size={20} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                                        )}
                                    </button>

                                    {/* Notification Dropdown */}
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                                        >
                                            <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={handleMarkAllAsRead}
                                                        className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                                                    >
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.length > 0 ? (
                                                    notifications.map((notification) => (
                                                        <div
                                                            key={notification.id}
                                                            className={`p-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                                            onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.is_read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                                                <div>
                                                                    <p className={`text-sm ${!notification.is_read ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                                                                        {notification.title}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 line-clamp-2">
                                                                        {notification.message}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-400 mt-1">
                                                                        {new Date(notification.created_at).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                                                        No notifications yet
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                <Link
                                    to="/support"
                                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-primary-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-primary-400 transition-colors"
                                    title={t('nav_support')}
                                >
                                    <CircleHelp size={20} />
                                </Link>
                                <Link
                                    to="/profile"
                                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-primary-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-primary-400 transition-colors"
                                    title={t('nav_profile')}
                                >
                                    <User size={20} />
                                </Link>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onLogout}
                                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                >
                                    <LogOut size={18} />
                                    <span>{t('nav_logout')}</span>
                                </motion.button>
                            </>
                        ) : (
                            <>
                                {/* Buttons removed for cleanliness as per user request */}
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-primary-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-primary-400 transition-colors"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <LanguageSelector />
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg hover:bg-slate-100"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg dark:bg-slate-900/95 dark:border-slate-800"
                >
                    <div className="px-4 py-4 space-y-3">
                        {!user && (
                            <MobileNavLink to="/" onClick={() => setIsMenuOpen(false)}>
                                {t('nav_home')}
                            </MobileNavLink>
                        )}
                        {user && user.role !== 'admin' && (
                            <MobileNavLink to="/policies" onClick={() => setIsMenuOpen(false)}>
                                {t('nav_policies')}
                            </MobileNavLink>
                        )}
                        {user && (
                            <>
                                {['citizen', 'user', 'admin'].includes(user.role) && (
                                    <>
                                        <MobileNavLink to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                                            {t('nav_dashboard')}
                                        </MobileNavLink>
                                    </>
                                )}
                                {user.role === 'admin' && (
                                    <MobileNavLink to="/admin" onClick={() => setIsMenuOpen(false)}>
                                        {t('nav_admin')}
                                    </MobileNavLink>
                                )}
                                {user.role === 'government' && (
                                    <MobileNavLink to="/government" onClick={() => setIsMenuOpen(false)}>
                                        {t('nav_govt')}
                                    </MobileNavLink>
                                )}
                                <MobileNavLink to="/support" onClick={() => setIsMenuOpen(false)}>
                                    {t('nav_support')}
                                </MobileNavLink>
                                <MobileNavLink to="/profile" onClick={() => setIsMenuOpen(false)}>
                                    {t('nav_profile')}
                                </MobileNavLink>
                                <MobileNavLink to="#" onClick={onLogout} className="text-red-600">
                                    {t('nav_logout')}
                                </MobileNavLink>
                            </>
                        )}
                        {!user && (
                            <>
                                {/* Buttons removed for cleanliness as per user request */}
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
};

const NavLink = ({ to, children }) => (
    <Link
        to={to}
        className="text-slate-600 hover:text-primary-600 font-medium transition-colors relative group"
    >
        {children}
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300" />
    </Link>
);

const MobileNavLink = ({ to, children, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className="block px-4 py-2 rounded-lg text-slate-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
    >
        {children}
    </Link>
);

export default Navbar;
