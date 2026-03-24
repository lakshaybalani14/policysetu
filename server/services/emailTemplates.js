// Premium HTML email templates for PolicySetu
// Uses inline CSS for maximum email client compatibility

const brandColors = {
    primary: '#0c8ce9',
    primaryDark: '#006ec7',
    orange: '#f97316',
    green: '#16a34a',
    dark: '#0f172a',
    gray: '#64748b',
    lightBg: '#f8fafc',
    white: '#ffffff',
};

const baseLayout = (content, preheader = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PolicySetu</title>
</head>
<body style="margin:0;padding:0;background-color:${brandColors.lightBg};font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${brandColors.lightBg};">
        <tr><td align="center" style="padding:32px 16px;">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
                <!-- Header -->
                <tr><td style="background:linear-gradient(135deg,${brandColors.primary},${brandColors.primaryDark});border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
                    <h1 style="margin:0;font-size:28px;font-weight:800;color:${brandColors.white};letter-spacing:-0.5px;">
                        Policy<span style="color:${brandColors.orange};">Setu</span>
                    </h1>
                    <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.7);letter-spacing:1px;text-transform:uppercase;">Digital Governance Platform</p>
                </td></tr>

                <!-- Gradient bar -->
                <tr><td style="height:4px;background:linear-gradient(90deg,${brandColors.orange},${brandColors.primary},${brandColors.green});"></td></tr>

                <!-- Body -->
                <tr><td style="background-color:${brandColors.white};padding:40px;border-radius:0 0 16px 16px;">
                    ${content}
                </td></tr>

                <!-- Footer -->
                <tr><td style="padding:24px 40px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:12px;color:${brandColors.gray};">
                        © ${new Date().getFullYear()} PolicySetu — A Digital India Initiative
                    </p>
                    <p style="margin:0;font-size:11px;color:#94a3b8;">
                        This is an automated email. Please do not reply directly.
                    </p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body>
</html>`;

// ─── OTP Email ─────────────────────────────────────────────
export const otpTemplate = (otp) => baseLayout(`
    <div style="text-align:center;">
        <div style="width:64px;height:64px;margin:0 auto 16px;border-radius:50%;background:linear-gradient(135deg,${brandColors.primary},${brandColors.primaryDark});display:flex;align-items:center;justify-content:center;">
            <span style="font-size:28px;">🔐</span>
        </div>
        <h2 style="margin:0 0 8px;font-size:24px;color:${brandColors.dark};">Verify Your Email</h2>
        <p style="margin:0 0 24px;color:${brandColors.gray};font-size:15px;">Use the code below to complete your registration</p>

        <div style="background:${brandColors.lightBg};border:2px dashed ${brandColors.primary};border-radius:12px;padding:20px;margin:0 auto 24px;max-width:280px;">
            <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:${brandColors.primary};">${otp}</span>
        </div>

        <p style="margin:0;font-size:13px;color:${brandColors.gray};">
            This code expires in <strong>5 minutes</strong>. Do not share this code with anyone.
        </p>
    </div>
`, `Your OTP code is ${otp}`);

// ─── Welcome Email ─────────────────────────────────────────
export const welcomeTemplate = (name) => baseLayout(`
    <div style="text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">🎉</div>
        <h2 style="margin:0 0 8px;font-size:26px;color:${brandColors.dark};">Welcome to PolicySetu, ${name}!</h2>
        <p style="margin:0 0 28px;color:${brandColors.gray};font-size:15px;line-height:1.6;">
            Your account has been successfully created. You now have access to hundreds of government welfare schemes.
        </p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
                <td style="padding:12px;background:${brandColors.lightBg};border-radius:10px;text-align:left;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr><td style="padding:8px 12px;">
                            <span style="color:${brandColors.primary};font-weight:700;">🔍</span>
                            <span style="color:${brandColors.dark};font-size:14px;margin-left:8px;">Browse & discover eligible schemes</span>
                        </td></tr>
                        <tr><td style="padding:8px 12px;">
                            <span style="color:${brandColors.orange};font-weight:700;">📝</span>
                            <span style="color:${brandColors.dark};font-size:14px;margin-left:8px;">Apply online with simple digital forms</span>
                        </td></tr>
                        <tr><td style="padding:8px 12px;">
                            <span style="color:${brandColors.green};font-weight:700;">📊</span>
                            <span style="color:${brandColors.dark};font-size:14px;margin-left:8px;">Track applications in real-time</span>
                        </td></tr>
                    </table>
                </td>
            </tr>
        </table>

        <a href="#" style="display:inline-block;background:linear-gradient(135deg,${brandColors.primary},${brandColors.primaryDark});color:${brandColors.white};text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;">
            Explore Schemes →
        </a>
    </div>
