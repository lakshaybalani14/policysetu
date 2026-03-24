import nodemailer from 'nodemailer';
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

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const FROM_EMAIL = `PolicySetu <${process.env.GMAIL_USER}>`;

// Helper: send email with error handling
const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: FROM_EMAIL,
            to,
            subject,
            html,
        });

        console.log(`[Email] Sent to ${to}: "${subject}" (id: ${info.messageId})`);
        return { success: true, data: info };
    } catch (err) {
        console.error('[Email] Send error:', err.message);
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
