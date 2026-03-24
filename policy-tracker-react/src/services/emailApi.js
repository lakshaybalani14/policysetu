// Frontend helper to call email API
// In production (Vercel): calls /api/email?action=xxx (serverless function)
// In development: calls http://localhost:5000/api/email/xxx (Express server)

const isDev = import.meta.env.DEV;
const EXPRESS_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const callEmailApi = async (action, body) => {
    try {
        const url = isDev
            ? `${EXPRESS_URL}/api/email/${action}`
            : `/api/email?action=${action}`;

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return res.json();
    } catch (err) {
        console.error(`[EmailApi] ${action} error:`, err);
        return { success: false };
    }
};

const emailApi = {
    sendOtp: (email) => callEmailApi('send-otp', { email }),
    verifyOtp: (email, otp) => callEmailApi('verify-otp', { email, otp }),
    sendWelcome: (name, email) => callEmailApi('welcome', { name, email }),
    sendApplicationSubmitted: (name, email, policyName, applicationId) =>
        callEmailApi('application-submitted', { name, email, policyName, applicationId }),
    sendApplicationStatus: (name, email, policyName, status, remarks) =>
        callEmailApi('application-status', { name, email, policyName, status, remarks }),
    sendPayment: (name, email, policyName, amount) =>
        callEmailApi('payment', { name, email, policyName, amount }),
    sendTicketCreated: (name, email, subject, ticketId) =>
        callEmailApi('ticket-created', { name, email, subject, ticketId }),
    sendTicketStatus: (name, email, subject, status) =>
        callEmailApi('ticket-status', { name, email, subject, status }),
};

export default emailApi;
