import { Resend } from 'resend';

// In-memory OTP store
const otpStore = new Map();
const OTP_EXPIRY_MS = 5 * 60 * 1000;

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Brand colors for email templates
const brand = {
    primary: '#0c8ce9', primaryDark: '#006ec7', orange: '#f97316',
    green: '#16a34a', dark: '#0f172a', gray: '#64748b',
    lightBg: '#f8fafc', white: '#ffffff',
};

const baseLayout = (content, preheader = '') => `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>PolicySetu</title></head>
<body style="margin:0;padding:0;background-color:${brand.lightBg};font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${brand.lightBg};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="background:linear-gradient(135deg,${brand.primary},${brand.primaryDark});border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
<h1 style="margin:0;font-size:28px;font-weight:800;color:${brand.white};letter-spacing:-0.5px;">Policy<span style="color:${brand.orange};">Setu</span></h1>
<p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.7);letter-spacing:1px;text-transform:uppercase;">Digital Governance Platform</p>
</td></tr>
<tr><td style="height:4px;background:linear-gradient(90deg,${brand.orange},${brand.primary},${brand.green});"></td></tr>
<tr><td style="background-color:${brand.white};padding:40px;border-radius:0 0 16px 16px;">${content}</td></tr>
<tr><td style="padding:24px 40px;text-align:center;">
<p style="margin:0 0 8px;font-size:12px;color:${brand.gray};">© ${new Date().getFullYear()} PolicySetu — A Digital India Initiative</p>
<p style="margin:0;font-size:11px;color:#94a3b8;">This is an automated email. Please do not reply directly.</p>
</td></tr></table></td></tr></table></body></html>`;

