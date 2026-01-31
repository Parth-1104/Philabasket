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
    const [loading, setLoading] = useState(true);
    const [selectedBuyer, setSelectedBuyer] = useState(null);

    const INR_SYMBOL = "₹";

    const formatINR = (val) => new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0
    }).format(val || 0);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const headers = { token };
            const [statsRes, analyticsRes] = await Promise.allSettled([
                axios.get(`${backendUrl}/api/order/admin-stats`, { headers }),
                axios.get(`${backendUrl}/api/order/detailed-analytics`, { headers })
            ]);

            if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
                setStats(statsRes.value.data.stats);
            }
            if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data.success) {
                setAnalytics(analyticsRes.value.data);
            }
        } catch (error) { 
            toast.error("Cloud synchronization failed"); 
        } finally { 
            setLoading(false); 
        }
    }, [token]);

    useEffect(() => { if (token) fetchData(); }, [token, fetchData]);

    // --- LOGIC FIX: Summing orders directly to avoid conversion errors ---
    const buyerOrders = useMemo(() => {
        if (!selectedBuyer || !analytics?.recentOrders) return [];
        return analytics.recentOrders.filter(order => order.userId === selectedBuyer._id);
    }, [selectedBuyer, analytics]);

    // Calculate the real sum from the raw ledger entries
    const buyerTotalReal = useMemo(() => {
        return buyerOrders.reduce((acc, order) => acc + (order.amount || 0), 0);
    }, [buyerOrders]);

    const calculatedKPIs = useMemo(() => {
        if (!analytics?.recentOrders) return { grossRevenue: 0, avgOrderValue: 0, orderCount: 0 };
        const deliveredOrders = analytics.recentOrders.filter(order => order.status === 'Delivered');
        const totalRevenue = deliveredOrders.reduce((acc, order) => acc + (order.amount || 0), 0);
        const count = deliveredOrders.length;

        return {
            grossRevenue: totalRevenue,
            avgOrderValue: count > 0 ? totalRevenue / count : 0,
            orderCount: count
        };
    }, [analytics]);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="flex flex-col gap-8 pb-20 max-w-7xl mx-auto px-4 sm:px-0">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Gross Revenue (INR)" value={`${INR_SYMBOL}${formatINR(calculatedKPIs.grossRevenue)}`} sub="Direct Ledger Sum" />
                <StatCard title="Avg Order (Delivered)" value={`${INR_SYMBOL}${formatINR(calculatedKPIs.avgOrderValue)}`} sub="No Conversion Applied" />
                <StatCard title="Total Success" value={calculatedKPIs.orderCount} sub="Fulfilled Transactions" />
                <StatCard title="Points System" value={`${(stats?.totalSystemPoints || 0).toLocaleString()} Pts`} sub="Customer Rewards" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 border rounded-xl shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-gray-400">Revenue Trend (₹)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.salesTrend || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f3f3" />
                                <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${formatINR(v)}`} />
                                <Tooltip content={<CustomTooltip currency={INR_SYMBOL} formatINR={formatINR} />} />
                                <Area type="monotone" dataKey="sales" stroke="#000" strokeWidth={2} fillOpacity={0.05} fill="#000" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 border rounded-xl shadow-sm overflow-hidden">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-gray-400">Top Philatelists</h3>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {analytics?.topBuyers?.map((buyer) => {
                            // Calculate each buyer's sum manually to ensure 100% accuracy vs Ledger
                            const realSum = analytics.recentOrders
                                .filter(o => o.userId === buyer._id)
                                .reduce((acc, o) => acc + (o.amount || 0), 0);

                            return (
                                <div 
                                    key={buyer._id} 
                                    onClick={() => setSelectedBuyer(buyer)} 
                                    className="flex justify-between items-center p-3 hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 rounded-lg transition-all"
                                >
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs font-bold text-gray-800">{buyer.name}</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex gap-0.5">
                                                {[...Array(3)].map((_, i) => (
                                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < (buyer.referralCount || 0) ? 'bg-[#BC002D]' : 'bg-gray-200'}`} />
                                                ))}
                                            </div>
                                            <span className={`text-[8px] font-black uppercase tracking-tighter ${buyer.referralCount >= 3 ? 'text-[#BC002D]' : 'text-gray-400'}`}>
                                                {buyer.referralCount >= 3 ? 'Cap Reached' : `${buyer.referralCount || 0}/3 Invites`}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Using calculated realSum instead of DB pre-aggregated value */}
                                    <p className="text-sm font-black text-gray-900">{INR_SYMBOL}{formatINR(realSum)}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-white">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Revenue Ledger</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-500 border-b">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Collector</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Currency Tag</th>
                                <th className="px-6 py-4 text-right">Revenue (Stored INR)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-xs">
                            {analytics?.recentOrders?.map((order) => (
                                <tr key={order._id?.$oid || order._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-blue-600 font-bold uppercase">#{ (order._id?.$oid || order._id || "").slice(-8) }</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{order.address?.firstName} {order.address?.lastName}</td>
                                    <td className="px-6 py-4 text-[9px] font-black uppercase">{order.status}</td>
                                    <td className="px-6 py-4 uppercase font-bold text-gray-500 text-[10px]">{order.currency || 'INR'}</td>
                                    <td className="px-6 py-4 text-right font-black text-gray-900">{INR_SYMBOL}{formatINR(order.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- AUDIT POPUP: Now using buyerTotalReal --- */}
            {selectedBuyer && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black tracking-tight">{selectedBuyer.name}</h2>
                                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">Audit Report</p>
                            </div>
                            <button onClick={() => setSelectedBuyer(null)} className="text-gray-400 hover:text-white text-3xl transition-colors">×</button>
                        </div>
                        
                        <div className="p-8 bg-gray-50/50 border-b flex justify-between items-center">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aggregate Value (INR Sum)</p>
                                <p className="text-3xl font-black text-gray-900">{INR_SYMBOL}{formatINR(buyerTotalReal)}</p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction Count</p>
                                <p className="text-xl font-black text-blue-600">{buyerOrders.length} Orders</p>
                            </div>
                        </div>

                        <div className="p-8 max-h-[400px] overflow-y-auto">
                            <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-[0.15em]">Direct Ledger Matches</h3>
                            <div className="space-y-3">
                                {buyerOrders.map(order => (
                                    <div key={order._id} className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-900 uppercase">Order #{ (order._id?.$oid || order._id || "").slice(-6).toUpperCase() }</p>
                                            <p className="text-[9px] text-gray-400 mt-1">{new Date(order.date).toLocaleDateString('en-IN')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-gray-900">{INR_SYMBOL}{formatINR(order.amount)}</p>
                                            <p className="text-[9px] font-bold uppercase text-gray-400">{order.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ... (StatCard, CustomTooltip, LoadingSpinner helpers remain the same)


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