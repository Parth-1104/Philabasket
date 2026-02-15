import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { 
  Search, Trash2, Edit3, X, Image as ImageIcon, Video, 
  Layers, Tag, Save, Eye, Youtube, Pin, Power, PowerOff, CheckSquare, Square, EyeOff, Star, Zap, Filter
} from 'lucide-react';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  // --- NEW FILTER STATES ---
  const [filterBestseller, setFilterBestseller] = useState(false);
  const [filterNewArrival, setFilterNewArrival] = useState(false);

  const handleBulkAttributeUpdate = async (field, value) => {
    try {
      setLoading(true);
      const res = await axios.post(`${backendUrl}/api/product/bulk-update-attributes`, 
        { ids: selectedIds, field, value }, 
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(`${selectedIds.length} specimens updated`);
        setSelectedIds([]);
        fetchList(page, true); // Refresh current view
      }
    } catch (error) {
      toast.error("Bulk update failed");
    } finally {
      setLoading(false);
    }
  };

  // --- REGISTRY DATA FETCHING ---
  const fetchList = useCallback(async (targetPage, isReset = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        params: { 
          page: targetPage, 
          limit: 30, 
          search: searchTerm, 
          includeHidden: 'true',
          // Pass new filters to backend
          bestseller: filterBestseller ? 'true' : undefined,
          newArrival: filterNewArrival ? 'true' : undefined
        }
      });
      if (response.data.success) {
        const fetchedProducts = response.data.products;
        setList(prev => isReset ? fetchedProducts : [...prev, ...fetchedProducts]);
        setTotalCount(response.data.total);
        setHasMore(fetchedProducts.length === 30);
      }
    } catch (error) {
      toast.error("Registry connection failed");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterBestseller, filterNewArrival, backendUrl]); 

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      setSelectedIds([]);
      fetchList(1, true);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterBestseller, filterNewArrival, fetchList]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchList(nextPage, false);
  };

  // ... (handleBulkStatusUpdate, toggleSelect, toggleSelectAll, removeBulkProducts remain same)

  const handleBulkStatusUpdate = async (isActive) => {
    try {
      setLoading(true);
      const res = await axios.post(`${backendUrl}/api/product/bulk-status`, 
        { ids: selectedIds, isActive }, 
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setSelectedIds([]);
        fetchList(1, true);
        setPage(1);
      }
    } catch (error) {
      toast.error("Bulk status update failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === list.length && list.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(list.map(item => item._id));
    }
  };

  const removeBulkProducts = async () => {
    if (!window.confirm(`Purge ${selectedIds.length} specimens from registry?`)) return;
    try {
      setLoading(true);
      const res = await axios.post(`${backendUrl}/api/product/remove-bulk`, { ids: selectedIds }, { headers: { token } });
      if (res.data.success) {
        toast.success(res.data.message);
        setSelectedIds([]);
        setPage(1);
        fetchList(1, true);
      }
    } catch (error) {
      toast.error("Bulk removal failed");
    } finally {
      setLoading(false);
    }
  };

  // --- MODAL & IMAGE MANAGEMENT ---
  const openEditModal = (item) => {
    setEditFormData({ 
      ...item, 
      description: item.description || "", 
      youtubeUrl: item.youtubeUrl || "",
      isLatest: item.isLatest || false,
      isActive: item.isActive !== undefined ? item.isActive : true,
      bestseller: item.bestseller || false,
      newArrival: item.newArrival || false,
      producedCount: item.producedCount || 0
    });
    setIsModalOpen(true);
  };

  const addImageSlot = () => {
    if (editFormData.image.length < 4) {
      setEditFormData({ ...editFormData, image: [...editFormData.image, ""] });
    } else {
      toast.info("Maximum 4 visual records allowed");
    }
  };

  const removeImageSlot = (index) => {
    const newImgs = editFormData.image.filter((_, i) => i !== index);
    setEditFormData({ ...editFormData, image: newImgs });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            id: editFormData._id,
            name: editFormData.name,
            description: editFormData.description,
            price: Number(editFormData.price),
            marketPrice: Number(editFormData.marketPrice),
            image: editFormData.image,
            youtubeUrl: editFormData.youtubeUrl,
            stock: Number(editFormData.stock),
            producedCount: Number(editFormData.producedCount),
            condition: editFormData.condition,
            isActive: editFormData.isActive,
            isLatest: editFormData.isLatest,
            bestseller: editFormData.bestseller,
            newArrival: editFormData.newArrival 
          };

      const res = await axios.post(`${backendUrl}/api/product/update`, payload, { headers: { token } });
      if (res.data.success) {
        toast.success("Registry Synchronized");
        setIsModalOpen(false);
        fetchList(page, true);
      }
    } catch (error) {
      toast.error("Sync Failed");
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm("Purge specimen?")) return;
    try {
      const res = await axios.post(`${backendUrl}/api/product/remove`, { id }, { headers: { token } });
      if (res.data.success) {
        toast.success("Specimen Purged");
        fetchList(1, true);
        setPage(1);
      }
    } catch (error) {
      toast.error("Removal failed");
    }
  };

  return (
    <div className='max-w-7xl mx-auto p-4 lg:p-10 bg-gray-50 min-h-screen select-none'>
      
      {/* HEADER */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6'>
        <div>
          <h2 className='text-4xl font-black text-gray-900 uppercase tracking-tighter'>Management <span className='text-[#BC002D]'>Console</span></h2>
          <p className='text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-2'>Archive Registry: {totalCount} Specimens</p>
        </div>
        <div className='relative w-full md:w-96'>
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' size={16} />
          <input 
            type="text" 
            placeholder="Search Registry..."
            className='w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-xs font-bold outline-none shadow-sm'
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* QUICK FILTERS BAR */}
      <div className='mb-6 flex items-center gap-4'>
        <div className='flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm'>
            <Filter size={14} className='text-gray-400' />
            <span className='text-[10px] font-black uppercase text-gray-400 mr-2'>Quick Filters:</span>
            
            <button 
                onClick={() => setFilterBestseller(!filterBestseller)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${filterBestseller ? 'bg-amber-100 text-amber-700 border-amber-200 border' : 'bg-gray-50 text-gray-400 border-transparent border'}`}
            >
                <Star size={12} className={filterBestseller ? 'fill-amber-500' : ''} /> Bestsellers
            </button>

            <button 
                onClick={() => setFilterNewArrival(!filterNewArrival)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${filterNewArrival ? 'bg-blue-100 text-blue-700 border-blue-200 border' : 'bg-gray-50 text-gray-400 border-transparent border'}`}
            >
                <Zap size={12} className={filterNewArrival ? 'fill-blue-500' : ''} /> New Arrivals
            </button>

            {(filterBestseller || filterNewArrival || searchTerm) && (
                <button 
                    onClick={() => {setFilterBestseller(false); setFilterNewArrival(false); setSearchTerm("")}}
                    className='text-[9px] font-black uppercase text-[#BC002D] ml-2 hover:underline'
                >
                    Reset
                </button>
            )}
        </div>
      </div>

      {/* COMMAND BAR */}
      {list.length > 0 && selectedIds.length > 0 && (
        <div className='mb-6 flex flex-wrap items-center justify-between bg-black p-4 rounded-2xl shadow-2xl animate-in slide-in-from-top duration-300 gap-4'>
          <div className='flex items-center gap-4'>
            <span className='text-[10px] font-black text-white bg-[#BC002D] px-4 py-2 rounded-full'>
              {selectedIds.length} SPECIMENS SELECTED
            </span>
          </div>
          
          <div className='flex items-center gap-2 flex-wrap'>
            {/* Bulk Bestseller Toggles */}
            <button onClick={() => handleBulkAttributeUpdate('bestseller', true)} className='flex items-center gap-2 bg-amber-500 text-black px-4 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-amber-400 transition-all'>
              <Star size={14} className="fill-black"/> + Bestseller
            </button>
            
            {/* Bulk New Arrival Toggles */}
            <button onClick={() => handleBulkAttributeUpdate('newArrival', true)} className='flex items-center gap-2 bg-blue-500 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-blue-400 transition-all'>
              <Zap size={14} className="fill-white"/> + New Arrival
            </button>

            <div className='w-[1px] h-8 bg-white/20 mx-2'></div>

            {/* Bulk Visibility */}
            <button onClick={() => handleBulkStatusUpdate(true)} className='p-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all'>
              <Power size={14}/>
            </button>
            <button onClick={removeBulkProducts} className='p-2.5 bg-[#BC002D] text-white rounded-xl hover:scale-110 transition-all'>
              <Trash2 size={14}/>
            </button>
          </div>
        </div>
      )}

      {/* TABLE LIST */}
      <div className='space-y-4 pb-10'>
        {list.map((item) => (
          <div key={item._id} className={`bg-white p-4 rounded-2xl border flex items-center justify-between hover:shadow-xl transition-all ${selectedIds.includes(item._id) ? 'border-[#BC002D] bg-[#BC002D]/5' : 'border-gray-100'} ${!item.isActive ? 'opacity-60 grayscale-[0.5] border-dashed bg-gray-50/50' : ''}`}>
            <div className='flex items-center gap-4'>
              <button onClick={() => toggleSelect(item._id)} className='p-1 text-gray-300 hover:text-[#BC002D] transition-colors'>
                {selectedIds.includes(item._id) ? <CheckSquare size={20} className='text-[#BC002D]'/> : <Square size={20}/>}
              </button>
              <div className='flex items-center gap-6 cursor-pointer' onClick={() => openEditModal(item)}>
                <div className='w-14 h-16 bg-gray-50 rounded-lg p-1 border relative'>
                  <img src={item.image[0]} className='w-full h-full object-contain' alt="" />
                  {item.isLatest && <Pin size={10} className='absolute -top-2 -right-2 text-[#BC002D] fill-[#BC002D]'/>}
                  {!item.isActive && <EyeOff size={10} className='absolute -bottom-1 -right-1 text-gray-400' />}
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <h4 className='text-sm font-black text-gray-900 uppercase'>{item.name}</h4>
                    {item.bestseller && <Star size={12} className='text-amber-500 fill-amber-500' />}
                    {item.newArrival && <Zap size={12} className='text-blue-500 fill-blue-500' />}
                  </div>
                  <p className='text-[9px] font-bold text-gray-400 uppercase tracking-widest'>{item.country} • {item.year} { !item.isActive && '• ARCHIVED' }</p>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-3 pr-4'>
                <button onClick={() => openEditModal(item)} className='p-3 bg-gray-50 rounded-xl hover:bg-black hover:text-white transition-all'><Edit3 size={16}/></button>
                <button onClick={() => removeProduct(item._id)} className='p-3 bg-gray-50 rounded-xl hover:bg-[#BC002D] hover:text-white transition-all'><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
        {list.length === 0 && !loading && (
            <div className='py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200'>
                <p className='text-xs font-black uppercase tracking-[0.3em] text-gray-400'>No specimens matching these criteria</p>
            </div>
        )}
      </div>

      {/* PAGINATION */}
      {hasMore && (
        <div className='mt-8 flex flex-col items-center pb-20'>
           <button onClick={handleLoadMore} disabled={loading} className='px-12 py-5 bg-white border-2 border-black rounded-full text-[10px] font-black uppercase tracking-[0.5em] hover:bg-black hover:text-white transition-all'>
             {loading ? 'Consulting Archive...' : 'Access More Records'}
           </button>
        </div>
      )}

      {/* EDIT MODAL REMAINS SAME AS PREVIOUS VERSION */}
      {isModalOpen && editFormData && (
        <div className='fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-10'>
          <div className='absolute inset-0 bg-black/80 backdrop-blur-sm' onClick={() => setIsModalOpen(false)}></div>
          <div className='relative bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl animate-in fade-in zoom-in duration-300'>
            
            <div className='sticky top-0 bg-white z-20 px-8 py-6 border-b border-gray-100 flex justify-between items-center'>
                <h3 className='text-xl font-black uppercase tracking-tighter'>Specimen Sync</h3>
                <div className='flex items-center gap-4'>
                   <button 
                    type="button" 
                    onClick={() => setEditFormData({...editFormData, isActive: !editFormData.isActive})}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase transition-all ${editFormData.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                   >
                    {editFormData.isActive ? <><Power size={12}/> Active</> : <><PowerOff size={12}/> Hidden</>}
                   </button>
                   <button type="button" onClick={() => setIsModalOpen(false)} className='p-3 bg-gray-50 rounded-full hover:bg-black hover:text-white transition-all'><X size={20}/></button>
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-0'>
                <form onSubmit={handleUpdate} className='p-8 grid grid-cols-1 md:grid-cols-2 gap-12 border-r border-gray-100'>
                    <div className='space-y-8'>
                        <div className='space-y-6'>
                            <h5 className='text-[10px] font-black text-[#BC002D] uppercase tracking-[0.3em] flex items-center gap-2'><Tag size={12}/> Primary Identity</h5>
                            <input className='w-full p-4 bg-gray-50 border rounded-2xl text-xs font-bold outline-none' value={editFormData.name} onChange={(e)=>setEditFormData({...editFormData, name: e.target.value})} />
                            <div className='grid grid-cols-2 gap-4'>
                                <input type="number" placeholder="Price" className='p-4 bg-gray-50 border rounded-2xl text-xs font-bold outline-none' value={editFormData.price} onChange={(e)=>setEditFormData({...editFormData, price: e.target.value})} />
                                <input type="number" placeholder="Market Price" className='p-4 bg-gray-50 border rounded-2xl text-xs font-bold outline-none' value={editFormData.marketPrice} onChange={(e)=>setEditFormData({...editFormData, marketPrice: e.target.value})} />
                            </div>
                            <textarea rows={5} placeholder="Archive Description" className='w-full p-4 bg-gray-50 border rounded-2xl text-xs font-bold outline-none resize-none focus:border-[#BC002D]' value={editFormData.description} onChange={(e)=>setEditFormData({...editFormData, description: e.target.value})} />
                        </div>

                        <div className='space-y-6'>
                            <div className='flex justify-between items-center'>
                                <h5 className='text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]'><ImageIcon size={12}/> Visual Records</h5>
                                {editFormData.image.length < 4 && <button type="button" onClick={addImageSlot} className='text-[8px] font-black bg-[#BC002D] text-white px-2 py-1 rounded-full'>+ Add Image</button>}
                            </div>
                            <div className='grid grid-cols-1 gap-3'>
                                {editFormData.image.map((img, idx) => (
                                    <div key={idx} className='flex items-center gap-2'>
                                        <input className='flex-1 p-3 bg-white border rounded-xl text-[9px] font-bold outline-none focus:border-[#BC002D]' value={img} onChange={(e)=>{
                                            const n = [...editFormData.image]; n[idx] = e.target.value; setEditFormData({...editFormData, image: n});
                                        }} />
                                        <button type="button" onClick={()=>removeImageSlot(idx)} className='text-red-500'><Trash2 size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='space-y-8'>
                        <div className='space-y-6'>
                            <h5 className='text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2'><Video size={12}/> Video Registry</h5>
                            <div className='relative'>
                                <Youtube className='absolute left-4 top-1/2 -translate-y-1/2 text-red-600' size={16} />
                                <input placeholder="YouTube URL" className='w-full pl-12 p-4 bg-gray-50 border rounded-2xl text-xs font-bold outline-none focus:border-[#BC002D]' value={editFormData.youtubeUrl} onChange={(e)=>setEditFormData({...editFormData, youtubeUrl: e.target.value})} />
                            </div>
                        </div>

                        <div className='space-y-6'>
                            <h5 className='text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]'><Layers size={12}/> Registry Control</h5>
                            
                            {/* HOME PAGE FEATURE TOGGLES */}
                            <div className='grid grid-cols-2 gap-3'>
                                <div 
                                    onClick={() => setEditFormData({...editFormData, bestseller: !editFormData.bestseller})}
                                    className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${editFormData.bestseller ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}
                                >
                                    <div className='flex flex-col'>
                                        <span className='text-[8px] font-black uppercase text-gray-400'>Bestseller</span>
                                        <span className={`text-[9px] font-black uppercase ${editFormData.bestseller ? 'text-amber-600' : 'text-gray-400'}`}>{editFormData.bestseller ? "Active" : "Disabled"}</span>
                                    </div>
                                    {editFormData.bestseller ? <Star size={16} className='text-amber-500 fill-amber-500'/> : <Star size={16} className='text-gray-300'/>}
                                </div>

                                <div 
                                    onClick={() => setEditFormData({...editFormData, newArrival: !editFormData.newArrival})}
                                    className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${editFormData.newArrival ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}
                                >
                                    <div className='flex flex-col'>
                                        <span className='text-[8px] font-black uppercase text-gray-400'>New Arrival</span>
                                        <span className={`text-[9px] font-black uppercase ${editFormData.newArrival ? 'text-blue-600' : 'text-gray-400'}`}>{editFormData.newArrival ? "Active" : "Disabled"}</span>
                                    </div>
                                    {editFormData.newArrival ? <Zap size={16} className='text-blue-500 fill-blue-500'/> : <Zap size={16} className='text-gray-300'/>}
                                </div>
                            </div>

                            <div className='flex items-center justify-between p-4 bg-gray-50 border rounded-2xl'>
                                <label className='text-[9px] font-black text-gray-400 uppercase'>Feature on Home (Pin)</label>
                                <input type="checkbox" checked={editFormData.isLatest} onChange={(e)=>setEditFormData({...editFormData, isLatest: e.target.checked})} className='accent-[#BC002D]' />
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-1'>
                                    <label className='text-[8px] font-black text-gray-400 uppercase ml-2'>Stock</label>
                                    <input type="number" className='w-full p-4 bg-gray-50 border rounded-2xl text-xs font-bold outline-none' value={editFormData.stock} onChange={(e)=>setEditFormData({...editFormData, stock: e.target.value})} />
                                </div>
                                <div className='space-y-1'>
                                    <label className='text-[8px] font-black text-gray-400 uppercase ml-2'>Mintage (Produced)</label>
                                    <input type="number" className='w-full p-4 bg-gray-50 border rounded-2xl text-xs font-bold outline-none' value={editFormData.producedCount} onChange={(e)=>setEditFormData({...editFormData, producedCount: e.target.value})} />
                                </div>
                            </div>
                            <div className='space-y-1'>
                                <label className='text-[8px] font-black text-gray-400 uppercase ml-2'>Condition</label>
                                <select className='w-full p-4 bg-gray-50 border rounded-2xl text-xs font-bold outline-none' value={editFormData.condition} onChange={(e)=>setEditFormData({...editFormData, condition: e.target.value})}>
                                    <option value="Mint">Mint</option>
                                    <option value="Used">Used</option>
                                    <option value="Fine">Fine</option>
                                    <option value="Near Mint">Near Mint</option>
                                </select>
                            </div>
                        </div>

                        <div className='bg-black p-8 rounded-[40px]'>
                            <h4 className='text-white text-3xl font-black mb-8'>₹{editFormData.price}</h4>
                            <button type="submit" className='w-full py-5 bg-[#BC002D] text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full hover:scale-105 transition-all shadow-xl'>
                                <Save size={16} className='inline mr-2'/> Push Update
                            </button>
                        </div>
                    </div>
                </form>

                <div className='bg-gray-50 p-10 flex flex-col items-center border-l border-gray-100'>
                    <h5 className='text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-10'><Eye size={12} className='inline mr-2'/> Live Preview</h5>
                    <div className={`w-full max-w-[280px] bg-white rounded-br-[60px] p-4 shadow-2xl border ${!editFormData.isActive ? 'grayscale' : ''} relative`}>
                        <div className='aspect-[3/4] bg-[#f8f8f8] rounded-br-[30px] flex items-center justify-center p-4 relative mb-4 overflow-hidden'>
                            <img src={editFormData.image[0] || "https://placehold.co/400x600?text=No+Image"} className='w-full h-full object-contain filter drop-shadow-md' alt="" />
                            
                            {editFormData.newArrival && (
                                <div className="absolute top-0 right-0 z-20 overflow-hidden w-16 h-16 pointer-events-none">
                                    <div className="absolute top-[15%] -right-[30%] bg-[#BC002D] text-white text-[6px] font-black py-1 w-[140%] text-center transform rotate-45 shadow-sm uppercase tracking-tighter">New</div>
                                </div>
                            )}

                            {editFormData.isLatest && <Pin size={14} className='absolute top-2 left-2 text-[#BC002D] fill-[#BC002D]'/>}
                            {editFormData.bestseller && <Star size={14} className='absolute bottom-2 right-2 text-amber-500 fill-amber-500'/>}
                        </div>
                        <h4 className='text-[11px] font-black uppercase truncate'>{editFormData.name || "Specimen"}</h4>
                        <p className='text-[10px] text-[#BC002D] font-black'>₹{editFormData.price}</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;