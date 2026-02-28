import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Trophy, History, Zap, Wallet, ArrowUpRight, ArrowDownLeft, Ticket, Loader2, Star } from 'lucide-react';
import axios from 'axios';

const Rewards = () => {
    const { userPoints, currency, token, backendUrl } = useContext(ShopContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const conversionRate = 10; 
    const cashValue = (userPoints / conversionRate).toFixed(2);

    // --- FETCH DATA FROM THE NEW REGISTRY ROUTE ---
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(backendUrl + '/api/user/reward-history', { 
                    headers: { token } 
                });
                if (res.data.success) {
                    setHistory(res.data.history);
                }
            } catch (err) {
                console.error("Ledger Sync Error:", err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchHistory();
    }, [token, backendUrl]);

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
                    
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='bg-gray-50 p-6 rounded-3xl border border-gray-100'>
                            <Star className='text-amber-500 mb-3' size={20} />
                            <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Status</p>
                            <p className='text-lg font-bold text-gray-900 uppercase'>Elite</p>
                        </div>
                        <div className='bg-gray-50 p-6 rounded-3xl border border-gray-100'>
                            <Zap className='text-[#BC002D] mb-3' size={20} />
                            <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Multiplier</p>
                            <p className='text-lg font-bold text-gray-900 uppercase'>1.2x</p>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: DYNAMIC REGISTRY LEDGER --- */}
                <div className='lg:col-span-2 space-y-12'>
                    
                    <div className='bg-gray-50/50 border border-gray-100 rounded-[40px] p-8 md:p-12'>
                        <div className='flex items-center justify-between mb-8'>
                            <div className='flex items-center gap-4'>
                                <History size={18} className='text-gray-900' />
                                <h4 className='text-sm font-black uppercase tracking-[0.3em] text-gray-900'>Registry Ledger</h4>
                            </div>
                            <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>{history.length} Entries</span>
                        </div>

                        <div className='space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar'>
                            {loading ? (
                                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#BC002D]" /></div>
                            ) : history.length > 0 ? (
                                history.map((item, index) => (
                                    <div key={index} className='flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-[#BC002D]/30 transition-all group'>
                                        <div className='flex items-center gap-4'>
                                            {/* TYPE ICON MAPPING */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                item.type === 'CASHBACK' ? 'bg-green-100 text-green-600' : 
                                                item.type === 'VOUCHER' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-[#BC002D]'
                                            }`}>
                                                {item.type === 'CASHBACK' ? <ArrowDownLeft size={16}/> : 
                                                 item.type === 'VOUCHER' ? <Ticket size={16}/> : <ArrowUpRight size={16}/>}
                                            </div>
                                            
                                            <div>
                                                <p className='text-[10px] font-black text-gray-900 uppercase tracking-widest group-hover:text-[#BC002D] transition-colors'>
                                                    {item.title}
                                                </p>
                                                <p className='text-[8px] font-bold text-gray-400 uppercase mt-1'>
                                                    {item.description} • {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className='text-right'>
                                            <p className={`text-sm font-black tabular-nums ${!item.isNegative ? 'text-green-600' : 'text-gray-900'}`}>
                                                {item.isNegative ? '-' : '+'}{item.amount}
                                            </p>
                                            {item.status && (
                                                <span className={`text-[7px] font-black px-2 py-0.5 rounded-full uppercase ${
                                                    item.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className='py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200'>
                                    <Trophy size={32} className='mx-auto text-gray-200 mb-4' />
                                    <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Registry Archive Empty.</p>
                                    <p className='text-[9px] text-gray-300 uppercase mt-1'>Complete an order to begin your history.</p>
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