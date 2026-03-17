import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    Award, ChevronLeft, Mail, Phone, Package, 
    Calendar, Loader2, History, ChevronRight, Hash ,Zap,Plus,Ticket,ShoppingBag
} from 'lucide-react';
import { backendUrl } from '../App';

const UserDetail = ({ token }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pointInput, setPointInput] = useState("");
    const [adjustmentDescription, setAdjustmentDescription] = useState("");

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${backendUrl}/api/user/detail/${id}`, { headers: { token } });
            if (res.data.success) {
                setUser(res.data.user);
                // Fetch transaction history after user details are confirmed
                const historyRes = await axios.post(`${backendUrl}/api/user/reward-historyadmin`, 
                    { email: res.data.user.email }, 
                    { headers: { token } }
                );
                if (historyRes.data.success) setTransactions(historyRes.data.history);
            }
        } catch (error) {
            toast.error("Failed to sync collector data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && id) fetchUserData();
    }, [id, token]);

    const handlePointAdjustment = async (action) => {
        if (!pointInput || isNaN(pointInput)) return toast.error("Enter a valid numeric valuation");
        if (!adjustmentDescription.trim()) return toast.error("Audit log description required");

        try {
            const res = await axios.post(`${backendUrl}/api/user/adjust-points`, 
                { userId: id, amount: Number(pointInput), action, description: adjustmentDescription }, 
                { headers: { token } }
            );
            if (res.data.success) {
                toast.success(res.data.message);
                setPointInput("");
                setAdjustmentDescription("");
                fetchUserData(); // Refresh data and history
            }
        } catch (error) {
            toast.error("Registry update failed");
        }
    };


    if (loading) return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-[#FCF9F4] gap-4'>
            <Loader2 className='animate-spin text-[#BC002D]' size={32} />
            <p className='text-[10px] uppercase font-black tracking-widest text-gray-400'>Accessing Collector Archive...</p>
        </div>
    );

    return (
        <div className='w-full px-6 md:px-12 py-10  min-h-screen font-serif select-none'>
    
        {/* --- TOP NAVIGATION BAR --- */}
        <div className='max-w-7xl mx-auto flex items-center justify-between mb-10'>
            <button 
                onClick={() => navigate('/users')} 
                className='group flex items-center gap-3 text-gray-400 hover:text-[#BC002D] transition-all text-[11px] font-black uppercase tracking-[0.2em]'
            >
                <div className='p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all'>
                    <ChevronLeft size={16} />
                </div>
                Back to Registry Ledger
            </button>
    
            <div className='text-right'>
                <p className='text-[10px] text-gray-400 uppercase font-bold tracking-widest'>Registry Status</p>
                <div className='flex items-center gap-2 justify-end'>
                    <div className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse'></div>
                    <span className='text-[11px] font-black uppercase tracking-tighter'>Verified Collector</span>
                </div>
            </div>
        </div>
    
        <div className='max-w-7xl mx-auto space-y-12'>
            
            {/* --- TOP SECTION: IDENTITY & WALLET (SIDE BY SIDE) --- */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
                
                {/* Collector Identity Card (5 Units) */}
                <div className='lg:col-span-5 bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex items-center gap-6 relative overflow-hidden'>
    {/* Background Decorative Element */}
    <div className='absolute top-0 right-0 w-20 h-20 bg-[#BC002D]/5 rounded-bl-[80px] z-0'></div>
    
    {/* Avatar - Slightly smaller for better text room */}
    

    {/* Details - Removed ml-[-15px] */}
    <div className='flex-1 min-w-0 z-10'>
        <h2 className='text-[10px] font-black uppercase tracking-tighter text-gray-900 truncate'>
            {user.name}
        </h2>
        
        <div className='flex items-center gap-2 mb-3'>
            <Hash size={12} className='text-[#BC002D]' />
            <span className='text-[10px] text-[#BC002D] font-mono font-bold tracking-tight'>
                {user.referralCode}
            </span>
        </div>

        <div className='space-y-1.5'>
            {/* Email - Increased size to 10px, added truncate for long emails */}
            <div className='flex items-center gap-2 text-[10px] font-bold text-gray-500 lowercase truncate'>
                <Mail size={14} className='text-[#BC002D] flex-shrink-0' /> 
                <span className='truncate'>{user.email}</span>
            </div>
            
            {/* Phone */}
            <div className='flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase'>
                <Phone size={14} className='text-[#BC002D] flex-shrink-0' /> 
                <span>{user.orders?.[0]?.address?.phone || "No Registered Mobile"}</span>
            </div>
        </div>
    </div>
</div>
    
                {/* Adjustment Wallet (7 Units) */}
                <div className='lg:col-span-7 bg-black p-8 rounded-3xl shadow-2xl text-white flex flex-col justify-between'>
                    <div className='flex justify-between items-center mb-6'>
                        <div>
                            <p className='text-[10px] font-black uppercase tracking-[0.2em] text-gray-400'>Vault Valuation</p>
                            <h4 className='text-4xl font-black text-amber-400 tracking-tighter'>
                                {user.totalRewardPoints} <span className='text-xs uppercase text-white/40'>Coins</span>
                            </h4>
                        </div>
                        <div className='flex gap-3'>
                            <input 
                                type="number" 
                                value={pointInput} 
                                onChange={(e)=>setPointInput(e.target.value)} 
                                placeholder="Value" 
                                className='w-24 p-3 bg-white/10 border border-white/10 rounded-xl text-sm font-bold outline-none focus:bg-white/20' 
                            />
                            <input 
                                type="text"
                                value={adjustmentDescription} 
                                onChange={(e)=>setAdjustmentDescription(e.target.value)} 
                                placeholder="Audit Log Description..." 
                                className='flex-1 p-3 bg-white/10 border border-white/10 rounded-xl text-sm outline-none focus:bg-white/20' 
                            />
                        </div>
                    </div>
                    
                    {/* BUTTONS IN ONE ROW */}
                    <div className='grid grid-cols-3 gap-4'>
                        <button onClick={()=>handlePointAdjustment('add')} className='bg-emerald-500 text-white py-3 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-600 transition-all active:scale-95'>+ Add Credit</button>
                        <button onClick={()=>handlePointAdjustment('subtract')} className='bg-red-500 text-white py-3 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 transition-all active:scale-95'>- Sub Debit</button>
                        <button onClick={()=>handlePointAdjustment('overwrite')} className='bg-white/20 text-white py-3 rounded-xl text-[10px] font-black uppercase hover:bg-white/30 transition-all'>Set Balance</button>
                    </div>

                </div>
            </div>
    
            {/* --- BOTTOM SECTION: LIST VIEWS --- */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
                
                {/* Left: Point History Ledger */}
                <div className='space-y-6'>
                    <div className='flex items-center justify-between px-2'>
                        <h3 className='text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3'>
                            <History size={18} className='text-[#BC002D]' /> Registry Ledger
                        </h3>
                        <span className='text-[10px] font-black text-gray-400 uppercase'>{transactions.length} Entries</span>
                    </div>
    
                    <div className='bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden divide-y divide-gray-50 max-h-[600px] overflow-y-auto custom-scrollbar'>
                        {transactions.length > 0 ? transactions.map((item, index) => (
                            <div key={index} className='p-6 hover:bg-gray-50/50 transition-all flex items-center justify-between gap-4'>
                                <div className='flex items-center gap-4'>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.isNegative ? 'bg-red-50 text-[#BC002D]' : 'bg-green-50 text-green-600'}`}>
                                        {item.type === 'VOUCHER' ? <Ticket size={14}/> : <Award size={14}/>}
                                    </div>
                                    <div>
                                        <p className='text-[10px] font-black uppercase tracking-tight'>{item.title}</p>
                                        {item.orderNo && <p className='text-[8px] font-black text-[#BC002D] uppercase mt-0.5'>Order: #{item.orderNo}</p>}
                                        <p className='text-[9px] text-gray-400 font-bold mt-1'>{new Date(item.createdAt).toLocaleDateString('en-GB')}</p>
                                    </div>
                                </div>
                                <div className='text-right'>
                                    <p className={`text-sm font-black ${item.isNegative ? 'text-red-500' : 'text-green-600'}`}>
                                        {item.isNegative ? '-' : '+'}{item.amount}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className='p-20 text-center text-gray-300 text-[10px] font-black uppercase tracking-widest'>No Transaction History</div>
                        )}
                    </div>
                </div>
    
                {/* Right: Collector Acquisitions */}
                <div className='space-y-6'>
                    <div className='flex items-center justify-between px-2'>
                        <h3 className='text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3'>
                            <Package size={18} className='text-[#BC002D]' /> Acquisitions
                        </h3>
                    </div>
    
                    <div className='space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar'>
                        {user.orders?.filter(o => o.status === 'Delivered' || o.status === 'Complete').length > 0 ? (
                            user.orders.filter(o => o.status === 'Delivered' || o.status === 'Complete').map(o => (
                                <div key={o._id} onClick={() => navigate(`/orders/${o._id}`)} className='bg-white border border-gray-100 p-6 rounded-3xl hover:border-[#BC002D]/30 hover:shadow-md transition-all cursor-pointer flex items-center justify-between'>
                                    <div className='flex items-center gap-6'>
                                        <div className='text-center border-r border-gray-100 pr-6'>
                                            <p className='text-[14px] font-black text-black'>#{o.orderNo || o._id.slice(-6)}</p>
                                            <p className='text-[8px] font-bold text-gray-400 uppercase'>{new Date(o.date).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className='text-[10px] font-black uppercase mb-1'>{o.items.length} Specimens</p>
                                            <div className='flex gap-2'>
                                                <span className='text-[8px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full uppercase'>{o.status}</span>
                                                <span className='text-[8px] font-black px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full uppercase'>{o.paymentMethod}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-lg font-black tracking-tighter'>{o.currency} {o.amount}</p>
                                        <ChevronRight size={14} className='text-gray-300 ml-auto mt-1'/>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className='p-20 text-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-300 text-[10px] font-black uppercase'>No Acquisitions Found</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default UserDetail;