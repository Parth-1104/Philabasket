import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { Globe, Zap, Mic, Volume2, VolumeX, MessageSquare, History } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';

const AIHistorian = ({ productId, productName }) => {
    const { backendUrl } = useContext(ShopContext);
    const [isExpanded, setIsExpanded] = useState(false);
    const [input, setInput] = useState("");
    const [chat, setChat] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    
    const [indianVoice, setIndianVoice] = useState(null);
    const chatEndRef = useRef(null);

    // --- STOP SPEECH ON NAVIGATION (FIX) ---
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const loadIndianVoice = useCallback(() => {
        const voices = window.speechSynthesis.getVoices();
        const selected = 
            voices.find(v => v.name.includes('Google') && v.name.includes('India') && v.lang.includes('en')) ||
            voices.find(v => v.name.includes('Heera')) || 
            voices.find(v => v.name.includes('Neerja')) ||
            voices.find(v => v.name.toLowerCase().includes('india') && v.name.toLowerCase().includes('female')) ||
            voices.find(v => v.lang === 'en-IN') ||
            voices.find(v => v.name.includes('Female') && v.lang.startsWith('en'));
    
        setIndianVoice(selected || voices[0]);
    }, []);

    useEffect(() => {
        loadIndianVoice();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadIndianVoice;
        }
    }, [loadIndianVoice]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);

    const speak = (text) => {
        if (isMuted) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (indianVoice) utterance.voice = indianVoice;
        utterance.rate = 0.90;
        utterance.pitch = 1.1; // Female tone adjustment
        window.speechSynthesis.speak(utterance);
    };

    const handleChat = async (query) => {
        const messageText = query || input;
        if (!messageText) return;

        setIsTyping(true);
        if (!isExpanded) setIsExpanded(true);

        const userMsg = { role: "user", parts: [{ text: messageText }] };
        setChat(prev => [...prev, userMsg]);

        try {
            const { data } = await axios.post(`${backendUrl}/api/product/query`, { 
                message: messageText, 
                history: chat.slice(-4),
                productId 
            });
            
            if (data.success) {
                const aiMsg = { role: "model", parts: [{ text: data.reply }] };
                setChat(prev => [...prev, aiMsg]);
                speak(data.reply);
            }
        } catch (err) {
            console.error("AI Error:", err);
        } finally {
            setInput("");
            setIsTyping(false);
        }
    };

    const startHistoryConsultation = () => {
        handleChat(`Namaste! Tell me the complete historical background and rarity of the ${productName}.`);
    };

    if (!isExpanded) {
        return (
            <button 
                onClick={startHistoryConsultation}
                className="w-full mt-6 group relative overflow-hidden bg-gray-900 rounded-2xl p-5 flex items-center justify-between transition-all hover:bg-black active:scale-[0.98] border border-white/5"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#BC002D] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <History size={20} className="text-white" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-[#BC002D] uppercase tracking-[0.2em] mb-1">Philatelic AI Expert</p>
                        <p className="text-[13px] font-bold text-white">Consult Specimen Historian</p>
                    </div>
                </div>
                <Zap size={18} className="text-white/20 group-hover:text-[#BC002D] transition-colors" />
            </button>
        );
    }

    return (
        <div className="mt-8 border-t border-gray-100 pt-6 animate-fade-in text-black">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                        <Globe size={12} className="text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">PhilaBasket Historian</span>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => { setIsMuted(!isMuted); window.speechSynthesis.cancel(); }}
                        className={`p-2 rounded-lg transition-all ${isMuted ? 'bg-red-50 text-[#BC002D]' : 'bg-gray-50 text-gray-400'}`}
                    >
                        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                </div>
            </div>

            <div className="bg-gray-50/50 rounded-2xl p-4 mb-4 max-h-64 overflow-y-auto space-y-3 border border-gray-100">
                {chat.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[12px] leading-relaxed shadow-sm ${
                            m.role === 'user' ? 'bg-black text-white' : 'bg-white text-gray-700'
                        }`}>
                            {m.parts[0].text}
                        </div>
                    </div>
                ))}
                {isTyping && <div className="text-[10px] font-bold text-[#BC002D] animate-pulse">Searching Archives...</div>}
                <div ref={chatEndRef} />
            </div>

            <div className="flex gap-2">
                <input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="Ask more..."
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-[12px] focus:outline-none focus:border-black"
                />
                <button onClick={() => handleChat()} className="bg-black text-white px-5 rounded-xl hover:bg-[#BC002D] transition-all">
                    <MessageSquare size={16} />
                </button>
            </div>
        </div>
    );
};

export default AIHistorian;