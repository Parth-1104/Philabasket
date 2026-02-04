import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';
import { Send, RefreshCw, Megaphone } from 'lucide-react';

const NewsletterDispatch = ({ token }) => {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!subject || !message) {
            return toast.warning("Protocol Error: Headline and Briefing are required.");
        }

        // --- ADDED: CONFIRMATION POPUP ---
        const confirmSend = window.confirm("Are you sure you want to broadcast this newsletter to the entire Inner Circle?");
        if (!confirmSend) return;

        setLoading(true);
        try {
            const response = await axios.post(backendUrl + '/api/mail/send-bulk', 
                { target: 'subscribers', subject, message, excludedEmails: [] },
                { headers: { token } }
            );
            
            if(response.data.success) {
                toast.success("Intelligence Dispatched to Inner Circle");
                setSubject("");
                setMessage("");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Transmission failed. Check registry connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='p-8 bg-white min-h-screen font-sans flex justify-center items-start'>
            <div className='w-full max-w-4xl relative bg-white border border-gray-100 rounded-[40px] p-8 md:p-12 shadow-sm overflow-hidden'>
                
                {/* --- BROADCAST LOADER OVERLAY --- */}
                {loading && (
                    <div className='absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300'>
                        <RefreshCw size={48} className='text-[#BC002D] animate-spin mb-4' />
                        <p className='text-[11px] font-black uppercase tracking-[0.5em] text-[#BC002D] animate-pulse'>Broadcasting to Inner Circle...</p>
                    </div>
                )}

                <div className='mb-12 flex items-center justify-between'>
                    <div>
                        <p className='text-[#BC002D] text-[10px] font-black uppercase tracking-[0.4em] mb-2 flex items-center gap-2'>
                            <Megaphone size={12}/> Inner Circle Protocol
                        </p>
                        <h2 className='text-3xl md:text-4xl font-black uppercase tracking-tighter'>Registry Newsletter</h2>
                    </div>
                </div>

                <div className='space-y-8'>
                    <div className='relative'>
                        <p className='text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1'>Headline</p>
                        <input 
                            value={subject} 
                            onChange={e => setSubject(e.target.value)} 
                            className='w-full p-5 bg-gray-50 rounded-2xl text-xl font-black uppercase tracking-tighter outline-none focus:bg-white border-2 border-transparent focus:border-[#BC002D] transition-all placeholder:text-gray-200' 
                            placeholder="THE ARCHIVE UPDATE..." 
                        />
                    </div>

                    <div className='relative'>
                        <p className='text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1'>Intelligence Briefing</p>
                        <textarea 
                            value={message} 
                            onChange={e => setMessage(e.target.value)} 
                            className='w-full h-96 p-8 bg-gray-50 rounded-[32px] outline-none border-2 border-transparent focus:border-[#BC002D] focus:bg-white transition-all text-sm font-bold leading-relaxed placeholder:text-gray-200' 
                            placeholder="Dear Inner Circle, we have secured new specimens..." 
                        />
                    </div>
                    
                    <button 
                        onClick={handleSend} 
                        disabled={loading}
                        className='w-full py-6 bg-black text-white font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-[#BC002D] transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 disabled:bg-gray-100 disabled:text-gray-300'
                    >
                        {loading ? <RefreshCw size={20} className='animate-spin' /> : <Send size={20} />}
                        {loading ? "TRANSMITTING..." : "BroadCast to All Subscribers"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewsletterDispatch;