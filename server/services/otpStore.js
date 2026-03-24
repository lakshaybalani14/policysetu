// In-memory OTP store with auto-expiry
// For production, use Redis or a database table

const otpStore = new Map(); // Map<email, { otp, expiresAt }>

const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Generate a random 6-digit OTP
export const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP for an email
export const storeOtp = (email, otp) => {
    const normalizedEmail = email.toLowerCase().trim();
    otpStore.set(normalizedEmail, {
        otp,
        expiresAt: Date.now() + OTP_EXPIRY_MS,
        attempts: 0,
    });

    // Auto-cleanup after expiry
    setTimeout(() => {
        otpStore.delete(normalizedEmail);
    }, OTP_EXPIRY_MS + 1000);

    console.log(`[OTP] Stored for ${normalizedEmail} (expires in 5 min)`);
};

// Verify OTP for an email
export const verifyOtp = (email, otp) => {
    const normalizedEmail = email.toLowerCase().trim();
    const entry = otpStore.get(normalizedEmail);

    if (!entry) {
        return { valid: false, message: 'OTP expired or not found. Please request a new one.' };
    }

    // Check expiry
    if (Date.now() > entry.expiresAt) {
        otpStore.delete(normalizedEmail);
        return { valid: false, message: 'OTP has expired. Please request a new one.' };
    }

    // Rate limit: max 5 attempts
    entry.attempts += 1;
    if (entry.attempts > 5) {
        otpStore.delete(normalizedEmail);
        return { valid: false, message: 'Too many attempts. Please request a new OTP.' };
    }

    // Verify
    if (entry.otp === otp.toString()) {
        otpStore.delete(normalizedEmail); // One-time use
        console.log(`[OTP] Verified for ${normalizedEmail}`);
        return { valid: true, message: 'Email verified successfully!' };
    }

    return { valid: false, message: 'Invalid OTP. Please try again.' };
};
