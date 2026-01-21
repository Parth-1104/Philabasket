import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend, BarChart, Bar 
} from 'recharts';

const Dashboard = ({ token }) => {
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('revenue');
    const [selectedBuyer, setSelectedBuyer] = useState(null);

    const COLORS = ['#E63946', '#219EBC', '#FFB703', '#8ECAE6', '#023047'];

    // Memoized fetch function to prevent unnecessary re-renders
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const headers = { token };
            
            // Execute both requests in parallel for better performance
            const [statsRes, analyticsRes] = await Promise.allSettled([
                axios.get(`${backendUrl}/api/order/admin-stats`, { headers }),
                axios.get(`${backendUrl}/api/order/detailed-analytics`, { headers })
            ]);

            // Safe data assignment
            if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
                setStats(statsRes.value.data.stats);
            } else if (statsRes.status === 'rejected' || !statsRes.value.data.success) {
                toast.error("Failed to load KPI stats");
            }

            if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data.success) {
                setAnalytics(analyticsRes.value.data);
            } else if (analyticsRes.status === 'rejected' || !analyticsRes.value.data.success) {
                toast.error("Failed to load market analytics");
            }

        } catch (error) { 
            toast.error("Server connection error"); 
        } finally { 
            setLoading(false); 
        }
    }, [token]);

    useEffect(() => { 
        if (token) fetchData(); 
    }, [token, fetchData]);

    // Enhanced Loading State
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                    Synchronizing Philatelic Records...
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-10 max-w-7xl mx-auto px-4 sm:px-0 animate-in fade-in duration-500">
            
            {/* --- TOP KPI GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Gross Revenue" 
                    value={`${currency}${stats?.totalRevenue?.toLocaleString() || 0}`} 
                    sub={`${stats?.orderCount || 0} Total Orders`}
                    isActive={activeTab === 'revenue'}
                    onClick={() => setActiveTab('revenue')}
                />
                <StatCard 
                    title="Avg Order Value" 
                    value={`${currency}${stats?.avgOrderValue || 0}`} 
                    sub="Spending Per Collector"
                    isActive={activeTab === 'aov'}
                    onClick={() => setActiveTab('aov')}
                />
                <StatCard 
                    title="Collectors" 
                    value={stats?.totalUsers || 0} 
                    sub={`${stats?.repeatCustomerRate || 0}% Retention`}
                    isActive={activeTab === 'users'}
                    onClick={() => setActiveTab('users')}
                />
                <StatCard 
                    title="Reward Liability" 
                    value={`${((stats?.totalUsers || 0) * 12).toLocaleString()} Pts`} 
                    sub="System Reward Value"
                    isActive={activeTab === 'rewards'}
                    onClick={() => setActiveTab('rewards')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- MAIN SALES CHART --- */}
                <div className="lg:col-span-2 bg-white p-6 border shadow-sm rounded-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-8 flex justify-between">
                        Sales Momentum
                        <span className="text-[10px] text-gray-400 font-medium">Last 6 Months</span>
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.salesTrend || []}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#E63946" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#E63946" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={10} tickMargin={10} />
                                <YAxis axisLine={false} tickLine={false} fontSize={10} />
                                <Tooltip content={<CustomTooltip currency={currency} />} />
                                <Area type="monotone" dataKey="sales" stroke="#E63946" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                <Area type="monotone" dataKey="orders" stroke="#ccc" strokeWidth={2} fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- TOP COLLECTORS --- */}
                <div className="bg-white p-6 border shadow-sm rounded-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Top Philatelists</h3>
                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[320px] pr-1 custom-scrollbar">
                        {analytics?.topBuyers?.length > 0 ? analytics.topBuyers.map((buyer) => (
                            <div 
                                key={buyer._id} 
                                onClick={() => setSelectedBuyer(buyer)}
                                className="flex justify-between items-center p-3 hover:bg-red-50 cursor-pointer border-l-2 border-transparent hover:border-red-600 transition-all rounded group"
                            >
                                <div className="truncate pr-2">
                                    <p className="text-sm font-bold text-gray-800 truncate">{buyer.name}</p>
                                    <p className="text-[10px] text-gray-500 italic font-medium">{buyer.orderCount} Orders</p>
                                </div>
                                <p className="font-black text-red-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                                    {currency}{buyer.totalSpent.toLocaleString()}
                                </p>
                            </div>
                        )) : (
                            <div className="py-20 text-center text-xs text-gray-400 italic">No buyer data synced yet.</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* --- TOP PRODUCTS TABLE --- */}
                <div className="bg-white p-6 border shadow-sm rounded-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-6 border-b pb-2">Top Moving Items</h3>
                    {analytics?.mostSoldProducts?.map((prod, i) => (
    <div key={i} className="flex justify-between items-center py-2">
        <div className="flex items-center gap-3">
            <img src={prod.image?.[0]} className="w-8" alt="" />
            {/* Display the distinct name */}
            <p className="text-sm font-bold">{prod.name}</p> 
        </div>
        <p className="font-black text-red-600">{prod.totalSold} Units</p>
    </div>
))}
                </div>

                {/* --- CART DEMAND CHART --- */}
                <div className="bg-white p-6 border shadow-sm rounded-sm">
    <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-800">
        Wishlist Demand (In Carts)
    </h3>
    <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.inCartStats || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                {/* Changed dataKey to "name" to show the stamp name on hover */}
                <XAxis dataKey="name" hide /> 
                <Tooltip 
                    cursor={{fill: '#fcfcfc'}} 
                    labelClassName="font-bold text-red-600"
                    // Ensures the name shows up in the tooltip
                    labelKey="name" 
                />
                <Bar dataKey="totalInCarts" fill="#E63946" radius={[2, 2, 0, 0]} barSize={40} />
            </BarChart>
        </ResponsiveContainer>
    </div>
    <p className="text-[9px] text-gray-400 mt-4 text-center italic uppercase">
        Real-time demand for specific philatelic items
    </p>
</div>
            </div>

            {/* --- CUSTOMER MODAL --- */}
            {selectedBuyer && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md p-8 rounded-sm shadow-2xl relative animate-in zoom-in duration-300">
                        <button 
                            onClick={() => setSelectedBuyer(null)} 
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <p className="text-[10px] font-black text-red-600 uppercase mb-2 tracking-[0.2em]">Collector Intelligence</p>
                        <h2 className="text-2xl font-black mb-1 text-gray-900 tracking-tight">{selectedBuyer.name}</h2>
                        <p className="text-sm text-gray-500 mb-8 border-b pb-4">{selectedBuyer.email}</p>
                        
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Lifetime Value</p>
                                <p className="text-2xl font-black text-gray-900 leading-none">
                                    {currency}{selectedBuyer.totalSpent?.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
                                <p className="text-2xl font-black text-gray-900 leading-none">{selectedBuyer.orderCount}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- HELPER COMPONENTS ---

const StatCard = ({ title, value, sub, isActive, onClick }) => (
    <div 
        onClick={onClick}
        className={`p-6 border cursor-pointer transition-all duration-300 rounded-sm relative overflow-hidden group ${
            isActive ? 'bg-black text-white border-black shadow-xl' : 'bg-white hover:border-red-200'
        }`}
    >
        {isActive && <div className="absolute top-0 right-0 w-16 h-16 bg-red-600 rotate-45 translate-x-8 -translate-y-8"></div>}
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
        <p className="text-3xl font-black mt-2 leading-none tracking-tighter">{value}</p>
        <p className={`text-[10px] mt-3 font-medium flex items-center gap-1 ${isActive ? 'text-red-500' : 'text-gray-400'}`}>
            <span className={isActive ? 'animate-pulse' : ''}>●</span> {sub}
        </p>
    </div>
);

const IntelBar = ({ label, value, color }) => (
    <div className="w-full">
        <div className="flex justify-between mb-2">
            <span className="text-[10px] font-black uppercase text-gray-600 tracking-tighter">{label}</span>
            <span className="text-[10px] font-black" style={{color}}>{value}%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${value}%`, backgroundColor: color }}></div>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label, currency }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black text-white p-4 shadow-2xl border-l-4 border-red-600 pointer-events-none">
                <p className="text-[10px] font-bold mb-2 opacity-60 uppercase tracking-widest">{label}</p>
                <div className="space-y-1">
                    <p className="text-sm font-black text-red-500">
                        REVENUE: {currency}{payload[0].value?.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold uppercase opacity-80">
                        ORDERS: {payload[1].value}
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export default Dashboard;