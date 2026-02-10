import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Plus, Send, Search, Filter, Clock, CheckCircle, AlertCircle, ChevronLeft, User } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { ticketHelpers } from '../services/supabase';

const Support = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { success, error } = useNotification();

    // Data Loading
    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        setLoading(true);
        const { data, error: err } = await ticketHelpers.getUserTickets();
        if (err) {
            console.error(err);
            error("Failed to load tickets");
        } else {
            setTickets(data || []);
        }
        setLoading(false);
    };

    const handleCreateTicket = async (formData) => {
        const { error: err } = await ticketHelpers.createTicket(formData);
        if (err) {
            error("Failed to create ticket");
            return;
        }
        success("Support ticket created successfully");
        setIsNewTicketOpen(false);
        loadTickets();
    };

    const handleSelectTicket = async (ticket) => {
        // Optimistic set
        setSelectedTicket(ticket);
        // Fetch full details including replies
        const { data, error: err } = await ticketHelpers.getTicketDetails(ticket.id);
        if (err) {
            console.error(err);
            error("Failed to load ticket details");
        } else {
            setSelectedTicket(data);
        }
    };

    return (
        <div className="min-h-screen py-20 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-6xl mx-auto h-[600px] bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden flex border border-slate-200 dark:border-slate-700">

                {/* Left Sidebar: Ticket List */}
                <div className={`w-full md:w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col ${selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                        <h2 className="font-bold text-slate-800 dark:text-slate-100">My Tickets</h2>
                        <button
                            onClick={() => setIsNewTicketOpen(true)}
                            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading ? (
                            <div className="text-center py-8 text-slate-400">Loading...</div>
                        ) : tickets.length > 0 ? (
                            tickets.map(ticket => (
                                <div
                                    key={ticket.id}
                                    onClick={() => handleSelectTicket(ticket)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedTicket?.id === ticket.id ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800' : 'bg-white dark:bg-slate-800 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{ticket.subject}</h3>
                                        <StatusBadge status={ticket.status} />
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{ticket.description}</p>
                                    <div className="flex justify-between items-center text-xs text-slate-400">
                                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                                        <span className={`px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700`}>{ticket.category}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-slate-500">
                                <MessageSquare size={48} className="mx-auto mb-2 opacity-20" />
                                <p>No tickets yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Area: Ticket Details / Chat */}
                <div className={`w-full md:w-2/3 flex flex-col ${!selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                    {selectedTicket ? (
                        <ChatView
                            ticket={selectedTicket}
                            onBack={() => setSelectedTicket(null)}
                            onReplySuccess={(updatedTicket) => setSelectedTicket(prev => ({ ...prev, ...updatedTicket }))} // Update locally if needed
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                            <MessageSquare size={64} className="mb-4 opacity-20" />
                            <p className="text-lg font-medium">Select a ticket to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* New Ticket Modal */}
            {isNewTicketOpen && (
                <NewTicketModal
                    onClose={() => setIsNewTicketOpen(false)}
                    onSubmit={handleCreateTicket}
                />
            )}
        </div>
    );
};

// Sub-components

const ChatView = ({ ticket, onBack, onReplySuccess }) => {
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const { success, error } = useNotification();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [ticket.ticket_replies]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!reply.trim()) return;

        setSending(true);
        const { data, error: err } = await ticketHelpers.replyToTicket(ticket.id, reply);
        if (err) {
            error("Failed to send reply");
        } else {
            // Manually append the new reply to the UI state for instant feedback
            if (ticket.ticket_replies) {
                ticket.ticket_replies.push(data);
            } else {
                ticket.ticket_replies = [data];
            }
            onReplySuccess({ ticket_replies: [...(ticket.ticket_replies || [])] });
            setReply('');
        }
        setSending(false);
    };

    return (
        <>
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-4">
                <button onClick={onBack} className="md:hidden p-2 hover:bg-slate-100 rounded-lg">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex-1">
                    <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">{ticket.subject}</h2>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="capitalize">Priority: {ticket.priority}</span>
                        <span>•</span>
                        <span>Reference: #{ticket.id.slice(0, 8)}</span>
                    </div>
                </div>
                <StatusBadge status={ticket.status} />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/30">
                {/* Original Description */}
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-slate-500" />
                    </div>
                    <div className="flex-1">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl rounded-tl-none shadow-sm border border-slate-200 dark:border-slate-700">
                            <p className="text-slate-800 dark:text-slate-200 text-sm whitespace-pre-wrap">{ticket.description}</p>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 ml-1">{new Date(ticket.created_at).toLocaleString()}</p>
                    </div>
                </div>

                {/* Replies */}
                {ticket.ticket_replies?.map((msg) => (
                    <div key={msg.id} className={`flex gap-4 ${msg.is_admin_reply ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.is_admin_reply ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                            <User size={16} />
                        </div>
                        <div className={`flex-1 flex flex-col ${msg.is_admin_reply ? 'items-end' : 'items-start'}`}>
                            <div className={`p-4 rounded-xl shadow-sm max-w-[80%] ${msg.is_admin_reply ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none'}`}>
                                <p className={`text-sm whitespace-pre-wrap ${msg.is_admin_reply ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{msg.message}</p>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 mx-1">{new Date(msg.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type your reply..."
                        disabled={ticket.status === 'closed'}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!reply.trim() || sending || ticket.status === 'closed'}
                        className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </>
    );
};

const NewTicketModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        subject: '',
        category: 'other',
        priority: 'medium',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Create Support Ticket</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                        <input
                            type="text"
                            required
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700/50"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700/50"
                            >
                                <option value="other">Other</option>
                                <option value="technical">Technical</option>
                                <option value="policy">Policy Inquiry</option>
                                <option value="payment">Payment Issue</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700/50"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700/50 resize-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Submit Ticket
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        open: 'bg-blue-100 text-blue-700',
        'in-progress': 'bg-yellow-100 text-yellow-700',
        resolved: 'bg-green-100 text-green-700',
        closed: 'bg-slate-100 text-slate-700',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[status] || styles.open}`}>
            {status}
        </span>
    );
};

export default Support;
