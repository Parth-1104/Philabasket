import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';

const Referral = () => {
    const { token, userData, navigate } = useContext(ShopContext);
    const [copied, setCopied] = useState(false);

    // Dynamic URL detection
    const referralCode = userData?.referralCode;
    const referralLink = `${window.location.origin}/login?ref=${referralCode}`;

    const copyToClipboard = () => {
        if (!referralCode) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // 1. Guard: If not logged in
    if (!token) {
        return (
            <div className='min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-center px-6'>
                <h2 className='text-[#B8860B] font-serif text-3xl mb-4 italic'>Collector's Invitation Required</h2>
                <button onClick={() => navigate('/login')} className='bg-[#B8860B] text-black px-10 py-3 text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-white transition-all'>
                    Login to Join
                </button>
            </div>
        );
    }

    // 2. Guard: If logged in but data is still traveling from Backend
    if (!userData) {
        return (
            <div className='min-h-screen bg-[#0a0a0a] flex items-center justify-center'>
                <div className='animate-pulse flex flex-col items-center gap-4'>
                    <div className='w-12 h-12 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin'></div>
                    <p className='text-[#B8860B] font-serif tracking-[0.3em] uppercase text-[10px]'>Verifying Lineage...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-[#0a0a0a] min-h-screen pt-28 pb-20 px-6 md:px-16 lg:px-24 text-white select-none animate-fade-in'>
            <div className='text-center mb-20'>
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#B8860B]"></div>
                    <span className="text-[10px] tracking-[0.5em] text-[#B8860B] uppercase font-light">The Inner Circle</span>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#B8860B]"></div>
                </div>
                <h2 className='text-4xl md:text-6xl font-serif mb-6 tracking-tight'>
                    Expand the <span className='italic text-[#B8860B]'>Lineage</span>
                </h2>
                <p className='text-gray-400 max-w-2xl mx-auto text-sm font-light leading-relaxed'>
                    Invite distinguished collectors to the PhilaBasket Archive. Earn 500 PTS per successful acquisition.
                </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto'>
                <div className='bg-[#111111] border border-[#B8860B]/20 p-8 md:p-12 relative overflow-hidden rounded-sm shadow-2xl'>
                    <div className='relative z-10'>
                        <h3 className='text-[#B8860B] font-serif text-xl mb-8 uppercase tracking-widest'>Your Unique Invitation</h3>
                        <div className='space-y-6'>
                            <div className='bg-black/50 border border-white/5 p-5 flex flex-col gap-2 rounded-sm'>
                                <p className='text-[10px] text-gray-500 uppercase tracking-[0.3em]'>Invitation Code</p>
                                <p className='text-2xl font-mono text-white tracking-[0.2em] font-bold'>{referralCode}</p>
                            </div>
                            <div className='relative'>
                                <p className='text-[10px] text-gray-500 uppercase tracking-[0.3em] mb-3'>Direct Link</p>
                                <div className='bg-black/50 border border-white/5 p-5 pr-32 truncate text-xs text-gray-400 italic font-light'>
                                    {referralLink}
                                </div>
                                <button onClick={copyToClipboard} className='absolute right-2 bottom-2 bg-[#B8860B] text-black px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all'>
                                    {copied ? 'COPIED' : 'COPY'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='space-y-8 flex flex-col justify-center'>
                    <div className='border-l border-[#B8860B]/40 pl-8 space-y-10'>
                        <h4 className='text-white text-lg font-serif uppercase tracking-[0.3em]'>The Protocol</h4>
                        <div className='space-y-8'>
                            <div className='flex gap-6 group'>
                                <span className='text-[#B8860B] font-serif text-2xl opacity-40'>01.</span>
                                <div>
                                    <p className='text-xs text-gray-200 font-bold uppercase tracking-[0.2em] mb-2'>Send Invitation</p>
                                    <p className='text-[11px] text-gray-500 font-light leading-relaxed uppercase tracking-wider'>Share your unique link with fellow philatelists.</p>
                                </div>
                            </div>
                            <div className='flex gap-6 group'>
                                <span className='text-[#B8860B] font-serif text-2xl opacity-40'>02.</span>
                                <div>
                                    <p className='text-xs text-gray-200 font-bold uppercase tracking-[0.2em] mb-2'>First Acquisition</p>
                                    <p className='text-[11px] text-gray-500 font-light leading-relaxed uppercase tracking-wider'>Your referee completes their first verified purchase.</p>
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