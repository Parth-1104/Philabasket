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

    // --- HELPER: Strict ID Resolver ---
    // Extract string ID from string, $oid object, or nested _id.$oid
    const resolveId = (obj) => {
        if (!obj) return "";
        if (typeof obj === 'string') return obj;
        if (obj.$oid) return obj.$oid;
        if (obj._id && obj._id.$oid) return obj._id.$oid;
        if (obj._id) return obj._id.toString();
        return "";
    };

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
            toast.error("Registry Sync Failed"); 
        } finally { 
            setLoading(false); 
        }
    }, [token]);

    useEffect(() => { if (token) fetchData(); }, [token, fetchData]);

    // --- LOGIC: Hybrid Top Philatelists Sync ---
    const topPhilatelistsVerified = useMemo(() => {
        if (!analytics?.topBuyers || !analytics?.recentOrders) return [];
        
        // Include 'wc-completed' for migrated WordPress data
        const successStatuses = ['Delivered', 'Shipped', 'wc-completed', 'completed', 'Order Placed'];

        return analytics.topBuyers.map(buyer => {
            const buyerId = resolveId(buyer);
            
            const sum = analytics.recentOrders
                .filter(order => {
                    const orderUserId = resolveId(order.userId);
                    // Match clean string to clean string
                    return orderUserId === buyerId && successStatuses.includes(order.status);
                })
                .reduce((acc, order) => acc + (Number(order.amount) || 0), 0);

            return { 
                ...buyer, 
                verifiedSpent: sum, 
                normalizedId: buyerId 
            };
        }).sort((a, b) => b.verifiedSpent - a.verifiedSpent);
    }, [analytics]);

    const buyerOrders = useMemo(() => {
        if (!selectedBuyer || !analytics?.recentOrders) return [];
        const buyerId = resolveId(selectedBuyer);
        return analytics.recentOrders.filter(order => resolveId(order.userId) === buyerId);
    }, [selectedBuyer, analytics]);

    const buyerTotalReal = useMemo(() => {
        return buyerOrders.reduce((acc, order) => acc + (Number(order.amount) || 0), 0);
    }, [buyerOrders]);

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

                {/* TOP PHILATELISTS */}
                <div className="bg-white p-6 border rounded-xl shadow-sm overflow-hidden">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-gray-800">Top Philatelists</h3>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {topPhilatelistsVerified.map((buyer) => (
                            <div 
                                key={resolveId(buyer)} 
                                onClick={() => setSelectedBuyer(buyer)} 
                                className="flex justify-between items-center p-3 hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 rounded-lg transition-all"
                            >
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs font-bold text-gray-800">{buyer.name || buyer.address?.firstName || "Legacy Collector"}</p>
                                    <span className="text-[8px] font-black uppercase text-gray-400">{buyer.referralCount || 0}/3 Invites Used</span>
                                </div>
                                <p className="text-sm font-black text-gray-900">{INR_SYMBOL}{formatINR(buyer.verifiedSpent)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* HYBRID REVENUE LEDGER */}
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
            {selectedBuyer && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
                            <h2 className="text-xl font-black uppercase tracking-tight">{selectedBuyer.name || "Collector Audit"}</h2>
                            <button onClick={() => setSelectedBuyer(null)} className="text-gray-400 hover:text-white text-3xl">×</button>
                        </div>
                        <div className="p-8 bg-gray-50 border-b flex justify-between">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Audited Value</p>
                            <p className="text-xl font-black text-gray-900">{INR_SYMBOL}{formatINR(buyerTotalReal)}</p>
                        </div>
                        <div className="p-8 max-h-[400px] overflow-y-auto space-y-3">
                            {buyerOrders.map(order => (
                                <div key={resolveId(order)} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-900 uppercase">#{ resolveId(order).slice(-6).toUpperCase() }</p>
                                        <p className="text-[9px] text-gray-400 mt-1">{new Date(order.date).toDateString()}</p>
                                    </div>
                                    <p className="text-sm font-black text-gray-900">{INR_SYMBOL}{formatINR(order.amount)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

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