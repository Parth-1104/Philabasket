import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { 
  Trophy, TrendingUp, RefreshCw, X, ChevronUp, 
  Gift, Users, ArrowRight, ChevronLeft
} from 'lucide-react';

const UtilityBar = () => {
    const { 
        currency, toggleCurrency, token, userPoints, navigate 
    } = useContext(ShopContext);

    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobileDockOpen, setIsMobileDockOpen] = useState(false); 

    const calculateValue = () => {
        const inrValue = (userPoints || 0) / 10;
        return currency === 'INR' ? inrValue : inrValue / 83;
    };

    return (
        <div className={`fixed bottom-6 z-[100] flex flex-col items-center transition-all duration-500
            ${isMobileDockOpen ? 'left-4 right-4' : 'right-6 md:left-1/2 md:-translate-x-1/2 md:right-auto'}`}>
            
            {/* --- 1. THE DETAIL PANEL (Pops up above the bar) --- */}
            <div className={`bg-black/95 backdrop-blur-2xl border border-white/10 rounded-[30px] overflow-hidden transition-all duration-500 shadow-2xl w-full max-w-[400px]
                ${isExpanded ? 'max-h-[500px] mb-4 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                <div className='p-6'>
                    <div className='flex justify-between items-center mb-6'>
                        <h3 className='text-[10px] font-black text-white uppercase tracking-[0.3em]'>Archive Rewards</h3>
                        <X size={16} className='text-gray-500 cursor-pointer hover:text-white' onClick={() => setIsExpanded(false)} />
                    </div>

                    <div className='grid grid-cols-2 gap-3 mb-6'>
                        <div className='bg-white/5 p-4 rounded-2xl border border-white/5'>
                            <p className='text-[7px] font-black text-[#BC002D] uppercase mb-1'>Conversion</p>
                            <p className='text-[10px] font-bold text-gray-200'>10 PTS = 1.00 INR</p>
                        </div>
                        <div className='bg-white/5 p-4 rounded-2xl border border-white/5'>
                            <p className='text-[7px] font-black text-green-500 uppercase mb-1'>Collector Perk</p>
                            <p className='text-[10px] font-bold text-gray-200'>10% Points Back</p>
                        </div>
                    </div>

                    <div 
                        onClick={() => { navigate(token ? '/referral' : '/login'); setIsExpanded(false); setIsMobileDockOpen(false); }}
                        className='bg-[#BC002D] p-4 rounded-2xl flex items-center justify-between group cursor-pointer active:scale-95 transition-all'
                    >
                        <div className='flex items-center gap-3'>
                            <Users size={18} className='text-white' />
                            <div>
                                <p className='text-[9px] font-black text-white uppercase'>Invite a Collector</p>
                                <p className='text-[8px] text-white/70 font-bold'>+50 BONUS POINTS</p>
                            </div>
                        </div>
                        <ArrowRight size={14} className='text-white' />
                    </div>
                </div>
            </div>

            {/* --- 2. THE MAIN BAR LOGIC --- */}
            <div className='w-full flex justify-center'>
                
                {/* A. MOBILE ICON BUTTON (Visible only when mobile dock is closed) */}
                {!isMobileDockOpen && (
                    <button 
                        onClick={() => setIsMobileDockOpen(true)}
                        className='md:hidden w-14 h-14 bg-[#BC002D] rounded-full flex items-center justify-center shadow-2xl animate-bounce-subtle border-2 border-white/10 relative'
                    >
                        {token ? <Trophy size={22} className='text-white' /> : <Gift size={22} className='text-white' />}
                        {token && userPoints > 0 && (
                             <span className='absolute -top-1 -right-1 bg-black text-white text-[8px] px-1.5 py-0.5 rounded-full font-black border border-white/20'>
                                {userPoints}
                             </span>
                        )}
                    </button>
                )}

                {/* B. DESKTOP BAR & OPEN MOBILE DOCK */}
                <div className={`${isMobileDockOpen ? 'flex' : 'hidden'} md:flex w-full md:w-max md:min-w-[500px] items-center justify-between bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 md:px-6 md:py-3 shadow-2xl transition-all`}>
                    
                    {/* Points Status */}
                    <div onClick={() => setIsExpanded(!isExpanded)} className='flex items-center gap-2 md:gap-3 cursor-pointer shrink-0 group'>
                        <div className='bg-[#BC002D] p-2 rounded-full group-hover:scale-110 transition-transform'>
                            {token ? <Trophy size={14} className='text-white' /> : <Gift size={14} className='text-white' />}
                        </div>
                        <div className='flex flex-col'>
                            <p className='text-[6px] md:text-[7px] font-black text-[#BC002D] uppercase tracking-widest leading-none mb-1'>
                                {token ? 'Collector' : 'Archive'}
                            </p>
                            <p className='text-[9px] md:text-[11px] font-black text-white uppercase tracking-tighter'>
                                {token ? `${userPoints} PTS` : 'Sign Up'}
                            </p>
                        </div>
                    </div>

                    <div className='h-8 w-[1px] bg-white/10 mx-2 md:mx-4'></div>

                    {/* Value Display */}
                    <div className='flex flex-col items-center shrink-0'>
                        <p className='text-[6px] md:text-[7px] font-black text-green-500 uppercase tracking-widest mb-1'>Registry Value</p>
                        <p className='text-[10px] md:text-[12px] font-black text-white tabular-nums'>
                            <span className='text-[8px] text-gray-400 mr-1'>{currency}</span>
                            {calculateValue().toFixed(2)}
                        </p>
                    </div>

                    <div className='h-8 w-[1px] bg-white/10 mx-2 md:mx-4'></div>

                    {/* Currency & Actions */}
                    <div className='flex items-center gap-2 md:gap-4'>
                        {/* Currency Selector */}
                        <div className='flex items-center bg-white/5 rounded-full p-0.5 md:p-1 border border-white/5'>
                            {['INR', 'USD'].map((curr) => (
                                <button
                                    key={curr}
                                    onClick={(e) => { e.stopPropagation(); toggleCurrency(curr); }}
                                    className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-[8px] md:text-[9px] font-black transition-all ${currency === curr ? 'bg-[#BC002D] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                >
                                    {curr}
                                </button>
                            ))}
                        </div>

                        {/* Expansion Arrow */}
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className='text-gray-500 hover:text-white transition-colors'
                        >
                            <ChevronUp size={18} className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        {/* MOBILE COLLAPSE ICON (Back to Circle) */}
                        <button 
                            onClick={() => { setIsMobileDockOpen(false); setIsExpanded(false); }} 
                            className='md:hidden bg-white/10 p-2 rounded-full text-[#BC002D]'
                        >
                            <ChevronLeft size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .animate-bounce-subtle { animation: bounce-subtle 3s infinite ease-in-out; }
            `}} />
        </div>
    );
};

export default UtilityBar;