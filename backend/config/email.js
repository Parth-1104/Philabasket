import nodemailer from 'nodemailer';
import { Resend } from 'resend';


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


// Initialize with your API Key from Render Environment Variables
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, html) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'PhilaBasket Registry <admin@philabasket.in>', // Must be your verified domain
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error("Resend API Error:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Resend Connection Error:", error);
        return { success: false, error };
    }
};