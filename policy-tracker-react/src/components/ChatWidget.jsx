import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User, Bot, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const { t, language } = useLanguage();

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Initial welcome message
            setMessages([
                { id: 1, text: t('chat_welcome'), sender: 'bot' }
            ]);
        }
    }, [isOpen, t]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: inputText,
            sender: 'user'
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Call Gemini via backend
        generateResponse(inputText, [...messages, userMessage]);
    };

    const generateResponse = async (text, fullHistory) => {
        try {
            // Call the backend /api/chat endpoint (proxied by Vite in dev)
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    conversationHistory: fullHistory.filter(m => m.id !== 1), // exclude welcome msg
                    language: language,
                }),
            });

            if (!response.ok) {
                console.warn(`Chat API Error ${response.status}: Falling back to local mode.`);
                const fallback = getLocalResponse(text);
                addBotMessage(fallback);
                return;
            }

            const data = await response.json();
            addBotMessage(data.reply);
        } catch (error) {
            console.error('Chat API Error (Silent Fail):', error);
            // Fallback to local responses when backend is unavailable
            addBotMessage(getLocalResponse(text));
        }
    };

    const addBotMessage = (text) => {
        setMessages(prev => [...prev, {
            id: Date.now() + 1,
            text: text,
            sender: 'bot'
        }]);
        setIsTyping(false);
    };

    const getLocalResponse = (text) => {
        const lowerText = text.toLowerCase();

        // Greetings
        if (lowerText.match(/\b(hi|hello|hey|morning|evening|greetings|namaste|sat sri akal)\b/)) {
            return "Hello! 👋 I'm your PolicySetu assistant. I can help you with applying for schemes, checking status, or technical issues. How can I assist you today?";
        }

        // Gratitude
        if (lowerText.match(/\b(thanks|thank|thx|dhanyavaad|shukriya)\b/)) {
            return "You're welcome! 😊 Let me know if you need anything else.";
        }

        // Login / Register
        if (lowerText.match(/\b(login|signin|sign in|log in)\b/)) {
            return "You can log in to your account by clicking the 'Login' button in the top right corner. If you are a new user, please register first.";
        }
        if (lowerText.match(/\b(register|signup|sign up|create account)\b/)) {
            return "To create a new account, click 'Register' in the top right. You'll need your mobile number and basic details.";
        }

        // Application Process
        if (lowerText.match(/\b(apply|application|how to)\b/)) {
            return "To apply: 1. Login to your account. 2. Go to 'Policies'. 3. Select a scheme. 4. Click 'Apply Now' and fill the form.";
        }

        // Status / Tracking
        if (lowerText.match(/\b(status|track|check|where is my)\b/)) {
            return "You can track your application status in the 'My Applications' section after logging in. You'll see if it's Submitted, Under Review, or Approved.";
        }

        // Documents
        if (lowerText.match(/\b(document|upload|proof|aadhaar|pan)\b/)) {
            return "Commonly required documents include Aadhaar Card, Income Certificate, and Residence Proof. Accepted formats are PDF and JPEG (Max 5MB).";
        }

        // Eligibility
        if (lowerText.match(/\b(eligible|eligibility|who can|requirements)\b/)) {
            return "Eligibility varies by scheme. Please visit the 'Policies' page and click 'View Details' on a specific scheme to see its requirements.";
        }

        // Financial / Benefits
        if (lowerText.match(/\b(money|benefit|payment|amount|bank)\b/)) {
            return "Benefits are transferred directly to your linked bank account (DBT). You can view payment history in your Dashboard once approved.";
        }

        // Support / technical
        if (lowerText.match(/\b(help|support|contact|issue|error|stuck)\b/)) {
            return "If you're facing technical issues, you can visit the 'Support' page from the menu to raise a ticket, or describe your problem here.";
        }

        // Admin / Government
        if (lowerText.match(/\b(admin|staff|govt|officer)\b/)) {
            return "Administrative access is restricted to authorized government personnel. If you are an official, please use the specific Admin Login portal.";
        }

        // Default Fallback
        return "I'm not sure about that yet. 🤔 Try asking me about: \n• How to apply \n• Tracking application status \n• Required documents \n• Login issues";
    };

    // ─── Render markdown-like formatting from Gemini responses ───
    const formatBotMessage = (text) => {
        if (!text) return text;

        // Split by newlines and process each line
        const lines = text.split('\n');
        return lines.map((line, i) => {
            // Bold: **text**
            const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            // Bullet points
            if (line.trim().startsWith('- ') || line.trim().startsWith('• ') || line.trim().match(/^\d+\./)) {
                return (
                    <div key={i} className="ml-2 my-0.5" dangerouslySetInnerHTML={{ __html: formattedLine }} />
                );
            }

            // Empty lines as spacing
            if (line.trim() === '') {
                return <div key={i} className="h-1" />;
            }

            return (
                <div key={i} dangerouslySetInnerHTML={{ __html: formattedLine }} />
            );
        });
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-80 sm:w-96 mb-4 overflow-hidden pointer-events-auto border border-slate-200 dark:border-slate-700 flex flex-col max-h-[500px]"
                    >
                        {/* Header */}
                        <div className="bg-primary-600 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center space-x-2">
                                <div className="p-1.5 bg-white/20 rounded-full">
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">{t('chat_title')}</h3>
                                    <p className="text-xs text-primary-100 flex items-center">
                                        <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                                        AI Powered
                                    </p>
                                </div>
                            </div>
                            <button onClick={toggleChat} className="text-white/80 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800/50 min-h-[300px]">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'user'
                                            ? 'bg-primary-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700 rounded-bl-none'
                                            }`}
                                    >
                                        {msg.sender === 'bot' ? formatBotMessage(msg.text) : msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-700 flex space-x-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder={t('chat_placeholder')}
                                    className="w-full pl-4 pr-12 py-2.5 rounded-full border border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/40 outline-none text-sm bg-slate-50 dark:bg-slate-800 dark:text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className="absolute right-1.5 p-1.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleChat}
                className="pointer-events-auto w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors relative"
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
                {!isOpen && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
