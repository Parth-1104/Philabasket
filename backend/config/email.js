import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    // Use the explicit host and port instead of 'service'
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Must be false for port 587 (TLS)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Ensure no spaces in the 16-digit code
    },
    // The critical section for cloud hosting compatibility
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
    },
    // Adding timeout and connection pool for better stability on Render
    pool: true,
    maxConnections: 1,
    connectionTimeout: 10000 
});

export const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"PhilaBasket Logistics" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log("Registry Dispatch Success:", info.messageId);
        return { success: true };
    } catch (error) {
        // Log the specific error to Render logs for easier debugging
        console.error("Mail Dispatch Protocol Failed:", error.message);
        return { success: false, error: error.message };
    }
};