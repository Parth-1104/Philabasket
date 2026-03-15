import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { Mail, Calendar, User, MessageSquare, Trash2, Phone, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

const ContactMessages = ({ token }) => {
    const [messages, setMessages] = useState([]);
    const [expandedId, setExpandedId] = useState(null); // Tracks which message is open

    const fetchMessages = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/contact/list', { headers: { token } });
            if (response.data.success) {
                setMessages(response.data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const deleteMessage = async (id) => {
        if (window.confirm("Archive this entry permanently?")) {
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

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    useEffect(() => { fetchMessages(); }, []);

    return (
        <div className='w-full'>
            <div className='flex items-center gap-4 mb-8'>
                <div className='h-8 w-[2px] bg-[#BC002D]'></div>
                <h2 className='text-2xl font-bold tracking-tighter uppercase'>Inquiry <span className='text-[#BC002D]'>Logs.</span></h2>
            </div>

            <div className='grid grid-cols-1 gap-4'>
                {messages.length > 0 ? messages.map((item, index) => {
                    const isExpanded = expandedId === item._id;

                    return (
                        <div key={index} className={`bg-white border ${isExpanded ? 'border-[#BC002D]/30 shadow-md' : 'border-gray-100 shadow-sm'} rounded-[25px] transition-all duration-300 overflow-hidden`}>
                            
                            {/* TOP HEADER: Always Visible */}
                            <div 
                                onClick={() => toggleExpand(item._id)} 
                                className='p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors'
                            >
                                <div className='flex items-center gap-4 flex-1'>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isExpanded ? 'bg-[#BC002D] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        <User size={18} />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex items-center gap-2'>
                                            <h4 className='text-xs font-black uppercase truncate'>{item.name}</h4>
                                            <span className='text-[8px] font-black bg-black text-white px-2 py-0.5 rounded-sm uppercase tracking-widest'>
                                                {item.inquiryType || "General"}
                                            </span>
                                        </div>
                                        <p className='text-[10px] text-gray-400 truncate font-sans mt-0.5'>{item.subject}</p>
                                    </div>
                                </div>
                                
                                <div className='flex items-center gap-4'>
                                    <p className='hidden md:block text-[9px] text-gray-300 font-bold uppercase tracking-wider'>
                                        {new Date(item.date).toLocaleDateString()}
                                    </p>
                                    {isExpanded ? <ChevronUp size={16} className='text-[#BC002D]' /> : <ChevronDown size={16} className='text-gray-400' />}
                                </div>
                            </div>

                            {/* COLLAPSIBLE CONTENT */}
                            {isExpanded && (
                                <div className='px-6 pb-6 pt-2 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-300'>
                                    <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
                                        
                                        {/* Meta Details */}
                                        <div className='md:col-span-4 space-y-3 bg-gray-50 p-4 rounded-2xl'>
                                            <div className='flex items-center gap-3 text-[11px] font-sans text-gray-600'>
                                                <Mail size={14} className='text-[#BC002D]' /> {item.email}
                                            </div>
                                            <div className='flex items-center gap-3 text-[11px] font-sans text-gray-600'>
                                                <Phone size={14} className='text-[#BC002D]' /> {item.phone}
                                            </div>
                                            <div className='flex items-center gap-3 text-[11px] font-sans text-gray-600'>
                                                <Calendar size={14} className='text-[#BC002D]' /> {new Date(item.date).toLocaleString()}
                                            </div>
                                        </div>

                                        {/* Message Text */}
                                        <div className='md:col-span-6'>
                                            <h5 className='text-[10px] font-black uppercase text-[#BC002D] mb-2 tracking-widest'>Communication Contents</h5>
                                            <div className='flex gap-3'>
                                                <MessageSquare size={16} className='text-gray-200 shrink-0' />
                                                <p className='text-xs text-gray-600 leading-relaxed font-sans'>
                                                    {item.message}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className='md:col-span-2 flex md:flex-col justify-center items-center gap-2 border-l border-gray-100 pl-4'>
                                            <button 
                                                onClick={() => deleteMessage(item._id)}
                                                className='w-full p-3 flex justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all'
                                                title="Archive"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <a 
                                                href={`mailto:${item.email}?subject=Re: ${item.subject}`}
                                                className='w-full p-3 flex justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all'
                                                title="Email"
                                            >
                                                <Mail size={18} />
                                            </a>
                                            <a 
    // The ?. and || "" ensures that if phone is missing, it won't crash
    href={`https://wa.me/${(item.phone || "").replace(/[^0-9]/g, '')}?text=Hello ${item.name}, regarding: ${item.subject}`}
    target="_blank"
    rel="noopener noreferrer"
    className='w-full p-3 flex justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all'
    title="WhatsApp"
>
    <MessageCircle size={18} />
</a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }) : (
                    <div className='py-20 text-center border-2 border-dashed border-gray-100 rounded-[40px]'>
                        <p className='text-[10px] font-black uppercase tracking-[0.5em] text-gray-300'>No active communications found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactMessages;