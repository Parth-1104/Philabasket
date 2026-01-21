import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend, BarChart, Bar 
} from 'recharts';

const Dashboard = ({ token }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('revenue'); // Interactive Tab State

    const COLORS = ['#E63946', '#219EBC', '#FFB703', '#8ECAE6', '#023047'];

    const fetchData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/order/admin-stats`, { headers: { token } });
            if (data.success) setStats(data.stats);
        } catch (error) { toast.error("Sync Error"); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (token) fetchData(); }, [token]);

    if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 uppercase tracking-widest">Synchronizing Philatelic Records...</div>;

    return (
        <div className="flex flex-col gap-8 pb-10 max-w-7xl mx-auto">
            {/* <header className="flex justify-between items-end border-b pb-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter italic">PhilaBasket ADMIN <span className="text-red-600">.</span></h1>
                    <p className="text-xs text-gray-500 font-medium">REAL-TIME GLOBAL STAMP SALES ANALYTICS</p>
                </div>
                <button onClick={fetchData} className="text-[10px] border px-4 py-2 hover:bg-black hover:text-white transition-all font-bold">REFRESH DATA</button>
            </header> */}

            {/* --- TOP INTERACTIVE KPI GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Gross Revenue" 
                    value={`${currency}${stats?.totalRevenue?.toLocaleString()}`} 
                    sub={`${stats?.orderCount} Total Orders`}
                    isActive={activeTab === 'revenue'}
                    onClick={() => setActiveTab('revenue')}
                />
                <StatCard 
                    title="Avg Order Value" 
                    value={`${currency}${stats?.avgOrderValue}`} 
                    sub="Customer Spending Power"
                    isActive={activeTab === 'aov'}
                    onClick={() => setActiveTab('aov')}
                />
                <StatCard 
                    title="Collectors" 
                    value={stats?.totalUsers} 
                    sub={`${stats?.repeatCustomerRate}% Retention Rate`}
                    isActive={activeTab === 'users'}
                    onClick={() => setActiveTab('users')}
                />
                <StatCard 
                    title="Reward Liability" 
                    value={`${(stats?.totalUsers * 12).toLocaleString()} Pts`} 
                    sub="Pending Redemption Value"
                    isActive={activeTab === 'rewards'}
                    onClick={() => setActiveTab('rewards')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- MAIN INTERACTIVE AREA CHART --- */}
                <div className="lg:col-span-2 bg-white p-6 border shadow-sm rounded-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xs font-bold uppercase tracking-widest">Sales & Volume Momentum</h3>
                        <div className="flex gap-2 text-[10px] font-bold">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-600"></div> REVENUE</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-300"></div> ORDERS</span>
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.salesTrend}>
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

                {/* --- CATEGORY BREAKDOWN --- */}
                <div className="bg-white p-6 border shadow-sm rounded-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-8">Category Mix</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={stats?.categoryDistribution} 
                                    innerRadius={70} 
                                    outerRadius={90} 
                                    paddingAngle={8} 
                                    dataKey="value"
                                >
                                    {stats?.categoryDistribution?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- LOWER INTEL GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 border shadow-sm rounded-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Historical Significance (Customer Segments)</h3>
                    <div className="space-y-6">
                        <IntelBar label="Loyal Philatelists" value={stats?.repeatCustomerRate} color="#219EBC" />
                        <IntelBar label="Global Reach" value={stats?.internationalRate || 45} color="#FFB703" />
                        <IntelBar label="Reward Adoption" value={stats?.rewardUsageRate || 30} color="#E63946" />
                    </div>
                </div>

                <div className="bg-white p-6 border shadow-sm rounded-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-red-600 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-600 animate-ping"></div> High Scarcity Risk
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        {stats?.lowStockItems?.map((item, i) => (
                            <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-sm">
                                <span className="text-[11px] font-bold text-gray-700">{item.name}</span>
                                <span className="text-[10px] font-black bg-red-600 text-white px-2 py-1">ONLY {item.stock} LEFT</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- HELPER COMPONENTS ---

const StatCard = ({ title, value, sub, isActive, onClick }) => (
    <div 
        onClick={onClick}
        className={`p-6 border cursor-pointer transition-all duration-300 rounded-sm ${isActive ? 'bg-black text-white border-black scale-105 shadow-xl' : 'bg-white hover:border-gray-400'}`}
    >
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
        <p className="text-3xl font-black mt-2 leading-none">{value}</p>
        <p className={`text-[10px] mt-3 font-medium ${isActive ? 'text-red-500' : 'text-gray-400'}`}>{sub}</p>
    </div>
);

const IntelBar = ({ label, value, color }) => (
    <div className="w-full">
        <div className="flex justify-between mb-2">
            <span className="text-[10px] font-black uppercase text-gray-600">{label}</span>
            <span className="text-[10px] font-black" style={{color}}>{value}%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full transition-all duration-1000" style={{ width: `${value}%`, backgroundColor: color }}></div>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label, currency }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black text-white p-4 shadow-2xl border-l-4 border-red-600">
                <p className="text-[10px] font-bold mb-2 opacity-60 uppercase">{label}</p>
                <p className="text-sm font-black text-red-500">REVENUE: {currency}{payload[0].value.toLocaleString()}</p>
                <p className="text-[10px] font-bold">TOTAL ORDERS: {payload[1].value}</p>
            </div>
        );
    }
    return null;
};

export default Dashboard;