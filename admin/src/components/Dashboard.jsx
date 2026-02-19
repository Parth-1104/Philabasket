import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const Dashboard = ({ token }) => {
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [topPhilatelists, setTopPhilatelists] = useState([]); // State for new aggregation
    const [loading, setLoading] = useState(true);
    const [selectedBuyer, setSelectedBuyer] = useState(null);

    const INR_SYMBOL = "₹";

    const resolveId = (obj) => {
        if (!obj) return "";
        if (typeof obj === 'string') return obj;
        if (obj.$oid) return obj.$oid;
        return obj._id || obj.id || "";
    };

    const formatINR = (val) => new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0
    }).format(val || 0);

    const handleBuyerClick = async (buyer) => {
        try {
            // Use the ID from the aggregation result (userDetails._id)
            const userId = buyer.userDetails?._id || buyer._id;
            const response = await axios.get(`${backendUrl}/api/user/detail/${userId}`, { 
                headers: { token } 
            });
            
            if (response.data.success) {
                setSelectedBuyer(response.data.user); // This now has totalSpent and totalRewardPoints
            }
        } catch (error) {
            toast.error("Audit Sync Failed");
        }
    };


    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const headers = { token };
            
            // Added the new top-philatelists endpoint to the parallel fetch
            const [statsRes, analyticsRes, topRes] = await Promise.allSettled([
                axios.get(`${backendUrl}/api/order/admin-stats`, { headers }),
                axios.get(`${backendUrl}/api/order/detailed-analytics`, { headers }),
                axios.get(`${backendUrl}/api/user/top-philatelists`, { headers })
            ]);

            if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
                setStats(statsRes.value.data.stats);
            }
            if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data.success) {
                setAnalytics(analyticsRes.value.data);
            }
            if (topRes.status === 'fulfilled' && topRes.value.data.success) {
                setTopPhilatelists(topRes.value.data.topUsers);
            }
        } catch (error) { 
            toast.error("Registry Sync Failed"); 
        } finally { 
            setLoading(false); 
        }
    }, [token]);

    useEffect(() => { if (token) fetchData(); }, [token, fetchData]);

    // This is now purely for the audit modal
    const buyerOrders = useMemo(() => {
    // If the selectedBuyer already has an orders array from the API, use it
    if (selectedBuyer && selectedBuyer.orders) {
        return selectedBuyer.orders;
    }
    return [];
}, [selectedBuyer]);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="flex flex-col gap-8 pb-20 max-w-7xl mx-auto px-4 sm:px-0">
            
            {/* KPI ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Gross Revenue" value={`${INR_SYMBOL}${formatINR(stats?.totalRevenue || 0)}`} sub="Total Stored Value" />
                <StatCard title="Top Specimen" value={stats?.topProduct?.name || "N/A"} sub="Volume Leader" />
                <StatCard title="Order Count" value={analytics?.recentOrders?.length || 0} sub="Registry Entries" />
                <StatCard title="System Rewards" value={`${(stats?.totalSystemPoints || 0).toLocaleString()} Pts`} sub="Philatelist Credits" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 border rounded-xl shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-gray-800">Acquisition Trends</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.salesTrend || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f3f3" />
                                <XAxis dataKey="date" fontSize={10} tickFormatter={(str) => new Date(str).toLocaleDateString('en-IN', {day:'numeric', month:'short'})} />
                                <YAxis fontSize={10} tickFormatter={(v) => `${INR_SYMBOL}${formatINR(v)}`} />
                                <Tooltip content={<CustomTooltip currency={INR_SYMBOL} formatINR={formatINR} />} />
                                <Area type="monotone" dataKey="sales" stroke="#BC002D" fill="#BC002D" fillOpacity={0.05} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* TOP PHILATELISTS - Now using Backend Aggregation */}
                <div className="bg-white p-6 border rounded-xl shadow-sm overflow-hidden">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-gray-800">Top Philatelists</h3>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {topPhilatelists.map((buyer, index) => (
    <div 
        key={buyer._id} 
        onClick={() => handleBuyerClick(buyer)} // Updated from setSelectedBuyer(buyer)
        className="flex justify-between items-center p-3 hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 rounded-lg transition-all group"
    >
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-gray-300 group-hover:text-[#BC002D]">#{index + 1}</span>
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-xs font-bold text-gray-800">{buyer.userDetails?.name || "Anonymous Collector"}</p>
                                        <span className="text-[8px] font-black uppercase text-gray-400">{buyer.orderCount} Orders Verified</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-gray-900">{INR_SYMBOL}{formatINR(buyer.totalSpent)}</p>
                                    <p className="text-[7px] font-black text-[#BC002D] uppercase opacity-0 group-hover:opacity-100 transition-opacity">View Details</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* LEDGER TABLE */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-white">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Sovereign Ledger</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-500 border-b">
                            <tr>
                                <th className="px-6 py-4">Registry ID</th>
                                <th className="px-6 py-4">Collector</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-xs">
                            {analytics?.recentOrders?.map((order) => (
                                <tr key={resolveId(order)} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-mono text-blue-600 font-bold uppercase">#{ resolveId(order).slice(-8) }</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        {order.address?.firstName ? `${order.address.firstName} ${order.address.lastName}` : "Legacy Entry"}
                                    </td>
                                    <td className="px-6 py-4 text-[9px] font-black uppercase">
                                        <span className={order.status === 'Delivered' ? 'text-green-600' : 'text-blue-600'}>{order.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-gray-900">{INR_SYMBOL}{formatINR(order.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* AUDIT MODAL */}
           {/* AUDIT MODAL */}
{selectedBuyer && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
        <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            
            {/* Header: Identity & Contact */}
            <div className="p-8 bg-gray-900 text-white flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight leading-none">
                        {selectedBuyer.userDetails?.name || "Collector Audit"}
                    </h2>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-2">
                        {selectedBuyer.userDetails?.email}
                    </p>
                </div>
                <button onClick={() => setSelectedBuyer(null)} className="text-gray-400 hover:text-white text-3xl leading-none">×</button>
            </div>

            {/* UPGRADED STATS BAR: Total Spent & Total Reward Points */}
            <div className="grid grid-cols-2 bg-gray-50 border-b divide-x divide-gray-200">
                <div className="p-8">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Lifetime Acquisition Value</p>
                    <p className="text-2xl font-black text-gray-900">
                        {INR_SYMBOL}{formatINR(selectedBuyer.totalSpent)}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-[8px] font-black text-blue-600 uppercase">Verified Ledger</span>
                    </div>
                </div>
                <div className="p-8">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Reward Points</p>
                    <p className="text-2xl font-black text-[#BC002D]">
                        {(selectedBuyer.totalRewardPoints || 0).toLocaleString()} <span className="text-xs">PTS</span>
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-[8px] font-black text-emerald-600 uppercase">Philatelist Credits</span>
                    </div>
                </div>
            </div>

            {/* Registry History Section */}
            <div className="p-8 max-h-[45vh] overflow-y-auto space-y-4 custom-scrollbar">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex justify-between">
                    <span>Linked Order Registry</span>
                    <span>{selectedBuyer.orderCount} Entries</span>
                </h4>
                
                {buyerOrders.length > 0 ? buyerOrders.map(order => (
                    <div key={resolveId(order)} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-gray-200 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-[11px] font-black text-gray-900 uppercase">#{resolveId(order).slice(-8).toUpperCase()}</p>
                                <p className="text-[9px] text-gray-400 font-bold">{new Date(order.date).toDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-gray-900">{INR_SYMBOL}{formatINR(order.amount)}</p>
                                <p className="text-[8px] font-black text-blue-500 uppercase">{order.status}</p>
                            </div>
                        </div>

                        {/* Display item list for full visibility */}
                        <div className="space-y-1.5 pt-3 border-t border-gray-50">
                            {order.items?.map((item, i) => (
                                <p key={i} className="text-[10px] text-gray-600 font-medium leading-tight">
                                    <span className="font-black text-gray-400 mr-2">{item.quantity}x</span> {item.name}
                                </p>
                            ))}
                        </div>
                    </div>
                )) : (
                    <div className="py-12 text-center">
                        <p className="text-xs text-gray-300 font-black uppercase italic">No Detailed Order Logs Available</p>
                    </div>
                )}
            </div>
        </div>
    </div>
)}
        </div>
    );
};

// ... Helpers remain same ...
// --- HELPERS ---
const StatCard = ({ title, value, sub }) => (
    <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
        <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3">{title}</p>
        <p className="text-2xl font-black text-gray-900 tracking-tighter">{value}</p>
        <p className="text-[9px] mt-4 font-bold text-gray-400 uppercase">{sub}</p>
    </div>
);

const CustomTooltip = ({ active, payload, label, currency, formatINR }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-black text-white p-4 shadow-2xl border-t-2 border-white rounded-lg">
                <p className="text-[9px] font-bold mb-2 opacity-50 uppercase tracking-widest">{label}</p>
                <p className="text-sm font-black">{currency}{formatINR(payload[0].value)}</p>
            </div>
        );
    }
    return null;
};

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Syncing Philatelic Ledger</p>
    </div>
);

export default Dashboard;