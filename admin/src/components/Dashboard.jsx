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

    // Formats directly to Indian numbering system
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

    // KPI Calculation: Using raw 'amount' directly as it's already in INR
    const calculatedKPIs = useMemo(() => {
        if (!analytics?.recentOrders) return { grossRevenue: 0, avgOrderValue: 0, orderCount: 0 };
        
        const deliveredOrders = analytics.recentOrders.filter(order => order.status === 'Delivered');
        
        // No conversion applied: sum the raw integer stored in the DB
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
                <StatCard 
                    title="Gross Revenue (INR)" 
                    value={`${INR_SYMBOL}${formatINR(calculatedKPIs.grossRevenue)}`} 
                    sub="Delivered Orders Only" 
                />
                <StatCard 
                    title="Avg Order (Delivered)" 
                    value={`${INR_SYMBOL}${formatINR(calculatedKPIs.avgOrderValue)}`} 
                    sub="Direct Stored Value" 
                />
                <StatCard 
                    title="Total Success" 
                    value={calculatedKPIs.orderCount} 
                    sub="Fulfilled Transactions" 
                />
                <StatCard 
                    title="Points System" 
                    value={`${(stats?.totalSystemPoints || 0).toLocaleString()} Pts`} 
                    sub="Customer Rewards" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- REVENUE TREND --- */}
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

                {/* --- TOP PHILATELISTS (Referral Tracking + Direct INR Amount) --- */}
                <div className="bg-white p-6 border rounded-xl shadow-sm overflow-hidden">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-gray-400">Top Philatelists</h3>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {analytics?.topBuyers?.map((buyer) => (
                            <div 
                                key={buyer._id} 
                                onClick={() => setSelectedBuyer(buyer)} 
                                className="flex justify-between items-center p-3 hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 rounded-lg transition-all"
                            >
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs font-bold text-gray-800">{buyer.name}</p>
                                    {/* Cap Indicator: 3 successful referrals per collector */}
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex gap-0.5">
                                            {[...Array(3)].map((_, i) => (
                                                <div 
                                                    key={i} 
                                                    className={`w-1.5 h-1.5 rounded-full ${i < (buyer.referralCount || 0) ? 'bg-[#BC002D]' : 'bg-gray-200'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className={`text-[8px] font-black uppercase tracking-tighter ${buyer.referralCount >= 3 ? 'text-[#BC002D]' : 'text-gray-400'}`}>
                                            {buyer.referralCount >= 3 ? 'Cap Reached' : `${buyer.referralCount || 0}/3 Invites`}
                                        </span>
                                    </div>
                                </div>
                                {/* Directly using buyer.totalSpent from the database pre-aggregation */}
                                <p className="text-sm font-black text-gray-900">{INR_SYMBOL}{formatINR(buyer.totalSpent)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- REVENUE LEDGER --- */}
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
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] px-2 py-1 rounded-md font-black uppercase tracking-tighter ${order.status === 'Delivered' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 uppercase font-bold text-gray-500 text-[10px]">{order.currency || 'INR'}</td>
                                    <td className="px-6 py-4 text-right font-black text-gray-900">{INR_SYMBOL}{formatINR(order.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ... (StatCard, CustomTooltip, LoadingSpinner helpers remain the same)



// --- HELPERS ---
const DetailItem = ({ label, value }) => (
    <div>
        <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1.5">{label}</p>
        <p className="text-xs font-bold text-gray-800 leading-tight border-l-2 border-gray-200 pl-3">{value}</p>
    </div>
);

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