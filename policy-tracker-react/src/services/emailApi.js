// Frontend helper to call the Express server email API
// The server runs on port 5000 (or env-configured)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const emailApi = {
    // Send OTP to email
    sendOtp: async (email) => {
        const res = await fetch(`${API_BASE}/api/email/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        return res.json();
    },

    // Verify OTP
    verifyOtp: async (email, otp) => {
        const res = await fetch(`${API_BASE}/api/email/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });
        return res.json();
    },

    // Send welcome email
    sendWelcome: async (name, email) => {
        try {
            const res = await fetch(`${API_BASE}/api/email/welcome`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            });
            return res.json();
        } catch (err) {
            console.error('[EmailApi] welcome error:', err);
            return { success: false };
        }
    },

    // Send application submitted email
    sendApplicationSubmitted: async (name, email, policyName, applicationId) => {
        try {
            const res = await fetch(`${API_BASE}/api/email/application-submitted`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, policyName, applicationId }),
            });
            return res.json();
        } catch (err) {
            console.error('[EmailApi] application-submitted error:', err);
            return { success: false };
        }
    },

    // Send application status email
    sendApplicationStatus: async (name, email, policyName, status, remarks) => {
        try {
            const res = await fetch(`${API_BASE}/api/email/application-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, policyName, status, remarks }),
            });
            return res.json();
        } catch (err) {
            console.error('[EmailApi] application-status error:', err);
            return { success: false };
        }
    },

    // Send payment email
    sendPayment: async (name, email, policyName, amount) => {
        try {
            const res = await fetch(`${API_BASE}/api/email/payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, policyName, amount }),
            });
            return res.json();
        } catch (err) {
            console.error('[EmailApi] payment error:', err);
            return { success: false };
        }
    },

    // Send ticket created email
    sendTicketCreated: async (name, email, subject, ticketId) => {
        try {
            const res = await fetch(`${API_BASE}/api/email/ticket-created`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, ticketId }),
            });
            return res.json();
        } catch (err) {
            console.error('[EmailApi] ticket-created error:', err);
            return { success: false };
        }
    },

    // Send ticket status email
    sendTicketStatus: async (name, email, subject, status) => {
        try {
            const res = await fetch(`${API_BASE}/api/email/ticket-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, status }),
            });
            return res.json();
        } catch (err) {
            console.error('[EmailApi] ticket-status error:', err);
            return { success: false };
        }
    },
};

export default emailApi;
