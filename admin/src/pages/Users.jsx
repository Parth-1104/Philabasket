import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    Search, ChevronRight, Loader2, ChevronLeft, ArrowUpDown, TrendingDown, TrendingUp ,RefreshCw,FileText
} from 'lucide-react';
import { backendUrl,frontendUrl } from '../App';

const Users = ({ token }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    
    // --- NEW SORT STATE ---
    // Options: 'desc' (Highest), 'asc' (Lowest), or null (Default/Date)
    const [coinSort, setCoinSort] = useState('desc'); 

    const exportCollectorCSV = async () => {
        toast.info("Preparing Registry Export...");
        try {
            // Fetch all users without pagination limits
            const res = await axios.get(
                `${backendUrl}/api/user/admin-list?limit=10000`, 
                { headers: { token } }
            );
    
            if (res.data.success) {
                const allUsers = res.data.users;
                
                // 1. Define CSV Headers
                const headers = ["Name", "Email", "Coins", "Referral Code"];
                
                // 2. Map data to rows
                const csvRows = allUsers.map(u => [
                    `"${u.name}"`, 
                    `"${u.email}"`, 
                    u.totalRewardPoints || 0, 
                    `"${u.referralCode || ''}"`
                ].join(","));
    
                // 3. Combine headers and rows
                const csvContent = [headers.join(","), ...csvRows].join("\n");
    
                // 4. Create Download Link
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `PhilaBasket_Registry_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                toast.success("Registry Exported Successfully");
            }
        } catch (error) {
            toast.error("Export Protocol Failed");
        }
    };
    

    const handleLoginAsUser = async (userId) => {
        if (!window.confirm("Protocol: Open a secure session in this collector's account?")) return;
    
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/impersonate`, 
                { userId }, 
                { headers: { token } } // Admin JWT
            );
    
            if (data.success) {
                // Opens the client storefront and triggers the auto-login useEffect
                const clientUrl = `${frontendUrl}/login?impersonate=${data.token}`;
                window.open(clientUrl, '_blank');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Registry Protocol failed");
        }
    };

    const navigate = useNavigate();

    // 1. Updated Fetch Logic with Sort Parameter
    const fetchUsers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            // Added sort parameter to the URL
            const res = await axios.get(
                `${backendUrl}/api/user/admin-list?page=${page}&limit=10&search=${searchTerm}&sortCoins=${coinSort}`, 
                { headers: { token } }
            );
            if (res.data.success) {
                setUsers(res.data.users);
                setTotalPages(res.data.totalPages);
                setCurrentPage(res.data.currentPage);
            }
        } catch (error) { 
            toast.error("Registry Sync Failed"); 
        } finally {
            setLoading(false);
        }
    }, [token, searchTerm, coinSort]);

    // 2. Debounce Effect (Handles Search & Sort changes)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers(1); 
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, coinSort, fetchUsers]);

    // Handle Sort Toggle
    const toggleCoinSort = () => {
        setCoinSort(prev => prev === 'desc' ? 'asc' : 'desc');
    };

    return (
        <div className='p-0 w-full font-serif'>
            {/* Header Section */}
            <div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4'>
                <div>
                    <h2 className='text-2xl font-black uppercase tracking-tighter'>
                        Collector <span className='text-[#BC002D]'>Registry</span>
                    </h2>
                    <p className='text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1'>Archive Master Ledger</p>
                </div>
                
                <div className='flex items-center gap-3 w-full md:w-auto'>
                    {/* Sort Toggle Mobile/Global */}
                    <button 
                        onClick={toggleCoinSort}
                        className='flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-sm bg-white text-[10px] font-black uppercase hover:border-[#BC002D] transition-all'
                    >
                        {coinSort === 'desc' ? <TrendingDown size={14}/> : <TrendingUp size={14}/>}
                        {coinSort === 'desc' ? "Most Coins" : "Least Coins"}
                    </button>


                    <button 
    onClick={exportCollectorCSV}
    className='flex items-center gap-2 px-4 py-2 border border-emerald-100 bg-emerald-50 text-emerald-700 rounded-sm text-[10px] font-black uppercase hover:bg-emerald-100 transition-all'
>
    <FileText size={14}/>
    Export CSV
</button>

                    <div className='relative flex-1 md:w-72'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={16} />
                        <input 
                            type="text" 
                            placeholder="Search Archive..." 
                            value={searchTerm} 
                            onChange={(e)=>setSearchTerm(e.target.value)} 
                            className='w-full pl-10 pr-4 py-2 border border-gray-100 rounded-sm text-xs outline-none focus:border-[#BC002D] bg-white transition-all' 
                        />
                    </div>
                </div>
            </div>

            {/* Registry Table */}
            <div className='bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden'>
                <table className='w-full text-left text-xs uppercase font-bold'>
                    <thead className='bg-gray-50 text-gray-400 border-b border-gray-100'>
                        <tr>
                            <th className='p-4'>Collector Identity</th>
                            <th className='p-4'>Registry Code</th>
                            {/* Clickable Header Sort */}
                            <th 
                                className='p-4 cursor-pointer hover:text-black transition-colors flex items-center gap-2'
                                onClick={toggleCoinSort}
                            >
                                Ledger Credits
                                <ArrowUpDown size={12} className={coinSort ? "text-[#BC002D]" : ""} />
                            </th>
                            <th className='p-4 text-right'>Access</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-50'>
                        {loading ? (
                            <tr>
                                <td colSpan="4" className='p-20 text-center'>
                                    <div className='flex flex-col items-center gap-4'>
                                        <Loader2 className='animate-spin text-[#BC002D]' size={32} />
                                        <p className='text-[10px] tracking-widest text-gray-400 animate-pulse'>Synchronizing Registry Ledger...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map(u => (
                                <tr key={u._id} className='hover:bg-gray-50/50 transition-colors group'>
                                    <td className='p-4'>
                                        <div className='flex flex-col'>
                                            <span className='text-black group-hover:text-[#BC002D] transition-colors'>{u.name}</span>
                                            <span className='text-[10px] text-gray-400 lowercase font-medium'>{u.email}</span>
                                        </div>
                                    </td>
                                    <td className='p-4 font-mono text-[#BC002D] tracking-tighter'>{u.referralCode || 'UNASSIGNED'}</td>
                                    <td className='p-4'>
                                        <span className={`px-2 py-1 rounded-sm ${u.totalRewardPoints > 1000 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                                            {u.totalRewardPoints || 0} Coins
                                        </span>
                                    </td>
                                    <td className='p-4 text-right'>
                                    <button 
            onClick={() => handleLoginAsUser(u._id)}
            className='flex items-center gap-2 px-3 py-1.5 bg-[#BC002D]/10 text-[#BC002D] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#BC002D] hover:text-white transition-all active:scale-95'
            title={`Login as ${u.name}`}
          >
            <RefreshCw size={12} className="animate-spin-slow" />
            Enter Account
          </button>

                                        <button 
                                            onClick={() => navigate(`/users/${u._id}`)} 
                                            className='p-2 hover:bg-[#BC002D] hover:text-white rounded-sm transition-all text-gray-300'
                                            title="View Detailed Profile"
                                        >
                                            <ChevronRight size={18}/>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className='p-20 text-center text-gray-400 italic tracking-widest uppercase text-[10px]'>
                                    No collector specimens found in archive.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination remains the same... */}
            {!loading && totalPages > 1 && (
                <div className='flex items-center justify-center gap-6 mt-10'>
                    <button disabled={currentPage === 1} onClick={() => fetchUsers(currentPage - 1)} className='p-2 border border-gray-100 rounded-sm disabled:opacity-20 hover:bg-white hover:shadow-md transition-all'><ChevronLeft size={16} /></button>
                    <div className='flex items-center gap-2'>
                        <span className='text-[10px] font-black uppercase tracking-widest text-gray-400'>Registry Page</span>
                        <span className='text-[12px] font-black text-[#BC002D]'>{currentPage}</span>
                        <span className='text-[10px] font-black uppercase tracking-widest text-gray-400'>of {totalPages}</span>
                    </div>
                    <button disabled={currentPage === totalPages} onClick={() => fetchUsers(currentPage + 1)} className='p-2 border border-gray-100 rounded-sm disabled:opacity-20 hover:bg-white hover:shadow-md transition-all'><ChevronRight size={16} /></button>
                </div>
            )}
        </div>
    );
};

export default Users;