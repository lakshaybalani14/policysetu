import express from 'express';
import { generateOtp, storeOtp, verifyOtp } from '../services/otpStore.js';
import {
    sendOtpEmail,
    sendWelcomeEmail,
    sendApplicationSubmittedEmail,
    sendApplicationStatusEmail,
    sendPaymentEmail,
    sendTicketCreatedEmail,
    sendTicketStatusEmail
} from '../services/emailService.js';

const router = express.Router();

// ─── OTP: Send ──────────────────────────────────────────────
// POST /api/email/send-otp
// Body: { email }
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const otp = generateOtp();
        storeOtp(email, otp);

        const result = await sendOtpEmail(email, otp);

        if (result.success) {
            res.json({ message: 'OTP sent successfully', success: true });
        } else {
            res.status(500).json({ message: 'Failed to send OTP', error: result.error });
        }
    } catch (error) {
        console.error('[Email Route] send-otp error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── OTP: Verify ────────────────────────────────────────────
// POST /api/email/verify-otp
// Body: { email, otp }
router.post('/verify-otp', (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

        const result = verifyOtp(email, otp);

        if (result.valid) {
            res.json({ success: true, message: result.message });
        } else {
            res.status(400).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('[Email Route] verify-otp error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Welcome Email ──────────────────────────────────────────
// POST /api/email/welcome
// Body: { name, email }
router.post('/welcome', async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

        const result = await sendWelcomeEmail(name, email);
        res.json({ success: result.success, message: result.success ? 'Welcome email sent' : 'Failed to send' });
    } catch (error) {
        console.error('[Email Route] welcome error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Application Submitted ──────────────────────────────────
// POST /api/email/application-submitted
// Body: { name, email, policyName, applicationId }
router.post('/application-submitted', async (req, res) => {
    try {
        const { name, email, policyName, applicationId } = req.body;
        if (!name || !email || !policyName) return res.status(400).json({ message: 'Missing required fields' });

        const result = await sendApplicationSubmittedEmail(name, email, policyName, applicationId);
        res.json({ success: result.success });
    } catch (error) {
        console.error('[Email Route] application-submitted error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Application Status Update ──────────────────────────────
// POST /api/email/application-status
// Body: { name, email, policyName, status, remarks }
router.post('/application-status', async (req, res) => {
    try {
        const { name, email, policyName, status, remarks } = req.body;
        if (!name || !email || !policyName || !status) return res.status(400).json({ message: 'Missing required fields' });

        const result = await sendApplicationStatusEmail(name, email, policyName, status, remarks);
        res.json({ success: result.success });
    } catch (error) {
        console.error('[Email Route] application-status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Payment Notification ───────────────────────────────────
// POST /api/email/payment
// Body: { name, email, policyName, amount }
router.post('/payment', async (req, res) => {
    try {
        const { name, email, policyName, amount } = req.body;
        if (!name || !email || !policyName || !amount) return res.status(400).json({ message: 'Missing required fields' });

        const result = await sendPaymentEmail(name, email, policyName, amount);
        res.json({ success: result.success });
    } catch (error) {
        console.error('[Email Route] payment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Ticket Created ─────────────────────────────────────────
// POST /api/email/ticket-created
// Body: { name, email, subject, ticketId }
router.post('/ticket-created', async (req, res) => {
    try {
        const { name, email, subject, ticketId } = req.body;
        if (!name || !email || !subject) return res.status(400).json({ message: 'Missing required fields' });

        const result = await sendTicketCreatedEmail(name, email, subject, ticketId);
        res.json({ success: result.success });
    } catch (error) {
        console.error('[Email Route] ticket-created error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Ticket Status Update ───────────────────────────────────
// POST /api/email/ticket-status
// Body: { name, email, subject, status }
router.post('/ticket-status', async (req, res) => {
    try {
        const { name, email, subject, status } = req.body;
        if (!name || !email || !subject || !status) return res.status(400).json({ message: 'Missing required fields' });

        const result = await sendTicketStatusEmail(name, email, subject, status);
        res.json({ success: result.success });
    } catch (error) {
        console.error('[Email Route] ticket-status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
