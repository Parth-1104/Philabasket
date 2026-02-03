import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';

const NewsletterDispatch = ({ token }) => {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const handleSend = async () => {
        const response = await axios.post(backendUrl + '/api/mail/send-bulk', 
            { target: 'subscribers', subject, message, excludedEmails: [] },
            { headers: { token } }
        );
        if(response.data.success) toast.success("Newsletter Dispatched to Inner Circle");
    };

    return (
        <div className='p-8 bg-white rounded-3xl border border-gray-100 max-w-4xl'>
            <div className='mb-10'>
                <p className='text-[#BC002D] text-[10px] font-black uppercase tracking-[0.4em]'>Inner Circle Broadcast</p>
                <h2 className='text-3xl font-black uppercase tracking-tighter'>Registry Newsletter</h2>
            </div>

            <div className='space-y-6'>
                <input value={subject} onChange={e=>setSubject(e.target.value)} className='w-full p-4 border-b text-xl font-bold outline-none focus:border-[#BC002D]' placeholder="Newsletter Headline..." />
                <textarea value={message} onChange={e=>setMessage(e.target.value)} className='w-full h-96 p-6 bg-gray-50 rounded-2xl outline-none border-transparent focus:border-[#BC002D]' placeholder="Dear Inner Circle..." />
                
                <button onClick={handleSend} className='px-12 py-4 bg-black text-white font-black uppercase tracking-[0.3em] rounded-full hover:bg-[#BC002D] transition-all'>
                    BroadCast to All Subscribers
                </button>
            </div>
        </div>
    );
};

export default NewsletterDispatch;