import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { Mail, Calendar, User, MessageSquare, Trash2 } from 'lucide-react';

const ContactMessages = ({ token }) => {
    const [messages, setMessages] = useState([]);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/contact/list', { headers: { token } });
            if (response.data.success) {
                setMessages(response.data.messages.reverse()); // Latest first
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const deleteMessage = async (id) => {
        if(window.confirm("Archive this entry permanently?")) {
            try {
                const response = await axios.post(backendUrl + '/api/contact/delete', { id }, { headers: { token } });
                if (response.data.success) {
                    toast.success("Entry Removed");
                    fetchMessages();
                }
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    useEffect(() => { fetchMessages(); }, []);

    return (
        <div className='w-full'>
            <div className='flex items-center gap-4 mb-8'>
                <div className='h-8 w-[2px] bg-[#BC002D]'></div>
                <h2 className='text-2xl font-bold tracking-tighter uppercase'>Inquiry <span className='text-[#BC002D]'>Logs.</span></h2>
            </div>

            <div className='grid grid-cols-1 gap-6'>
                {messages.length > 0 ? messages.map((item, index) => (
                    <div key={index} className='bg-white border border-gray-100 rounded-[30px] p-8 shadow-sm hover:shadow-md transition-all group'>
                        <div className='flex flex-col md:flex-row justify-between gap-6'>
                            
                            {/* User Identity */}
                            <div className='flex gap-4 md:w-1/3'>
                                <div className='w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-[#BC002D] shrink-0'>
                                    <User size={20} />
                                </div>
                                <div>
                                    <h4 className='text-sm font-black uppercase tracking-tight'>{item.name}</h4>
                                    <p className='text-[11px] text-gray-400 flex items-center gap-1 mt-1'>
                                        <Mail size={10} /> {item.email}
                                    </p>
                                    <p className='text-[10px] text-gray-300 flex items-center gap-1 mt-1'>
                                        <Calendar size={10} /> {new Date(item.date).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Message Content */}
                            <div className='flex-1 border-l border-gray-50 pl-6'>
                                <span className='text-[9px] font-black text-[#BC002D] uppercase tracking-widest bg-[#BC002D]/5 px-3 py-1 rounded-full'>
                                    Sub: {item.subject}
                                </span>
                                <div className='mt-4 flex gap-3'>
                                    <MessageSquare size={16} className='text-gray-200 shrink-0' />
                                    <p className='text-xs text-gray-600 leading-relaxed font-sans'>
                                        {item.message}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className='flex md:flex-col justify-end gap-2'>
                                <button 
                                    onClick={() => deleteMessage(item._id)}
                                    className='p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all'
                                >
                                    <Trash2 size={18} />
                                </button>
                                <a 
                                    href={`mailto:${item.email}?subject=Re: ${item.subject}`}
                                    className='p-3 text-gray-300 hover:text-[#BC002D] hover:bg-[#BC002D]/5 rounded-xl transition-all'
                                >
                                    <Mail size={18} />
                                </a>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className='py-20 text-center border-2 border-dashed border-gray-100 rounded-[40px]'>
                        <p className='text-[10px] font-black uppercase tracking-[0.5em] text-gray-300'>No active communications found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactMessages;