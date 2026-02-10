import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const LanguageSelector = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'en', label: 'English', native: 'English' },
        { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
        { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    ];

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-primary-600 transition-colors"
            >
                <Globe size={18} />
                <span className="uppercase font-medium">{language}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden"
                        >
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setLanguage(lang.code);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between transition-colors ${language === lang.code
                                            ? 'text-primary-600 bg-primary-50 font-semibold'
                                            : 'text-slate-600'
                                        }`}
                                >
                                    <span>{lang.native}</span>
                                    {language === lang.code && (
                                        <motion.div
                                            layoutId="activeLang"
                                            className="w-1.5 h-1.5 rounded-full bg-primary-600"
                                        />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageSelector;
