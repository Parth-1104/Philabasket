import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';

const Referral = () => {
    const { token, userData, navigate } = useContext(ShopContext);
    const [copied, setCopied] = useState(false);

    // Add a fallback to prevent "undefined" links in deployment
const referralCode = userData?.referralCode || "LOADING";
// Ensure we are using the absolute base path to the login route
const referralLink = `${window.location.protocol}//${window.location.host}/login?ref=${referralCode}`;

    const copyToClipboard = () => {
        if (!referralCode) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // 1. Guard: If not logged in - The Parchment Theme
    if (!token) {
        return (
            <div className='min-h-screen flex flex-col items-center justify-center bg-[#FCF9F4] text-center px-6'>
                <h2 className='text-black font-serif text-3xl mb-4 italic'>Collector's Invitation Required</h2>
                <p className='text-gray-400 text-[10px] uppercase tracking-[0.4em] mb-8'>Identity Verification Necessary for Lineage Access</p>
                <button onClick={() => navigate('/login')} className='bg-black text-white px-12 py-4 text-[10px] font-black tracking-[0.5em] uppercase hover:bg-[#BC002D] transition-all shadow-xl'>
                    Initialize Access
                </button>
            </div>
        );
    }

    // 2. Guard: Data Loading
    if (!userData) {
        return (
            <div className='min-h-screen bg-[#FCF9F4] flex items-center justify-center'>
                <div className='flex flex-col items-center gap-4'>
                    <div className='w-10 h-10 border-2 border-[#BC002D] border-t-transparent rounded-full animate-spin'></div>
                    <p className='text-[#BC002D] font-black tracking-[0.4em] uppercase text-[9px] animate-pulse'>Verifying Registry Lineage...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-[#FCF9F4] min-h-screen pt-28 pb-20 px-6 md:px-16 lg:px-24 text-black select-none animate-fade-in'>
            <div className='text-center mb-20'>
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="h-[1px] w-12 bg-[#BC002D]/20"></div>
                    <span className="text-[10px] tracking-[0.5em] text-[#BC002D] uppercase font-black">The Inner Circle</span>
                    <div className="h-[1px] w-12 bg-[#BC002D]/20"></div>
                </div>
                <h2 className='text-4xl md:text-7xl font-serif mb-6 tracking-tighter'>
                    Expand the <span className='italic font-light text-[#BC002D]'>Lineage.</span>
                </h2>
                <p className='text-gray-400 max-w-2xl mx-auto text-xs font-bold uppercase tracking-[0.2em] leading-relaxed'>
                    Invite distinguished collectors to the archive. Earn 50 PTS per verified acquisition.
                </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto'>
                {/* Left Card: The Invitation */}
                <div className='bg-white border border-black/5 p-8 md:p-12 relative overflow-hidden rounded-sm shadow-2xl'>
                    <div className='absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none'>
                        <img src={assets.logo} className='w-40' alt="" />
                    </div>
                    
                    <div className='relative z-10'>
                        <h3 className='text-black font-serif text-2xl mb-8 tracking-tight'>Registry Credentials</h3>
                        <div className='space-y-6'>
                            <div className='bg-[#F9F9F9] border border-black/5 p-6 flex flex-col gap-2 rounded-sm'>
                                <p className='text-[9px] text-gray-400 uppercase tracking-[0.4em] font-black'>Unique Registry Code</p>
                                <p className='text-3xl font-mono text-[#BC002D] tracking-[0.2em] font-black'>{referralCode}</p>
                            </div>
                            
                            <div className='relative'>
                                <p className='text-[9px] text-gray-400 uppercase tracking-[0.4em] mb-3 font-black'>Digital Summons Link</p>
                                <div className='bg-[#F9F9F9] border border-black/5 p-6 pr-32 truncate text-[10px] text-black/40 font-black uppercase tracking-widest'>
                                    {referralLink}
                                </div>
                                <button onClick={copyToClipboard} className='absolute right-2 bottom-2 bg-black text-white px-6 py-3 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-[#BC002D] transition-all'>
                                    {copied ? 'REGISTERED' : 'ACQUIRE LINK'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content: The Protocol */}
                <div className='flex flex-col justify-center'>
                    <div className='border-l-2 border-[#BC002D] pl-10 space-y-12'>
                        <h4 className='text-black text-[11px] font-black uppercase tracking-[0.5em]'>Referral Protocol</h4>
                        
                        <div className='space-y-10'>
                            <div className='flex gap-6 group'>
                                <span className='text-[#BC002D] font-serif text-3xl opacity-20 group-hover:opacity-100 transition-opacity'>01.</span>
                                <div>
                                    <p className='text-[10px] text-black font-black uppercase tracking-[0.3em] mb-2'>Issue Summons</p>
                                    <p className='text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-widest'>Share your unique link with fellow philatelists to begin their registry entry.</p>
                                </div>
                            </div>
                            
                            <div className='flex gap-6 group'>
                                <span className='text-[#BC002D] font-serif text-3xl opacity-20 group-hover:opacity-100 transition-opacity'>02.</span>
                                <div>
                                    <p className='text-[10px] text-black font-black uppercase tracking-[0.3em] mb-2'>First Acquisition</p>
                                    <p className='text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-widest'>Upon their first successful specimen acquisition, your vault will be credited with 500 PTS.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Referral;