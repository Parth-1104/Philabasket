import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { 
  AlertCircle, TrendingDown, Search, ChevronDown, Trash2, 
  Edit3, X, Image as ImageIcon, Video, Globe, 
  Layers, Tag, Save, Eye, Plus
} from 'lucide-react';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  // --- REGISTRY SYNC FETCHING ---
  const fetchList = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const targetPage = reset ? 1 : page;
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        params: { page: targetPage, limit: 30, search: searchTerm }
      });

      if (response.data.success) {
        // If reset is true, we replace the list (essential for fresh data after update)
        setList(prev => reset ? response.data.products : [...prev, ...response.data.products]);
        setTotalCount(response.data.total);
        setHasMore(response.data.products.length === 30);
      }
    } catch (error) {
      toast.error("Registry connection failed");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  // Handle Search Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchList(true);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Handle Pagination
  useEffect(() => {
    if (page > 1) fetchList();
  }, [page]);

  // --- ACTIONS ---
  const openEditModal = (item) => {
    setEditFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${backendUrl}/api/product/update`, 
        { ...editFormData, id: editFormData._id }, 
        { headers: { token } }
      );
      
      if (res.data.success) {
        toast.success("Registry Record Synchronized");
        setIsModalOpen(false);
        // FORCE REFRESH: Pull clean data from DB to resolve Read-Write conflicts
        fetchList(true); 
      }
    } catch (error) {
      toast.error("Sync Failed: Database error");
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm("Permanently purge this specimen from the archive?")) return;
    try {
      const res = await axios.post(`${backendUrl}/api/product/remove`, { id }, { headers: { token } });
      if (res.data.success) {
        toast.success("Specimen Purged");
        fetchList(true);
      }
    } catch (error) {
      toast.error("Removal failed");
    }
  };

  const addImageSlot = () => {
    if (editFormData.image.length < 4) {
      setEditFormData({ ...editFormData, image: [...editFormData.image, ""] });
    }
  };

  const removeImageSlot = (index) => {
    const newImgs = editFormData.image.filter((_, i) => i !== index);
    setEditFormData({ ...editFormData, image: newImgs });
  };

  return (
    <div className='max-w-7xl mx-auto p-4 lg:p-10 bg-gray-50 min-h-screen select-none'>
      
      {/* HEADER */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6'>
        <div>
          <h2 className='text-4xl font-black text-gray-900 uppercase tracking-tighter'>Management <span className='text-[#BC002D]'>Console</span></h2>
          <p className='text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-2'>Control Center for 100k+ Specimens</p>
        </div>
        <div className='relative w-full md:w-96'>
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' size={16} />
          <input 
            type="text" 
            placeholder="Search Registry..."
            className='w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-xs font-bold outline-none shadow-sm focus:border-[#BC002D] transition-all'
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LIST TABLE */}
      <div className='space-y-4'>
        {list.map((item) => (
          <div key={item._id} className='bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between hover:shadow-xl transition-all group'>
            <div className='flex items-center gap-6'>
              <div className='w-14 h-16 bg-gray-50 rounded-lg p-1 border border-gray-100'>
                <img src={item.image[0]} className='w-full h-full object-contain' alt="" />
              </div>
              <div>
                <h4 className='text-sm font-black text-gray-900 uppercase'>{item.name}</h4>
                <p className='text-[9px] font-bold text-gray-400 uppercase tracking-widest'>{item.country} • {item.year}</p>
                <div className='flex gap-2 mt-2'>
                  <span className='text-[8px] font-black px-2 py-0.5 bg-gray-100 rounded text-gray-500 uppercase'>{item.condition}</span>
                  <span className='text-[8px] font-black px-2 py-0.5 bg-red-50 rounded text-[#BC002D] uppercase'>₹{item.price}</span>
                  <span className='text-[8px] font-black px-2 py-0.5 bg-red-50 rounded text-[#BC002D] uppercase'>₹{item.marketPrice}</span>

                </div>
              </div>
            </div>
            <div className='flex items-center gap-3 pr-4'>
                <button onClick={() => openEditModal(item)} className='p-3 bg-gray-50 rounded-xl hover:bg-black hover:text-white transition-all'><Edit3 size={16}/></button>
                <button onClick={() => removeProduct(item._id)} className='p-3 bg-gray-50 rounded-xl hover:bg-[#BC002D] hover:text-white transition-all'><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      {/* --- EDIT MODAL & LIVE PREVIEW --- */}
      {isModalOpen && editFormData && (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10'>
          <div className='absolute inset-0 bg-black/80 backdrop-blur-sm' onClick={() => setIsModalOpen(false)}></div>
          
          <div className='relative bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl animate-in fade-in zoom-in duration-300'>
            <div className='sticky top-0 bg-white z-20 px-8 py-6 border-b border-gray-100 flex justify-between items-center'>
                <h3 className='text-xl font-black uppercase tracking-tighter'>Live Specimen Synchronization</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className='p-3 bg-gray-50 rounded-full hover:bg-black hover:text-white transition-all'><X size={20}/></button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-0'>
                {/* LEFT: FORM DATA */}
                <form onSubmit={handleUpdate} className='p-8 grid grid-cols-1 md:grid-cols-2 gap-12 border-r border-gray-100'>
                    <div className='space-y-8'>
                        <div className='space-y-6'>
                            <h5 className='text-[10px] font-black text-[#BC002D] uppercase tracking-[0.3em] flex items-center gap-2'><Tag size={12}/> Primary Identity</h5>
                            <input className='w-full p-4 bg-gray-50 border rounded-2xl text-xs font-bold outline-none' value={editFormData.name} onChange={(e)=>setEditFormData({...editFormData, name: e.target.value})} />
                            <div className='grid grid-cols-2 gap-4'>
                                <input type="number" className='p-4 bg-gray-50 border rounded-2xl text-xs font-bold outline-none' value={editFormData.price} onChange={(e)=>setEditFormData({...editFormData, price: e.target.value})} />
                                <input type="number" className='p-4 bg-gray-50 border rounded-2xl text-xs font-bold outline-none' value={editFormData.marketPrice} onChange={(e)=>setEditFormData({...editFormData, marketPrice: e.target.value})} />

                                <input placeholder="Country" className='p-4 bg-gray-50 border rounded-2xl text-xs font-bold outline-none' value={editFormData.country} onChange={(e)=>setEditFormData({...editFormData, country: e.target.value})} />
                            </div>
                            <textarea rows={4} className='w-full p-4 bg-gray-50 border rounded-2xl text-xs font-bold outline-none resize-none' value={editFormData.description} onChange={(e)=>setEditFormData({...editFormData, description: e.target.value})} />
                        </div>
                        
                        <div className='space-y-6'>
                            <div className='flex justify-between items-center'>
                                <h5 className='text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]'><ImageIcon size={12}/> Visual Archive ({editFormData.image.length}/4)</h5>
                                {editFormData.image.length < 4 && <button type="button" onClick={addImageSlot} className='text-[8px] font-black bg-[#BC002D] text-white px-2 py-1 rounded-full'>+ Add Slot</button>}
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                {editFormData.image.map((img, idx) => (
                                    <div key={idx} className='relative group'>
                                        <input className='w-full p-2 bg-white border rounded-xl text-[9px] font-bold outline-none focus:border-[#BC002D]' placeholder="Image URL..." value={img} onChange={(e)=>{
                                            const n = [...editFormData.image]; n[idx] = e.target.value; setEditFormData({...editFormData, image: n});
                                        }} />
                                        <button type="button" onClick={()=>removeImageSlot(idx)} className='absolute -top-2 -right-2 bg-white shadow-md p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity'><X size={10}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='space-y-8'>
                        <div className='space-y-6'>
                            <h5 className='text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]'><Layers size={12}/> Inventory Ledger</h5>
                            <div className='grid grid-cols-2 gap-4'>
                                <input type="number" className='p-4 bg-gray-50 border rounded-2xl text-xs font-bold outline-none' value={editFormData.stock} onChange={(e)=>setEditFormData({...editFormData, stock: e.target.value})} />
                                <select className='p-4 bg-gray-50 border rounded-2xl text-xs font-bold outline-none' value={editFormData.condition} onChange={(e)=>setEditFormData({...editFormData, condition: e.target.value})}>
                                    <option value="Mint">Mint</option>
                                    <option value="Used">Used</option>
                                    <option value="Fine">Fine</option>
                                </select>
                            </div>
                        </div>
                        <div className='bg-black p-8 rounded-[40px]'>
                            <div className='flex justify-between items-center mb-6'>
                                <p className='text-[8px] font-black text-[#BC002D] uppercase tracking-widest'>Registry Status</p>
                                <TrendingDown size={14} className='text-gray-600' />
                            </div>
                            <h4 className='text-white text-3xl font-black mb-1'>₹{editFormData.price}</h4>
                            <p className='text-[8px] text-gray-500 font-bold uppercase mb-8'>Reward Projection: {Math.floor(editFormData.price * 0.10)} PTS</p>
                            <button type="submit" className='w-full py-5 bg-[#BC002D] text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3'>
                                <Save size={16}/> Push Update
                            </button>
                        </div>
                    </div>
                </form>

                {/* RIGHT: LIVE RENDERING PREVIEW */}
                <div className='bg-gray-50 p-10 flex flex-col items-center border-l border-gray-100'>
                    <h5 className='text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-2'><Eye size={12}/> Live Gallery View</h5>
                    
                    {/* The Specimen Card Preview */}
                    <div className='w-full max-w-[280px] bg-white rounded-br-[60px] p-4 shadow-2xl border border-gray-100 group'>
                        <div className='aspect-[3/4] bg-[#f8f8f8] rounded-br-[30px] flex items-center justify-center p-4 relative mb-4 overflow-hidden'>
                            <img src={editFormData.image[0] || "https://placehold.co/400x600?text=No+Image"} className='w-full h-full object-contain filter drop-shadow-md transition-transform duration-700 group-hover:scale-110' alt="Preview" />
                            <div className='absolute top-2 left-2 px-2 py-0.5 bg-[#BC002D] text-white text-[7px] font-black uppercase tracking-widest'>Live Preview</div>
                        </div>
                        <div className='space-y-1 px-1'>
                            <h4 className='text-[11px] font-black uppercase truncate text-gray-900'>{editFormData.name || "Untitled Specimen"}</h4>
                            <p className='text-[8px] font-bold text-gray-400 uppercase tracking-widest'>{editFormData.country || "International"} • {editFormData.year || "Year"}</p>
                            <div className='flex justify-between items-end mt-4'>
                                <p className='text-lg font-black text-[#BC002D] tracking-tighter leading-none'>₹{editFormData.price}</p>
                                <p className='text-lg font-black text-[#BC002D] tracking-tighter leading-none'>₹{editFormData.marketPrice}</p>

                                <span className={`text-[7px] font-black px-2 py-1 rounded uppercase tracking-tighter ${editFormData.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {editFormData.stock > 0 ? 'In Archive' : 'Sold Out'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className='mt-10 p-5 bg-white rounded-[25px] border border-gray-100 w-full'>
                        <p className='text-[8px] font-black text-gray-400 uppercase mb-3 flex items-center gap-2'><Layers size={10}/> Data Integrity</p>
                        <p className='text-[10px] text-gray-600 font-medium leading-relaxed italic'>
                            "{editFormData.description?.slice(0, 120)}..."
                        </p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER PAGINATION */}
      {hasMore && (
        <div className='mt-16 flex flex-col items-center pb-20'>
           <button onClick={() => setPage(p => p + 1)} disabled={loading} className='px-12 py-5 bg-white border-2 border-black rounded-full text-[10px] font-black uppercase tracking-[0.5em] hover:bg-black hover:text-white transition-all flex items-center gap-4'>
             {loading ? 'Consulting Archive...' : 'Access More Records'}
             <ChevronDown size={16}/>
           </button>
        </div>
      )}
    </div>
  );
};

export default List;