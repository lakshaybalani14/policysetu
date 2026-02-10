import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);

        if (duration) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const success = (msg) => addNotification(msg, 'success');
    const error = (msg) => addNotification(msg, 'error');
    const info = (msg) => addNotification(msg, 'info');
    const warning = (msg) => addNotification(msg, 'warning');

    return (
        <NotificationContext.Provider value={{ addNotification, removeNotification, success, error, info, warning }}>
            {children}
            <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
                <AnimatePresence>
                    {notifications.map(notification => (
                        <Toast
                            key={notification.id}
                            {...notification}
                            onClose={() => removeNotification(notification.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

const Toast = ({ id, message, type, onClose }) => {
    const icons = {
        success: <CheckCircle size={20} className="text-green-500" />,
        error: <AlertCircle size={20} className="text-red-500" />,
        warning: <AlertTriangle size={20} className="text-yellow-500" />,
        info: <Info size={20} className="text-blue-500" />
    };

    const bgColors = {
        success: 'bg-white border-green-100',
        error: 'bg-white border-red-100',
        warning: 'bg-white border-yellow-100',
        info: 'bg-white border-blue-100'
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-lg border ${bgColors[type] || bgColors.info} backdrop-blur-md`}
        >
            <div className="flex-shrink-0 mr-3 mt-0.5">
                {icons[type] || icons.info}
            </div>
            <div className="flex-1 mr-2">
                <p className="text-sm font-medium text-slate-800">{message}</p>
            </div>
            <button
                onClick={onClose}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};
