import React from 'react';
import { Truck, ShieldCheck, Globe, Clock, RotateCcw, AlertTriangle, Mail } from 'lucide-react';

const Shipping = () => {
    return (
        <div className='bg-white min-h-screen pt-10 pb-20 px-6 md:px-16 lg:px-24 select-none animate-fade-in'>
            
            {/* --- HEADER --- */}
            <div className='mb-16'>
                <div className='flex items-center gap-4 mb-4'>
                    <span className='h-[1.5px] w-12 bg-[#BC002D]'></span>
                    <p className='text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-black'>Logistics & Support</p>
                </div>
                <h2 className='text-4xl md:text-6xl font-bold text-gray-900 tracking-tighter uppercase leading-none'>
                    Delivery & <span className='text-[#BC002D]'>Returns.</span>
                </h2>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-16'>
                
                {/* --- LEFT: SHIPPING DETAILS --- */}
                <div className='lg:col-span-2 space-y-16'>
                    
                    {/* SECTION: SHIPPING METHOD */}
                    <section>
                        <div className='flex items-center gap-3 mb-8'>
                            <Truck size={20} className='text-[#BC002D]' />
                            <h3 className='text-sm font-black uppercase tracking-[0.3em] text-gray-900'>Shipping Strategy</h3>
                        </div>
                        <div className='bg-gray-50 p-8 rounded-br-[60px] border border-gray-100'>
                            <p className='text-[12px] text-gray-600 font-medium leading-relaxed uppercase tracking-wider mb-6'>
                                PhilaBasket dispatches all parcels exclusively through <span className='text-black font-black'>INDIA POST</span> (Speed Post / Registered Post / Registered Parcel) for reliable service.
                            </p>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div className='flex items-start gap-4'>
                                    <Clock size={16} className='text-[#BC002D] mt-1' />
                                    <div>
                                        <p className='text-[10px] font-black uppercase tracking-widest text-gray-900'>Dispatch Time</p>
                                        <p className='text-[11px] font-bold text-gray-400 uppercase'>Within 2 working days</p>
                                    </div>
                                </div>
                                <div className='flex items-start gap-4'>
                                    <Globe size={16} className='text-[#BC002D] mt-1' />
                                    <div>
                                        <p className='text-[10px] font-black uppercase tracking-widest text-gray-900'>Coverage</p>
                                        <p className='text-[11px] font-bold text-gray-400 uppercase'>Worldwide Delivery</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION: TRANSIT SECURITY */}
                    <section>
                        <div className='flex items-center gap-3 mb-8'>
                            <ShieldCheck size={20} className='text-[#BC002D]' />
                            <h3 className='text-sm font-black uppercase tracking-[0.3em] text-gray-900'>Transit Security & Packaging</h3>
                        </div>
                        <p className='text-[12px] text-gray-500 font-bold uppercase tracking-widest leading-loose mb-8'>
                            All specimens are secured in <span className='text-black'>28mm hard cardboard</span> with plastic waterproof wrapping, making it nearly impossible for pressure damage to occur during transit.
                        </p>
                        
                        <div className='bg-gray-900 text-white p-8 rounded-2xl'>
                            <p className='text-[9px] font-black text-[#BC002D] uppercase tracking-[0.3em] mb-4'>Optional Transit Insurance</p>
                            <div className='flex flex-col md:flex-row gap-8'>
                                <div className='flex-1'>
                                    <p className='text-[18px] font-bold tracking-tighter'>7% Premium</p>
                                    <p className='text-[9px] font-black text-white/40 uppercase tracking-widest'>Domestic (India)</p>
                                </div>
                                <div className='flex-1'>
                                    <p className='text-[18px] font-bold tracking-tighter'>12.5% Premium</p>
                                    <p className='text-[9px] font-black text-white/40 uppercase tracking-widest'>International</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION: RETURN POLICY */}
                    <section className='pt-8 border-t border-gray-100'>
                        <div className='flex items-center gap-3 mb-8'>
                            <RotateCcw size={20} className='text-[#BC002D]' />
                            <h3 className='text-sm font-black uppercase tracking-[0.3em] text-gray-900'>Return Eligibility</h3>
                        </div>
                        <div className='space-y-6'>
                            <div className='p-6 bg-[#BC002D]/5 rounded-2xl border-l-4 border-[#BC002D]'>
                                <p className='text-[11px] font-black uppercase tracking-widest text-gray-900'>24-Hour Window</p>
                                <p className='text-[12px] text-gray-500 font-medium uppercase leading-relaxed mt-2'>
                                    Refund requests must be initiated within 24 hours of receipt, calculated based on the India Post tracking delivery timestamp.
                                </p>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className='p-6 border border-gray-100 rounded-2xl'>
                                    <p className='text-[9px] font-black text-gray-400 uppercase mb-2'>Calculation (Other Cases)</p>
                                    <p className='text-[10px] font-bold text-gray-900 leading-tight uppercase tracking-wider'>
                                        Net Refund = Total Paid – Shipping – GST
                                    </p>
                                </div>
                                <div className='p-6 border border-gray-100 rounded-2xl'>
                                    <p className='text-[9px] font-black text-gray-400 uppercase mb-2'>Full Refund Cases</p>
                                    <p className='text-[10px] font-bold text-gray-900 leading-tight uppercase tracking-wider'>
                                        Wrong Material / Damaged Items / Dispatch Errors
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* --- RIGHT: RATES & ACTION --- */}
                <div className='lg:col-span-1 space-y-8'>
                    
                    {/* SHIPPING RATES CARD */}
                    <div className='bg-black p-10 rounded-br-[80px] shadow-2xl text-white'>
                        <h4 className='text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-[#BC002D]'>Flat Rates</h4>
                        <div className='space-y-8'>
                            <div>
                                <p className='text-3xl font-bold tracking-tighter'>₹99</p>
                                <p className='text-[9px] font-black text-white/40 uppercase tracking-widest'>Speed Post (India) - 7 Days</p>
                            </div>
                            <div>
                                <p className='text-3xl font-bold tracking-tighter'>₹49</p>
                                <p className='text-[9px] font-black text-white/40 uppercase tracking-widest'>Reg. Post (India) - 14 Days</p>
                            </div>
                            <div className='pt-6 border-t border-white/10'>
                                <p className='text-3xl font-bold tracking-tighter'>₹749</p>
                                <p className='text-[9px] font-black text-white/40 uppercase tracking-widest'>Worldwide - 20 Days</p>
                            </div>
                        </div>
                    </div>

                    {/* CONTACT CARD */}
                    <div className='p-8 bg-gray-50 rounded-3xl border border-gray-100'>
                         <Mail size={18} className='text-[#BC002D] mb-6' />
                         <p className='text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2'>Initiate Refund</p>
                         <p className='text-[11px] font-black text-gray-900 uppercase tracking-widest mb-6'>admin@philabasket.com</p>
                         <div className='flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full w-fit'>
                            <AlertTriangle size={12} className='text-amber-700' />
                            <p className='text-[8px] font-black text-amber-700 uppercase'>10 Working Days Processing</p>
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

export default Shipping;