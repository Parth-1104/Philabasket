import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { History, ArrowUpRight, ArrowDownLeft, Ticket, Loader2 } from 'lucide-react';

const RewardHistory = () => {
    const { token, backendUrl } = useContext(ShopContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(backendUrl + '/api/user/reward-history', { headers: { token } });
                if (res.data.success) setHistory(res.data.history);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        if (token) fetchHistory();
    }, [token]);

    if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-[#BC002D]" /></div>;

    return (
        <div className='bg-white border border-black/5 p-8 rounded-sm shadow-sm'>
            <div className='flex items-center gap-3 mb-8'>
                <History size={18} className='text-[#BC002D]' />
                <h4 className='text-[10px] font-black uppercase tracking-[0.3em] text-black'>Registry Ledger</h4>
            </div>

            <div className='space-y-4'>
                {history.map((item, idx) => (
                    <div key={idx} className='flex items-center justify-between p-4 bg-gray-50/50 rounded-sm hover:bg-gray-100 transition-all'>
                        <div className='flex items-center gap-4'>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                item.type === 'CASHBACK' ? 'bg-green-100 text-green-600' : 
                                item.type === 'VOUCHER' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-[#BC002D]'
                            }`}>
                                {item.type === 'CASHBACK' ? <ArrowDownLeft size={16}/> : 
                                 item.type === 'VOUCHER' ? <Ticket size={16}/> : <ArrowUpRight size={16}/>}
                            </div>
                            <div>
                                <p className='text-xs font-bold text-gray-900'>{item.title}</p>
                                <p className='text-[9px] text-gray-400 font-bold uppercase tracking-tighter'>
                                    {new Date(item.createdAt).toLocaleDateString()} • {item.description}
                                </p>
                            </div>
                        </div>
                        <div className='text-right'>
                            <p className={`text-sm font-black ${!item.isNegative ? 'text-green-600' : 'text-gray-900'}`}>
                                {item.isNegative ? '-' : '+'}{item.amount} PTS
                            </p>
                            {item.status && (
                                <span className={`text-[7px] font-black px-2 py-0.5 rounded-full uppercase ${
                                    item.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                    {item.status}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RewardHistory;