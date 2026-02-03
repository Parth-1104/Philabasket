import express from 'express';
import { sendBulkMail } from '../controllers/mailController.js';
import adminAuth from '../middleware/adminAuth.js';

const mailRouter = express.Router();

mailRouter.get('/test-connection', adminAuth, async (req, res) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.verify();
        res.json({ success: true, message: "Registry Mail Server is ONLINE" });
    } catch (error) {
        res.json({ success: false, message: "Mail Server Connection Failed", error: error.message });
    }
});

// Only admin can send bulk emails
mailRouter.post('/send-bulk', adminAuth, sendBulkMail);

export default mailRouter;