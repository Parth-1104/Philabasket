import { GoogleGenerativeAI } from "@google/generative-ai";
import productModel from "../models/productModel.js";
import 'dotenv/config';



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chatWithRegistry = async (req, res) => {
    try {
        const { message, history } = req.body;

        // 1. Fetch current product data to ground the AI's knowledge
        const products = await productModel.find({ isActive: true })
            .select('name price description country year stock category condition');
        
        const registryContext = products.map(p => 
            `Name: ${p.name}, Price: ${p.price}, Year: ${p.year}, Stock: ${p.stock}, Origin: ${p.country}`
        ).join("\n");

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 2. Start a chat session with the history provided by the frontend
        const chat = model.startChat({
            history: history || [],
            generationConfig: { maxOutputTokens: 800 },
        });

        // 3. Instruction for the AI to act as a Philatelic Expert
        const systemInstruction = `
            You are the PhilaBasket's Assistant. 
            Answer based ONLY on this registry data:
            ${registryContext}
            If a user asks a follow-up, use the chat history to stay in context.
        `;

        const result = await chat.sendMessage(`${systemInstruction}\n\nUser: ${message}`);
        const response = await result.response;
        
        res.json({ success: true, reply: response.text() });
    } catch (error) {
        console.error("Chat API Error:", error);
        res.status(500).json({ success: false, message: "Registry Assistant is currently unreachable." });
    }
};