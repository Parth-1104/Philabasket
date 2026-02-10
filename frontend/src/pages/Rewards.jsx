import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Trophy, History, Zap, ShieldCheck, Wallet, ArrowUpRight, Star } from 'lucide-react';

const Rewards = () => {
    // Pulling userPoints and rewardHistory from Context
    const { userPoints, currency, rewardHistory } = useContext(ShopContext);
    
    const conversionRate = 10; 
    const cashValue = (userPoints / conversionRate).toFixed(2);

    // Sorting history to show most recent first
    const sortedHistory = [...(rewardHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className='bg-white min-h-screen pt-10 pb-20 px-6 md:px-16 lg:px-24 select-none animate-fade-in'>
            
            {/* --- HEADER --- */}
            <div className='mb-16'>
                <div className='flex items-center gap-4 mb-4'>
                    <span className='h-[1.5px] w-12 bg-[#BC002D]'></span>
                    <p className='text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-black'>Member Privileges</p>
                </div>
                <h2 className='text-4xl md:text-6xl font-bold text-gray-900 tracking-tighter uppercase'>
                    Collector <span className='text-[#BC002D]'>Rewards.</span>
                </h2>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>
                
                {/* --- LEFT: USER STATUS CARD --- */}
                <div className='lg:col-span-1 space-y-6'>
                    <div className='bg-black p-10 rounded-br-[80px] shadow-2xl relative overflow-hidden group'>
                        <div className='absolute -right-10 -top-10 w-40 h-40 bg-[#BC002D]/10 rounded-full blur-3xl group-hover:bg-[#BC002D]/30 transition-all duration-700'></div>
                        
                        <div className='relative z-10'>
                            <p className='text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-10'>Current Balance</p>
                            <div className='flex items-end gap-3 mb-2'>
                                <h3 className='text-white text-7xl font-bold tracking-tighter'>{userPoints || 0}</h3>
                                <p className='text-amber-400 text-xs font-black uppercase tracking-widest pb-3'>Points</p>
                            </div>
                            <div className='flex items-center gap-2 text-white/60 mb-12'>
                                <Wallet size={14} />
                                <p className='text-[11px] font-bold uppercase tracking-widest'>Valued at ≈ {currency}{cashValue}</p>
                            </div>

                            <button className='w-full bg-[#BC002D] text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all shadow-lg shadow-[#BC002D]/20 active:scale-95'>
                                Redeem in Checkout
                            </button>
                        </div>
                    </div>
                    
                    {/* STATS TILES TO FILL SPACE */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='bg-gray-50 p-6 rounded-3xl border border-gray-100'>
                            <Star className='text-amber-500 mb-3' size={20} />
                            <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Status</p>
                            <p className='text-lg font-bold text-gray-900 uppercase'>Elite</p>
                        </div>
                        <div className='bg-gray-50 p-6 rounded-3xl border border-gray-100'>
                            <ArrowUpRight className='text-[#BC002D] mb-3' size={20} />
                            <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Growth</p>
                            <p className='text-lg font-bold text-gray-900 uppercase'>+12%</p>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: CONVERSION & ACTIVITY --- */}
                <div className='lg:col-span-2 space-y-12'>
                    
                    {/* CONVERSION INDEX */}
                    <div className='bg-white border border-gray-100 rounded-[40px] p-8 md:p-12 shadow-sm relative overflow-hidden'>
                        <div className='flex items-center justify-between mb-10'>
                            <h4 className='text-sm font-black uppercase tracking-[0.3em] text-gray-900'>Conversion Index</h4>
                            <div className='px-4 py-2 bg-gray-50 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest'>
                                Fixed Rate 10:1
                            </div>
                        </div>

                        <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
                            {[100, 500, 1000, 5000].map((val) => (
                                <div key={val} className='group'>
                                    <p className='text-gray-400 text-[9px] font-black uppercase tracking-widest mb-2 group-hover:text-[#BC002D] transition-colors'>{val} Points</p>
                                    <p className='text-2xl font-bold text-gray-900 tracking-tighter'>{currency}{(val/conversionRate).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* DYNAMIC ACTIVITY LOG */}
                    <div className='bg-gray-50/50 border border-gray-100 rounded-[40px] p-8 md:p-12'>
                        <div className='flex items-center justify-between mb-8'>
                            <div className='flex items-center gap-4'>
                                <History size={18} className='text-gray-900' />
                                <h4 className='text-sm font-black uppercase tracking-[0.3em] text-gray-900'>Activity Log</h4>
                            </div>
                            <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>{sortedHistory.length} Entries</span>
                        </div>

                        <div className='space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar'>
                            {sortedHistory.length > 0 ? (
                                sortedHistory.map((item, index) => (
                                    <div key={index} className='flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-[#BC002D]/30 transition-all group'>
                                        <div className='flex items-center gap-4'>
                                            <div className={`w-1 h-8 rounded-full ${item.type === 'earn' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <div>
                                                <p className='text-[10px] font-black text-gray-900 uppercase tracking-widest group-hover:text-[#BC002D] transition-colors'>
                                                    {item.description}
                                                </p>
                                                <p className='text-[8px] font-bold text-gray-400 uppercase mt-1'>
                                                    {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className='text-right'>
                                            <p className={`text-sm font-black tabular-nums ${item.type === 'earn' ? 'text-green-600' : 'text-red-500'}`}>
                                                {item.type === 'earn' ? '+' : '-'} {item.amount}
                                            </p>
                                            <p className='text-[7px] font-bold text-gray-300 uppercase tracking-tighter mt-1'>Applied</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className='py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200'>
                                    <Trophy size={32} className='mx-auto text-gray-200 mb-4' />
                                    <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>No transactions recorded.</p>
                                    <p className='text-[9px] text-gray-300 uppercase mt-1'>Complete your first order to earn points.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Rewards;