import { GoogleGenerativeAI } from "@google/generative-ai";
import productModel from "../models/productModel.js";
import 'dotenv/config';



// backend/controllers/chatController.js
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// backend/controllers/chatController.js
// backend/controllers/chatController.js
export const chatWithRegistry = async (req, res) => {
    try {
        const { message, history, productId } = req.body;

        if (!message || !productId) return res.status(400).json({ success: false });

        const stamp = await productModel.findById(productId);
        if (!stamp) return res.status(404).json({ success: false });

        // Use Gemini 3 Flash with Search Tool enabled
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash", // Use Gemini 3 Flash for latest tools
            tools: [{ google_search: {} }] 
        });

        const formattedHistory = (history || []).map(h => ({
            role: h.role,
            parts: [{ text: h.parts[0].text }]
        }));

        const chat = model.startChat({ history: formattedHistory });

        // Instruction to use search for deep history
        const systemPrompt = `You are the PhilaBasket Archive Historian. 
        Specimen: ${stamp.name} (${stamp.year}). 
        TASK: Use Google Search to find specific historical context, rarity, and design details about this stamp. 
        Present the info as an interesting "Specimen Story" in 3 sentences.`;

        const result = await chat.sendMessage(`${systemPrompt}\n\nUser Question: ${message}`);
        const response = await result.response;
        
        return res.json({ success: true, reply: response.text() });

    } catch (error) {
        console.error("AI Error:", error.message);
        res.status(500).json({ success: false, message: "Historian is busy." });
    }
};