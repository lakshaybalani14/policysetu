import { Resend } from 'resend';
import dotenv from 'dotenv';
import {
    otpTemplate,
    welcomeTemplate,
    applicationSubmittedTemplate,
    applicationStatusTemplate,
    paymentTemplate,
    ticketCreatedTemplate,
    ticketStatusTemplate
} from './emailTemplates.js';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'PolicySetu <onboarding@resend.dev>';

// Helper: send email with error handling
const sendEmail = async (to, subject, html) => {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject,
            html,
        });

        if (error) {
            console.error('[Email] Send error:', error);
            return { success: false, error };
        }

        console.log(`[Email] Sent to ${to}: "${subject}" (id: ${data.id})`);
        return { success: true, data };
    } catch (err) {
        console.error('[Email] Unexpected error:', err);
        return { success: false, error: err.message };
    }
};

// ─── Public API ────────────────────────────────────────────

export const sendOtpEmail = async (email, otp) => {
    return sendEmail(email, `${otp} — Your PolicySetu Verification Code`, otpTemplate(otp));
};

export const sendWelcomeEmail = async (name, email) => {
    return sendEmail(email, `Welcome to PolicySetu, ${name}! 🎉`, welcomeTemplate(name));
};

export const sendApplicationSubmittedEmail = async (name, email, policyName, applicationId) => {
    return sendEmail(email, `Application Submitted — ${policyName}`, applicationSubmittedTemplate(name, policyName, applicationId));
};

export const sendApplicationStatusEmail = async (name, email, policyName, status, remarks) => {
    const statusLabels = { 'approved': 'Approved ✅', 'rejected': 'Rejected', 'under-review': 'Under Review' };
    const label = statusLabels[status] || status;
    return sendEmail(email, `Application ${label} — ${policyName}`, applicationStatusTemplate(name, policyName, status, remarks));
};

export const sendPaymentEmail = async (name, email, policyName, amount) => {
    return sendEmail(email, `Payment Processed — ₹${amount} for ${policyName}`, paymentTemplate(name, policyName, amount));
};

export const sendTicketCreatedEmail = async (name, email, subject, ticketId) => {
    return sendEmail(email, `Support Ticket #${ticketId} Created`, ticketCreatedTemplate(name, subject, ticketId));
};

export const sendTicketStatusEmail = async (name, email, subject, status) => {
    return sendEmail(email, `Ticket Update — ${subject}`, ticketStatusTemplate(name, subject, status));
};
