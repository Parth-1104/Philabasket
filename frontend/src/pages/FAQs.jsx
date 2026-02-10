import React from 'react';
import { HelpCircle, CreditCard, Truck, PhoneCall, Mail, MessageSquare } from 'lucide-react';

const FAQ = () => {
    return (
        <div className='bg-white min-h-screen pt-10 pb-20 px-6 md:px-16 lg:px-24 select-none animate-fade-in'>
            
            {/* --- HEADER --- */}
            <div className='mb-16'>
                <div className='flex items-center gap-4 mb-4'>
                    <span className='h-[1.5px] w-12 bg-[#BC002D]'></span>
                    <p className='text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-black'>Support Center</p>
                </div>
                <h2 className='text-4xl md:text-6xl font-bold text-gray-900 tracking-tighter uppercase'>
                    Common <span className='text-[#BC002D]'>Inquiries.</span>
                </h2>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-16'>
                
                {/* --- LEFT: CATEGORIZED QUESTIONS --- */}
                <div className='lg:col-span-2 space-y-12'>
                    
                    {/* SECTION: ORDERING */}
                    <section>
                        <div className='flex items-center gap-3 mb-8'>
                            <HelpCircle size={20} className='text-[#BC002D]' />
                            <h3 className='text-sm font-black uppercase tracking-[0.3em] text-gray-900'>Ordering & Process</h3>
                        </div>
                        <div className='space-y-6'>
                            <div className='border-b border-gray-100 pb-6'>
                                <p className='text-[11px] font-black uppercase tracking-widest text-gray-900 mb-2'>Do I have to order online?</p>
                                <p className='text-[12px] text-gray-500 font-medium leading-relaxed uppercase'>
                                    Yes. As a specialized online philatelic retailer, all transactions must be completed through our secure registry portal. This ensures speed, archival tracking, and safety.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION: PAYMENTS */}
                    <section>
                        <div className='flex items-center gap-3 mb-8'>
                            <CreditCard size={20} className='text-[#BC002D]' />
                            <h3 className='text-sm font-black uppercase tracking-[0.3em] text-gray-900'>Payment Methods</h3>
                        </div>
                        <div className='bg-gray-50 p-8 rounded-3xl border border-gray-100'>
                            <p className='text-[11px] font-black uppercase tracking-widest text-gray-900 mb-4'>Accepted Gateways:</p>
                            <div className='flex flex-wrap gap-4 text-[10px] font-bold text-gray-400 uppercase'>
                                <span>Visa / Maestro / Mastercard</span>
                                <span className='text-gray-200'>|</span>
                                <span>PayPal</span>
                                <span className='text-gray-200'>|</span>
                                <span>Apple Pay / Google Pay</span>
                                <span className='text-gray-200'>|</span>
                                <span>Amazon Payments</span>
                            </div>
                        </div>
                    </section>

                    {/* SECTION: SHIPPING */}
                    <section>
                        <div className='flex items-center gap-3 mb-8'>
                            <Truck size={20} className='text-[#BC002D]' />
                            <h3 className='text-sm font-black uppercase tracking-[0.3em] text-gray-900'>Shipping & Logistics</h3>
                        </div>
                        <div className='space-y-8'>
                            <div>
                                <p className='text-[11px] font-black uppercase tracking-widest text-gray-900 mb-2'>When does my order ship?</p>
                                <p className='text-[12px] text-gray-500 font-medium leading-relaxed uppercase'>
                                    Orders are dispatched based on archival availability. While most specimens ship within 24-48 hours, some rare items require extra processing time for condition verification.
                                </p>
                            </div>
                            <div className='p-6 border-l-2 border-[#BC002D] bg-gray-50/50'>
                                <p className='text-[10px] font-black uppercase tracking-widest text-[#BC002D] mb-1'>Same Day Shipping</p>
                                <p className='text-[11px] text-gray-500 font-bold uppercase'>Orders placed by 4pm ET are processed same-day for eligible products.</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* --- RIGHT: CONTACT & FEEDBACK --- */}
                <div className='lg:col-span-1 space-y-8'>
                    
                    {/* CONTACT CARD */}
                    <div className='bg-black p-10 rounded-br-[60px] shadow-2xl text-white'>
                        <h4 className='text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-[#BC002D]'>Connect with us</h4>
                        <div className='space-y-6'>
                            <div className='flex items-center gap-4 group cursor-pointer'>
                                <PhoneCall size={16} className='text-white/40 group-hover:text-white transition-colors' />
                                <p className='text-[11px] font-bold uppercase tracking-widest'>+91 99991 67799</p>
                            </div>
                            <div className='flex items-center gap-4 group cursor-pointer'>
                                <Mail size={16} className='text-white/40 group-hover:text-white transition-colors' />
                                <p className='text-[11px] font-bold uppercase tracking-widest'>Admin@philabasket.com</p>
                            </div>
                        </div>
                    </div>

                    {/* TESTIMONIAL SLIDER (Simplified) */}
                    <div className='p-8 bg-white border border-gray-100 rounded-3xl'>
                         <MessageSquare size={18} className='text-[#BC002D] mb-6' />
                         <p className='text-[11px] font-bold text-gray-500 uppercase leading-relaxed mb-6 italic'>
                            "The condition of the stamps exceeded expectations. The archival tracking makes PhilaBasket my primary source for definitive specimens."
                         </p>
                         <div className='flex items-center gap-3'>
                            <div className='w-8 h-8 bg-gray-200 rounded-full'></div>
                            <div>
                                <p className='text-[9px] font-black text-gray-900 uppercase'>Tushar Chowdhury</p>
                                <p className='text-[7px] font-bold text-gray-400 uppercase'>Collector</p>
                            </div>
                         </div>
                    </div>

                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .animate-fade-in { animation: fadeIn 0.8s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
};

export default FAQ;