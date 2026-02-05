import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { AlertCircle, TrendingDown, Search, ChevronDown, Trash2, Edit3, Check, X } from 'lucide-react';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Selection & Edit States
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const formatINR = (price) => new Intl.NumberFormat('en-IN').format(price);
  
  // Computed Low Stock (from currently loaded list)
  const lowStockItems = list.filter(item => item.stock > 0 && item.stock <= 5);

  const fetchList = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const targetPage = reset ? 1 : page;
      
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        params: {
          page: targetPage,
          limit: 30,
          search: searchTerm
        }
      });

      if (response.data.success) {
        const newProducts = response.data.products;
        // If searching or page 1, replace list. If loading more, append.
        setList(prev => reset ? newProducts : [...prev, ...newProducts]);
        setTotalCount(response.data.total);
        setHasMore(newProducts.length === 30);
      }
    } catch (error) {
      toast.error("Registry connection failed");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchList(true);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    if (page > 1) fetchList();
  }, [page]);

  // --- ACTIONS ---
  const startEdit = (item) => {
    setEditingId(item._id);
    setEditFormData({ ...item });
  };

  const saveEdit = async (id) => {
    try {
      const res = await axios.post(`${backendUrl}/api/product/update`, { ...editFormData, id }, { headers: { token } });
      if (res.data.success) {
        toast.success("Entry Synchronized");
        setEditingId(null);
        // Update local state without full refresh to keep scroll position
        setList(prev => prev.map(item => item._id === id ? { ...item, ...editFormData } : item));
      }
    } catch (error) { toast.error("Update failed"); }
  };

  const removeProduct = async (id) => {
    if (!window.confirm("Delete this specimen?")) return;
    try {
      const res = await axios.post(`${backendUrl}/api/product/remove`, { id }, { headers: { token } });
      if (res.data.success) {
        setList(prev => prev.filter(item => item._id !== id));
        setTotalCount(prev => prev - 1);
        toast.success("Specimen Purged");
      }
    } catch (error) { toast.error("Removal failed"); }
  };

  return (
    <div className='max-w-7xl mx-auto p-4 lg:p-6 bg-gray-50 min-h-screen font-sans select-none'>
      
      {/* HEADER & SEARCH */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6'>
        <div>
          <h2 className='text-3xl font-black text-gray-900 uppercase tracking-tighter'>Inventory Console</h2>
          <div className='flex items-center gap-3 mt-1'>
             <div className='bg-black text-white px-2 py-0.5 rounded-xs text-[8px] font-black uppercase tracking-[0.2em]'>
               Total: {totalCount}
             </div>
             <p className='text-[10px] text-[#BC002D] font-bold uppercase tracking-widest'>Registry Sync Active</p>
          </div>
        </div>

        <div className='relative w-full md:w-96 group'>
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#BC002D] transition-colors' size={16} />
          <input 
            type="text" 
            placeholder="Filter by name, country, or category..."
            className='w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-[#BC002D]/5 focus:border-[#BC002D] transition-all outline-none shadow-sm'
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LOW STOCK ALERTS */}
      {lowStockItems.length > 0 && !searchTerm && (
        <div className='mb-12 animate-fade-in'>
            <div className='flex items-center gap-2 mb-6'>
                <AlertCircle size={16} className='text-[#BC002D] animate-pulse' />
                <h3 className='text-[10px] font-black uppercase tracking-[0.3em] text-[#BC002D]'>Urgent Valuation Required (Low Stock)</h3>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                {lowStockItems.map((item) => (
                    <div key={item._id} onClick={() => startEdit(item)} className='bg-white border-l-4 border-l-[#BC002D] p-4 rounded-xl flex items-center gap-4 hover:shadow-lg cursor-pointer transition-all border border-gray-100'>
                        <img src={item.image[0]} className='w-10 h-12 object-contain bg-gray-50 p-1 rounded' alt="" />
                        <div>
                            <p className='text-[10px] font-black uppercase text-gray-900 truncate w-32'>{item.name}</p>
                            <div className='flex items-center gap-1 mt-1 text-[#BC002D]'>
                                <TrendingDown size={10} />
                                <span className='text-[9px] font-black'>{item.stock} UNITS</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* INVENTORY TABLE */}
      <div className='grid grid-cols-1 gap-4'>
        <div className='hidden md:grid grid-cols-[80px_1fr_180px_120px_140px_160px] items-center px-8 py-5 bg-black text-white rounded-2xl mb-2'>
          <span className='text-[8px] font-black uppercase tracking-widest'>Specimen</span>
          <span className='text-[8px] font-black uppercase tracking-widest'>Archive Identity</span>
          <span className='text-[8px] font-black uppercase tracking-widest'>Categories</span>
          <span className='text-[8px] font-black uppercase tracking-widest text-center'>Volume</span>
          <span className='text-[8px] font-black uppercase tracking-widest'>Valuation (₹)</span>
          <span className='text-[8px] font-black uppercase tracking-widest text-center'>Management</span>
        </div>

        {list.map((item) => (
          <div key={item._id} className={`group grid grid-cols-1 md:grid-cols-[80px_1fr_180px_120px_140px_160px] items-center gap-6 p-6 bg-white rounded-2xl border border-gray-100 hover:border-[#BC002D]/20 transition-all hover:shadow-xl relative overflow-hidden`}>
            
            {/* Image */}
            <div className='flex justify-center md:justify-start'>
               <div className={`w-14 h-18 bg-gray-50 rounded-lg p-1 border border-gray-100 overflow-hidden ${item.stock <= 0 ? 'grayscale opacity-30' : ''}`}>
                  <img src={item.image[0]} className='w-full h-full object-contain' alt="" />
               </div>
            </div>

            {/* Identity */}
            {editingId === item._id ? (
              <div className='space-y-2'>
                <input className='w-full text-[10px] p-2 bg-gray-50 border rounded-lg font-bold outline-none' value={editFormData.name} onChange={(e)=>setEditFormData({...editFormData, name: e.target.value})} />
                <input className='w-full text-[9px] p-2 bg-gray-50 border rounded-lg' value={editFormData.country} onChange={(e)=>setEditFormData({...editFormData, country: e.target.value})} />
              </div>
            ) : (
              <div>
                <h4 className={`text-xs font-black uppercase tracking-tight ${item.stock <= 0 ? 'text-gray-400' : 'text-gray-900'}`}>{item.name}</h4>
                <p className='text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5'>{item.country || 'International'}</p>
              </div>
            )}

            {/* Categories */}
            <div className='flex flex-wrap gap-1'>
              {item.category.map((cat, i) => (
                <span key={i} className='px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100 text-[7px] font-black text-gray-400 uppercase'>{cat}</span>
              ))}
            </div>

            {/* Stock */}
            <div className='text-center'>
              {editingId === item._id ? (
                <input type="number" className='w-20 text-center p-2 bg-gray-50 border rounded-lg font-black text-xs' value={editFormData.stock} onChange={(e)=>setEditFormData({...editFormData, stock: e.target.value})} />
              ) : (
                <span className={`text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest ${item.stock <= 0 ? 'bg-red-50 text-red-600' : item.stock <= 5 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-700'}`}>
                  {item.stock <= 0 ? 'Depleted' : `${item.stock} Units`}
                </span>
              )}
            </div>

            {/* Price */}
            <div>
               {editingId === item._id ? (
                 <input type="number" className='w-full p-2 bg-[#BC002D]/5 border border-[#BC002D]/10 rounded-lg font-black text-xs text-[#BC002D]' value={editFormData.price} onChange={(e)=>setEditFormData({...editFormData, price: e.target.value})} />
               ) : (
                 <p className='text-sm font-black text-gray-900 tracking-tighter'>₹{formatINR(item.price)}</p>
               )}
            </div>

            {/* Actions */}
            <div className='flex gap-2 justify-center'>
              {editingId === item._id ? (
                <>
                  <button onClick={() => saveEdit(item._id)} className='p-3 bg-black text-white rounded-xl hover:bg-[#BC002D] transition-colors'><Check size={14}/></button>
                  <button onClick={() => setEditingId(null)} className='p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-200'><X size={14}/></button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(item)} className='p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-black hover:text-white transition-all'><Edit3 size={14}/></button>
                  <button onClick={() => removeProduct(item._id)} className='p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-[#BC002D] hover:text-white transition-all'><Trash2 size={14}/></button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* LOAD MORE */}
      {hasMore && (
        <div className='mt-16 flex flex-col items-center gap-6 pb-20'>
           <div className='text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]'>Showing {list.length} of {totalCount} Records</div>
           <button 
             onClick={() => setPage(prev => prev + 1)} 
             disabled={loading}
             className='bg-white border-2 border-black px-12 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.5em] hover:bg-black hover:text-white transition-all flex items-center gap-3 active:scale-95 disabled:opacity-30'
           >
             {loading ? 'Accessing Ledger...' : 'Load More Inventory'}
             <ChevronDown size={14} />
           </button>
        </div>
      )}
    </div>
  );
};

export default List;