import React, { useState, useContext } from 'react';
import { Mail, Phone, MapPin, Send, Globe } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { SiInstagram, SiFacebook, SiYoutube, SiX, SiWhatsapp } from 'react-icons/si';

const Contact = () => {
    const { backendUrl } = useContext(ShopContext);
    
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        phone: '', 
        inquiryType: '', 
        subject: '',     
        message: '' 
    });
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(backendUrl + '/api/contact/add', formData);
            if (response.data.success) {
                toast.success("Message Logged in Registry");
                setFormData({ name: '', email: '', phone: '', inquiryType: '', subject: '', message: '' });
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='bg-[#FCF9F4] min-h-screen pt-16 pb-24 px-6 md:px-16 lg:px-24 text-black font-serif'>
            <div className='max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20'>
                
                {/* LEFT: INFO */}
                <div className='lg:col-span-5 space-y-12'>
                    <div>
                        <p className='text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-black mb-4'>Inquiry Desk</p>
                        <h2 className='text-4xl md:text-6xl font-bold text-gray-900 tracking-tighter uppercase'>Contact <span className='text-[#BC002D]'>Us.</span></h2>
                    </div>

                    <div className='space-y-8 pt-10 border-t border-gray-100'>
                        <div className='flex gap-6'>
                            <Mail size={20} className='text-[#BC002D] mt-1' />
                            <div>
                                <h4 className='text-xs font-black uppercase mb-1'>Registry Support</h4>
                                <p className='text-sm text-gray-500 font-sans'>admin@philabasket.com</p>
                            </div>
                        </div>
                        <div className='flex gap-6'>
                            <MapPin size={20} className='text-[#BC002D] mt-1' />
                            <div>
                                <h4 className='text-xs font-black uppercase mb-1'>Archive HQ</h4>
                                <p className='text-sm text-gray-500 font-sans'>New Delhi, India</p>
                                {/* Added Contact Mobile Number here */}
                                <p className='text-[11px] text-[#BC002D] font-bold font-sans mt-2 flex items-center gap-2'>
                                    <Phone size={12} /><SiWhatsapp size={12} /> +91 9999167799
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: FORM */}
                <div className='lg:col-span-7 bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100'>
                    <form onSubmit={onSubmitHandler} className='space-y-6'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <input required value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} type="text" placeholder="FULL NAME" className='w-full bg-gray-50 border-none p-4 rounded-xl text-xs font-bold focus:ring-1 ring-[#BC002D]/20 outline-none' />
                            <input required value={formData.email} onChange={(e)=>setFormData({...formData, email:e.target.value})} type="email" placeholder="EMAIL ADDRESS" className='w-full bg-gray-50 border-none p-4 rounded-xl text-xs font-bold focus:ring-1 ring-[#BC002D]/20 outline-none' />
                        </div>
                        
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            {/* Mobile Field Restricted to 10 Digits */}
                            <input 
                                required 
                                value={formData.phone} 
                                onChange={(e)=>setFormData({...formData, phone:e.target.value.replace(/\D/g, '')})} 
                                type="tel" 
                                maxLength="10"
                                pattern="[0-9]{10}"
                                title="Please enter a valid 10-digit mobile number"
                                placeholder="MOBILE NUMBER (10 DIGITS)" 
                                className='w-full bg-gray-50 border-none p-4 rounded-xl text-xs font-bold focus:ring-1 ring-[#BC002D]/20 outline-none' 
                            />
                            
                            <select required value={formData.inquiryType} onChange={(e)=>setFormData({...formData, inquiryType:e.target.value})} className='w-full bg-gray-50 border-none p-4 rounded-xl text-xs font-bold focus:ring-1 ring-[#BC002D]/20 outline-none cursor-pointer'>
                                <option value="" disabled>SELECT TYPE</option>
                                <option value="Feedback">Feedback</option>
                                <option value="Suggestion">Suggestion</option>
                                <option value="Order Issue">Order Issue</option>
                                <option value="Requirement">Requirement</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <input required value={formData.subject} onChange={(e)=>setFormData({...formData, subject:e.target.value})} type="text" placeholder="SUBJECT / TOPIC TITLE" className='w-full bg-gray-50 border-none p-4 rounded-xl text-xs font-bold focus:ring-1 ring-[#BC002D]/20 outline-none' />

                        <textarea required value={formData.message} onChange={(e)=>setFormData({...formData, message:e.target.value})} rows="5" placeholder="YOUR MESSAGE..." className='w-full bg-gray-50 border-none p-4 rounded-xl text-xs font-bold focus:ring-1 ring-[#BC002D]/20 outline-none'></textarea>
                        
                        <button disabled={loading} className='w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#BC002D] transition-all flex items-center justify-center gap-2'>
                            {loading ? "Transmitting..." : <>Transmit Message <Send size={14}/></>}
                        </button>
                    </form>
                </div>
            </div>

            {/* --- MAP SECTION --- */}
            <div className='max-w-6xl mx-auto'>
                <div className='flex items-center gap-4 mb-8'>
                    <Globe size={16} className='text-[#BC002D]' />
                    <h4 className='text-[10px] font-black uppercase tracking-[0.4em]'>Geographical Location</h4>
                    <div className='flex-1 h-[1px] bg-gray-200'></div>
                </div>
                
                <div className='w-full h-[450px] rounded-[40px] overflow-hidden border border-gray-100 shadow-xl shadow-black/[0.02] transition-all duration-700 grayscale hover:grayscale-0'>
                    <iframe 
                        title="PhilaBasket HQ"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.8392319277!2d77.06889754725782!3d28.527280343115164!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b34766245%3A0xfa05465210e73ac2!2sDelhi!5e0!3m2!1sen!2sin!4v1710525600000!5m2!1sen!2sin" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade">
                    </iframe>
                </div>

                <div className='mt-6 flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest'>
                    <p>Co-ordinates: 28.6139° N, 77.2090° E</p>
                    <p>Archive Registry HQ</p>
                </div>
            </div>
        </div>
    );
};

export default Contact;