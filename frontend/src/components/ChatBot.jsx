import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { MessageSquare, Send, X, Bot, Share2, Facebook, MessageCircle } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

const ChatBot = () => {
    const { backendUrl } = useContext(ShopContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ role: 'bot', text: 'Welcome to the Archive. How can I assist your search today?' }]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]); 
    const chatEndRef = useRef(null);

    // Replace these with your actual Group/Bot links
    const WHATSAPP_LINK = "https://wa.me/919999167799"; 
    const FACEBOOK_LINK = "https://m.me/philabasket";

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsgText = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsgText }]);
        setInput("");
        setLoading(true);

        try {
            const { data } = await axios.post(`${backendUrl}/api/product/query`, { 
                message: userMsgText,
                history: history 
            });

            if (data.success) {
                const botReply = data.reply;
                setMessages(prev => [...prev, { role: 'bot', text: botReply }]);
                setHistory(prev => [
                    ...prev,
                    { role: "user", parts: [{ text: userMsgText }] },
                    { role: "model", parts: [{ text: botReply }] }
                ]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'bot', text: "Connection to registry lost. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const scrollToBottom = () => {
            if (chatEndRef.current) {
                chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
            }
        };
        const timeoutId = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeoutId);
    }, [messages, loading]);

    return (
        <div className="fixed bottom-20 right-6 z-[4000]">
            {isOpen ? (
                <div className="w-80 md:w-96 h-[550px] bg-white border border-gray-200 shadow-2xl rounded-3xl overflow-hidden flex flex-col animate-fade-in ring-1 ring-black/5">
                    
                    {/* Header */}
                    <div className="bg-gray-900 p-4 text-white flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-[#BC002D] rounded-lg">
                                <Bot size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Archival Assistant</p>
                                <p className="text-[7px] text-gray-400 uppercase tracking-widest mt-0.5">Sovereign Registry AI</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                             {/* Optional: Social Icons in Header */}
                             <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="hover:text-[#25D366] transition-colors">
                                <MessageCircle size={16} />
                             </a>
                             <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform duration-300">
                                <X size={20} className="text-gray-400 hover:text-white" />
                             </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FDFDFD] custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm font-medium
                                    ${msg.role === 'user' 
                                        ? 'bg-black text-white rounded-tr-none' 
                                        : 'bg-white border border-gray-100 text-gray-900 rounded-tl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Community Link "Quick Actions" */}
                        <div className="pt-2">
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Protocol Extensions</p>
                            <div className="flex gap-2">
                                <a 
                                    href={WHATSAPP_LINK} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#25D366] hover:text-white transition-all"
                                >
                                    <MessageCircle size={14} /> WhatsApp Group
                                </a>
                                <a 
                                    href={FACEBOOK_LINK} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-2 bg-[#1877F2]/10 text-[#1877F2] px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#1877F2] hover:text-white transition-all"
                                >
                                    <Facebook size={14} /> FB Messenger
                                </a>
                            </div>
                        </div>

                        {loading && (
                            <div className="flex items-center gap-2 pt-2">
                                <div className="w-1.5 h-1.5 bg-[#BC002D] rounded-full animate-bounce"></div>
                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Consulting Registry...</span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center">
                        <input 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
                            placeholder="Ask about a specimen..." 
                            className="flex-1 bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-sm text-black placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#BC002D]/10 transition-all"
                        />
                        <button 
                            onClick={handleSend} 
                            disabled={loading || !input.trim()}
                            className="p-3 bg-[#BC002D] text-white rounded-xl shadow-lg shadow-[#BC002D]/20 active:scale-90 transition-all disabled:opacity-50"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsOpen(true)} 
                    className="w-14 h-14 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-[#BC002D] hover:scale-110 transition-all duration-500 group"
                >
                    <Bot size={26} className="group-hover:rotate-12 transition-transform" />
                    <span className="absolute -top-1 -right-1 bg-[#BC002D] text-white text-[8px] px-1.5 py-0.5 rounded-full font-black border-2 border-white animate-pulse">LIVE</span>
                </button>
            )}
        </div>
    );
};

export default ChatBot;