`, `Welcome to PolicySetu, ${name}!`);

// ─── Application Submitted ─────────────────────────────────
export const applicationSubmittedTemplate = (name, policyName, applicationId) => baseLayout(`
    <div>
        <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:48px;margin-bottom:8px;">✅</div>
            <h2 style="margin:0 0 8px;font-size:24px;color:${brandColors.dark};">Application Submitted!</h2>
            <p style="margin:0;color:${brandColors.gray};font-size:15px;">Hi ${name}, your application has been received</p>
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brandColors.lightBg};border-radius:10px;margin-bottom:24px;">
            <tr><td style="padding:20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding:6px 0;font-size:13px;color:${brandColors.gray};width:140px;">Scheme</td>
                        <td style="padding:6px 0;font-size:14px;color:${brandColors.dark};font-weight:600;">${policyName}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0;font-size:13px;color:${brandColors.gray};">Application ID</td>
                        <td style="padding:6px 0;font-size:14px;color:${brandColors.primary};font-weight:600;">#${applicationId}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0;font-size:13px;color:${brandColors.gray};">Status</td>
                        <td style="padding:6px 0;">
                            <span style="background:#dbeafe;color:${brandColors.primary};font-size:12px;font-weight:600;padding:4px 10px;border-radius:6px;">Submitted</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0;font-size:13px;color:${brandColors.gray};">Date</td>
                        <td style="padding:6px 0;font-size:14px;color:${brandColors.dark};">${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</td>
                    </tr>
                </table>
            </td></tr>
        </table>

        <p style="margin:0;font-size:13px;color:${brandColors.gray};text-align:center;">
            You will receive email updates as your application progresses through the review process.
        </p>
    </div>
`, `Application submitted for ${policyName}`);

// ─── Application Status Update ──────────────────────────────
export const applicationStatusTemplate = (name, policyName, status, remarks) => {
    const statusConfig = {
        'approved': { emoji: '🎉', color: '#16a34a', bg: '#dcfce7', label: 'Approved' },
        'rejected': { emoji: '❌', color: '#dc2626', bg: '#fee2e2', label: 'Rejected' },
        'under-review': { emoji: '🔍', color: '#f59e0b', bg: '#fef3c7', label: 'Under Review' },
    };
    const config = statusConfig[status] || { emoji: '📋', color: brandColors.primary, bg: '#dbeafe', label: status };

    return baseLayout(`
        <div style="text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">${config.emoji}</div>
            <h2 style="margin:0 0 8px;font-size:24px;color:${brandColors.dark};">Application ${config.label}</h2>
            <p style="margin:0 0 24px;color:${brandColors.gray};font-size:15px;">Hi ${name}, your application status has been updated</p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brandColors.lightBg};border-radius:10px;margin-bottom:24px;">
                <tr><td style="padding:20px;text-align:left;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="padding:6px 0;font-size:13px;color:${brandColors.gray};width:120px;">Scheme</td>
                            <td style="padding:6px 0;font-size:14px;color:${brandColors.dark};font-weight:600;">${policyName}</td>
                        </tr>
                        <tr>
                            <td style="padding:6px 0;font-size:13px;color:${brandColors.gray};">New Status</td>
                            <td style="padding:6px 0;">
                                <span style="background:${config.bg};color:${config.color};font-size:12px;font-weight:700;padding:4px 12px;border-radius:6px;">${config.label}</span>
                            </td>
                        </tr>
                        ${remarks ? `<tr>
                            <td style="padding:6px 0;font-size:13px;color:${brandColors.gray};vertical-align:top;">Remarks</td>
                            <td style="padding:6px 0;font-size:14px;color:${brandColors.dark};">${remarks}</td>
                        </tr>` : ''}
                    </table>
                </td></tr>
            </table>

            ${status === 'approved' ? `
                <p style="margin:0;font-size:14px;color:${brandColors.green};font-weight:600;">
                    💰 Your benefits will be disbursed to your registered bank account shortly.
                </p>
            ` : ''}
        </div>
    `, `Application ${config.label} — ${policyName}`);
};

// ─── Payment Email ──────────────────────────────────────────
export const paymentTemplate = (name, policyName, amount) => baseLayout(`
    <div style="text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">💰</div>
        <h2 style="margin:0 0 8px;font-size:24px;color:${brandColors.dark};">Payment Processed!</h2>
        <p style="margin:0 0 24px;color:${brandColors.gray};font-size:15px;">Hi ${name}, your benefit amount has been processed</p>

        <div style="background:linear-gradient(135deg,${brandColors.green},#15803d);border-radius:12px;padding:24px;margin-bottom:24px;">
            <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.8);">Amount Disbursed</p>
            <p style="margin:4px 0 0;font-size:36px;font-weight:800;color:${brandColors.white};">₹${typeof amount === 'number' ? amount.toLocaleString('en-IN') : amount}</p>
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brandColors.lightBg};border-radius:10px;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;text-align:left;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding:6px 0;font-size:13px;color:${brandColors.gray};width:120px;">Scheme</td>
                        <td style="padding:6px 0;font-size:14px;color:${brandColors.dark};font-weight:600;">${policyName}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0;font-size:13px;color:${brandColors.gray};">Method</td>
                        <td style="padding:6px 0;font-size:14px;color:${brandColors.dark};">Direct Bank Transfer</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0;font-size:13px;color:${brandColors.gray};">Date</td>
                        <td style="padding:6px 0;font-size:14px;color:${brandColors.dark};">${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</td>
                    </tr>
                </table>
            </td></tr>
        </table>
    </div>
`, `Payment of ₹${amount} processed for ${policyName}`);

// ─── Ticket Created Email ───────────────────────────────────
export const ticketCreatedTemplate = (name, subject, ticketId) => baseLayout(`
    <div style="text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">🎫</div>
        <h2 style="margin:0 0 8px;font-size:24px;color:${brandColors.dark};">Support Ticket Created</h2>
        <p style="margin:0 0 24px;color:${brandColors.gray};font-size:15px;">Hi ${name}, we've received your support request</p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brandColors.lightBg};border-radius:10px;margin-bottom:24px;">
            <tr><td style="padding:20px;text-align:left;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding:6px 0;font-size:13px;color:${brandColors.gray};width:120px;">Ticket ID</td>
                        <td style="padding:6px 0;font-size:14px;color:${brandColors.primary};font-weight:600;">#${ticketId}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0;font-size:13px;color:${brandColors.gray};">Subject</td>
                        <td style="padding:6px 0;font-size:14px;color:${brandColors.dark};font-weight:600;">${subject}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0;font-size:13px;color:${brandColors.gray};">Status</td>
                        <td style="padding:6px 0;">
                            <span style="background:#fef3c7;color:#f59e0b;font-size:12px;font-weight:600;padding:4px 10px;border-radius:6px;">Open</span>
                        </td>
                    </tr>
                </table>
            </td></tr>
        </table>

        <p style="margin:0;font-size:13px;color:${brandColors.gray};">Our team will review and respond within 24-48 hours.</p>
    </div>
`, `Support ticket #${ticketId} created`);

// ─── Ticket Status Update ───────────────────────────────────
export const ticketStatusTemplate = (name, subject, status) => {
    const statusConfig = {
        'resolved': { emoji: '✅', color: '#16a34a', bg: '#dcfce7', label: 'Resolved' },
        'closed': { emoji: '🔒', color: '#64748b', bg: '#f1f5f9', label: 'Closed' },
        'in-progress': { emoji: '⚙️', color: '#f59e0b', bg: '#fef3c7', label: 'In Progress' },
    };
    const config = statusConfig[status] || { emoji: '📋', color: brandColors.primary, bg: '#dbeafe', label: status };

    return baseLayout(`
        <div style="text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">${config.emoji}</div>
            <h2 style="margin:0 0 8px;font-size:24px;color:${brandColors.dark};">Ticket ${config.label}</h2>
            <p style="margin:0 0 24px;color:${brandColors.gray};font-size:15px;">Hi ${name}, your support ticket has been updated</p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brandColors.lightBg};border-radius:10px;margin-bottom:24px;">
                <tr><td style="padding:20px;text-align:left;">
                    <table role="presentation" width="100%">
                        <tr>
                            <td style="padding:6px 0;font-size:13px;color:${brandColors.gray};width:120px;">Subject</td>
                            <td style="padding:6px 0;font-size:14px;color:${brandColors.dark};font-weight:600;">${subject}</td>
                        </tr>
                        <tr>
                            <td style="padding:6px 0;font-size:13px;color:${brandColors.gray};">Status</td>
                            <td style="padding:6px 0;">
                                <span style="background:${config.bg};color:${config.color};font-size:12px;font-weight:700;padding:4px 12px;border-radius:6px;">${config.label}</span>
                            </td>
                        </tr>
                    </table>
                </td></tr>
            </table>

            ${status === 'resolved' ? `<p style="margin:0;font-size:13px;color:${brandColors.gray};">If you need further assistance, feel free to create a new ticket.</p>` : ''}
        </div>
    `, `Ticket ${config.label} — ${subject}`);
};
