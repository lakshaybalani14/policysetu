import nodemailer from "nodemailer";

// TEMP OTP store (not production safe)
const otpStore = new Map();
const OTP_EXPIRY = 5 * 60 * 1000;

const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

export default async function handler(req, res) {

    // ✅ CORS HEADERS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // ✅ HANDLE OPTIONS FIRST (FIXES YOUR 405 ERROR)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // ✅ ONLY ALLOW POST
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    // ✅ BODY PARSE FIX
    const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { action } = req.query;

    // ✅ ENV CHECK
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        return res.status(500).json({
            success: false,
            message: "Missing GMAIL env variables",
        });
    }

    // ✅ STABLE GMAIL CONFIG
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    const sendMail = async (to, subject, html) => {
        await transporter.sendMail({
            from: `PolicySetu <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
        });
    };

    try {
        // ───── SEND OTP ─────
        if (action === "send-otp") {
            const { email } = body;

            if (!email) {
                return res.status(400).json({ success: false, message: "Email required" });
            }

            const otp = generateOtp();

            otpStore.set(email, {
                otp,
                expires: Date.now() + OTP_EXPIRY,
            });

            await sendMail(
                email,
                "Your OTP Code",
                `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes</p>`
            );

            return res.json({ success: true });
        }

        // ───── VERIFY OTP ─────
        if (action === "verify-otp") {
            const { email, otp } = body;

            const record = otpStore.get(email);

            if (!record) {
                return res.status(400).json({ success: false, message: "OTP not found" });
            }

            if (Date.now() > record.expires) {
                return res.status(400).json({ success: false, message: "OTP expired" });
            }

            if (record.otp !== otp) {
                return res.status(400).json({ success: false, message: "Invalid OTP" });
            }

            otpStore.delete(email);

            return res.json({ success: true });
        }

        // ───── WELCOME EMAIL ─────
        if (action === "welcome") {
            const { name, email } = body;

            await sendMail(
                email,
                "Welcome 🎉",
                `<h2>Welcome ${name}!</h2>`
            );

            return res.json({ success: true });
        }

        return res.status(400).json({ message: "Invalid action" });

    } catch (err) {
        console.error("EMAIL ERROR:", err);

        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}