// Email templates
const templates = {
    otp: (otp) => ({
        subject: `${otp} — Your PolicySetu Verification Code`,
        html: baseLayout(`<div style="text-align:center;">
            <h2 style="margin:0 0 8px;font-size:24px;color:${brand.dark};">Verify Your Email</h2>
            <p style="margin:0 0 24px;color:${brand.gray};font-size:15px;">Use the code below to complete your registration</p>
            <div style="background:${brand.lightBg};border:2px dashed ${brand.primary};border-radius:12px;padding:20px;margin:0 auto 24px;max-width:280px;">
                <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:${brand.primary};">${otp}</span>
            </div>
            <p style="margin:0;font-size:13px;color:${brand.gray};">This code expires in <strong>5 minutes</strong>.</p>
        </div>`, `Your OTP code is ${otp}`)
    }),
    welcome: (name) => ({
        subject: `Welcome to PolicySetu, ${name}! 🎉`,
        html: baseLayout(`<div style="text-align:center;">
            <div style="font-size:48px;margin-bottom:16px;">🎉</div>
            <h2 style="margin:0 0 8px;font-size:26px;color:${brand.dark};">Welcome, ${name}!</h2>
            <p style="margin:0 0 28px;color:${brand.gray};font-size:15px;line-height:1.6;">Your account has been created. You now have access to hundreds of government welfare schemes.</p>
        </div>`, `Welcome to PolicySetu, ${name}!`)
    }),
    applicationSubmitted: (name, policyName, appId) => ({
        subject: `Application Submitted — ${policyName}`,
        html: baseLayout(`<div style="text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">✅</div>
            <h2 style="margin:0 0 8px;font-size:24px;color:${brand.dark};">Application Submitted!</h2>
            <p style="margin:0 0 24px;color:${brand.gray};">Hi ${name}, your application for <strong>${policyName}</strong> (ID: #${appId}) has been received.</p>
            <p style="margin:0;font-size:13px;color:${brand.gray};">You will receive email updates as your application progresses.</p>
        </div>`, `Application submitted for ${policyName}`)
    }),
    applicationStatus: (name, policyName, status, remarks) => {
        const cfg = {
            'approved': { emoji: '🎉', label: 'Approved', color: '#16a34a', bg: '#dcfce7' },
            'rejected': { emoji: '❌', label: 'Rejected', color: '#dc2626', bg: '#fee2e2' },
            'under-review': { emoji: '🔍', label: 'Under Review', color: '#f59e0b', bg: '#fef3c7' }
        }[status] || { emoji: '📋', label: status, color: brand.primary, bg: '#dbeafe' };
        return {
            subject: `Application ${cfg.label} — ${policyName}`,
            html: baseLayout(`<div style="text-align:center;">
                <div style="font-size:48px;margin-bottom:8px;">${cfg.emoji}</div>
                <h2 style="margin:0 0 8px;font-size:24px;color:${brand.dark};">Application ${cfg.label}</h2>
                <p style="margin:0 0 16px;color:${brand.gray};">Hi ${name}, your application for <strong>${policyName}</strong> has been updated.</p>
                <span style="background:${cfg.bg};color:${cfg.color};font-size:14px;font-weight:700;padding:6px 16px;border-radius:8px;">${cfg.label}</span>
                ${remarks ? `<p style="margin:16px 0 0;color:${brand.gray};font-size:14px;">Remarks: ${remarks}</p>` : ''}
                ${status === 'approved' ? `<p style="margin:16px 0 0;color:${brand.green};font-weight:600;">💰 Benefits will be disbursed shortly.</p>` : ''}
            </div>`)
        };
    },
    payment: (name, policyName, amount) => ({
        subject: `Payment Processed — ₹${amount} for ${policyName}`,
        html: baseLayout(`<div style="text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">💰</div>
            <h2 style="margin:0 0 8px;font-size:24px;color:${brand.dark};">Payment Processed!</h2>
            <p style="margin:0 0 24px;color:${brand.gray};">Hi ${name}, your benefit for <strong>${policyName}</strong> has been processed.</p>
            <div style="background:linear-gradient(135deg,${brand.green},#15803d);border-radius:12px;padding:24px;margin-bottom:24px;">
                <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.8);">Amount Disbursed</p>
                <p style="margin:4px 0 0;font-size:36px;font-weight:800;color:${brand.white};">₹${typeof amount === 'number' ? amount.toLocaleString('en-IN') : amount}</p>
            </div>
        </div>`)
    }),
    ticketCreated: (name, subject, ticketId) => ({
        subject: `Support Ticket #${ticketId} Created`,
        html: baseLayout(`<div style="text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">🎫</div>
            <h2 style="margin:0 0 8px;font-size:24px;color:${brand.dark};">Ticket Created</h2>
            <p style="margin:0 0 16px;color:${brand.gray};">Hi ${name}, your support ticket "<strong>${subject}</strong>" (ID: #${ticketId}) has been received.</p>
            <p style="margin:0;font-size:13px;color:${brand.gray};">Our team will respond within 24-48 hours.</p>
        </div>`)
    }),
    ticketStatus: (name, subject, status) => {
        const cfg = {
            'resolved': { emoji: '✅', label: 'Resolved' }, 'closed': { emoji: '🔒', label: 'Closed' },
            'in-progress': { emoji: '⚙️', label: 'In Progress' }
        }[status] || { emoji: '📋', label: status };
        return {
            subject: `Ticket ${cfg.label} — ${subject}`,
            html: baseLayout(`<div style="text-align:center;">
                <div style="font-size:48px;margin-bottom:8px;">${cfg.emoji}</div>
                <h2 style="margin:0 0 8px;font-size:24px;color:${brand.dark};">Ticket ${cfg.label}</h2>
                <p style="margin:0;color:${brand.gray};">Hi ${name}, your ticket "<strong>${subject}</strong>" has been marked as <strong>${cfg.label}</strong>.</p>
            </div>`)
        };
    }
};

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const FROM_EMAIL = process.env.FROM_EMAIL || 'PolicySetu <onboarding@resend.dev>';

    // Route based on the action in the URL: /api/email?action=send-otp
    const { action } = req.query;
    const body = req.body;

    try {
        switch (action) {
            case 'send-otp': {
                if (!body.email) return res.status(400).json({ message: 'Email is required' });
                const otp = generateOtp();
                otpStore.set(body.email.toLowerCase(), { otp, expiresAt: Date.now() + OTP_EXPIRY_MS, attempts: 0 });
                const tmpl = templates.otp(otp);
                const { error } = await resend.emails.send({ from: FROM_EMAIL, to: [body.email], ...tmpl });
                if (error) return res.status(500).json({ success: false, message: 'Failed to send OTP', error });
                return res.json({ success: true, message: 'OTP sent successfully' });
            }

            case 'verify-otp': {
                if (!body.email || !body.otp) return res.status(400).json({ message: 'Email and OTP are required' });
                const email = body.email.toLowerCase();
                const entry = otpStore.get(email);
                if (!entry) return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
                if (Date.now() > entry.expiresAt) { otpStore.delete(email); return res.status(400).json({ success: false, message: 'OTP has expired.' }); }
                entry.attempts += 1;
                if (entry.attempts > 5) { otpStore.delete(email); return res.status(400).json({ success: false, message: 'Too many attempts.' }); }
                if (entry.otp === body.otp.toString()) { otpStore.delete(email); return res.json({ success: true, message: 'Email verified!' }); }
                return res.status(400).json({ success: false, message: 'Invalid OTP.' });
            }

            case 'welcome': {
                if (!body.name || !body.email) return res.status(400).json({ message: 'Name and email required' });
                const tmpl = templates.welcome(body.name);
                const { error } = await resend.emails.send({ from: FROM_EMAIL, to: [body.email], ...tmpl });
                return res.json({ success: !error });
            }

            case 'application-submitted': {
                const { name, email, policyName, applicationId } = body;
                if (!name || !email || !policyName) return res.status(400).json({ message: 'Missing fields' });
                const tmpl = templates.applicationSubmitted(name, policyName, applicationId);
                const { error } = await resend.emails.send({ from: FROM_EMAIL, to: [email], ...tmpl });
                return res.json({ success: !error });
            }

            case 'application-status': {
                const { name, email, policyName, status, remarks } = body;
                if (!name || !email || !policyName || !status) return res.status(400).json({ message: 'Missing fields' });
                const tmpl = templates.applicationStatus(name, policyName, status, remarks);
                const { error } = await resend.emails.send({ from: FROM_EMAIL, to: [email], ...tmpl });
                return res.json({ success: !error });
            }

            case 'payment': {
                const { name, email, policyName, amount } = body;
                if (!name || !email || !policyName || !amount) return res.status(400).json({ message: 'Missing fields' });
                const tmpl = templates.payment(name, policyName, amount);
                const { error } = await resend.emails.send({ from: FROM_EMAIL, to: [email], ...tmpl });
                return res.json({ success: !error });
            }

            case 'ticket-created': {
                const { name, email, subject, ticketId } = body;
                if (!name || !email || !subject) return res.status(400).json({ message: 'Missing fields' });
                const tmpl = templates.ticketCreated(name, subject, ticketId);
                const { error } = await resend.emails.send({ from: FROM_EMAIL, to: [email], ...tmpl });
                return res.json({ success: !error });
            }

            case 'ticket-status': {
                const { name, email, subject, status } = body;
                if (!name || !email || !subject || !status) return res.status(400).json({ message: 'Missing fields' });
                const tmpl = templates.ticketStatus(name, subject, status);
                const { error } = await resend.emails.send({ from: FROM_EMAIL, to: [email], ...tmpl });
                return res.json({ success: !error });
            }

            default:
                return res.status(400).json({ message: `Unknown action: ${action}` });
        }
    } catch (err) {
        console.error('[Email API] Error:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
}
