import nodemailer from 'nodemailer';
import 'dotenv/config'
import userModel from '../models/userModel.js';
import subscriberModel from '../models/subscriberModel.js';

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS  // Your 16-digit App Password (NOT your login pass)
    },

});





// Generic Bulk Mail Function
export const sendBulkMail = async (req, res) => {
    try {
        const { target, subject, message, excludedEmails, bannerImage, templateType } = req.body;
        let recipients = [];

        // 1. Audience Retrieval
        if (target === 'customers') {
            const users = await userModel.find({}, 'email');
            recipients = users.map(u => u.email);
        } else if (target === 'subscribers') {
            const subs = await subscriberModel.find({}, 'email');
            recipients = subs.map(s => s.email);
        }

        // 2. Filter Exclusions
        const finalRecipients = recipients.filter(email => !excludedEmails.includes(email));

        if (finalRecipients.length === 0) {
            return res.json({ success: false, message: "No recipients found in target audience." });
        }

        // 3. Template Generation
        const isDark = templateType === 'dark';
        const htmlContent = `
    <div style="max-width: 600px; margin: 20px auto; font-family: 'Helvetica', Arial, sans-serif; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; background-color: ${isDark ? '#111' : '#fff'};">
        
        ${bannerImage ? `
            <div style="width: 100%; height: 200px; overflow: hidden;">
                <img 
                    src="${bannerImage}" 
                    style="width: 100%; height: 200px; object-fit: cover; display: block;" 
                    alt="Newsletter Banner"
                />
            </div>
        ` : ''}

        <div style="padding: 35px; color: ${isDark ? '#eee' : '#333'};">
            <h1 style="margin-top: 0; font-size: 22px; text-transform: uppercase;">${subject}</h1>
            <div style="line-height: 1.6; font-size: 15px;">
                ${message.replace(/\n/g, '<br>')}
            </div>
        </div>
    </div>
`;

        // 4. Dispatch
        const mailOptions = {
            from: `"PhilaBasket Registry" <${process.env.EMAIL_USER}>`,
            bcc: finalRecipients,
            subject: subject,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: `Successfully transmitted to ${finalRecipients.length} recipients.` });

    } catch (error) {
        console.error("Mail Error:", error);
        res.json({ success: false, message: error.message });
    }
};