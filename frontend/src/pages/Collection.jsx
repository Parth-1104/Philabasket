import React, { useContext, useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from '../components/ProductItem';
import { Filter, X, ArrowUpDown, Search as SearchIcon, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

const Collection = () => {
  const { search, showSearch, backendUrl } = useContext(ShopContext);
  const location = useLocation();
  
  // --- PERFORMANCE STATE ---
  const [products, setProducts] = useState([]); 
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [totalFound, setTotalFound] = useState(0); 

  // --- UI STATE ---
  const [showFilter, setShowFilter] = useState(false); 
  const [category, setCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');
  const [filterSearch, setFilterSearch] = useState("");
  const [ALL_CATEGORIES, setCategoryOptions] = useState([]);

  const observer = useRef();

  // 1. INFINITE SCROLL SENTINEL
  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // 2. SERVER-SIDE ENGINE
  const fetchFromRegistry = async (currentPage, isNewQuery = false) => {
    if (!backendUrl) return;
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        params: {
          page: currentPage,
          limit: 20,
          category: category.join(','),
          sort: sortType,
          search: showSearch ? search : ''
        }
      });

      if (response.data.success) {
        let newItems = response.data.products;

        // --- PRIORITY ID LOGIC: Move clicked item to top on first load ---
        if (isNewQuery && currentPage === 1 && location.state?.priorityId) {
            const priorityId = location.state.priorityId;
            const priorityItem = newItems.find(item => item._id === priorityId);
            
            if (priorityItem) {
                const remaining = newItems.filter(item => item._id !== priorityId);
                newItems = [priorityItem, ...remaining];
            } 
        }

        setProducts(prev => isNewQuery ? newItems : [...prev, ...newItems]);
        setTotalFound(response.data.total);
        setHasMore(newItems.length === 20); 
      }
    } catch (error) {
      toast.error("Registry Sync Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page > 1) fetchFromRegistry(page);
  }, [page]);

  useEffect(() => {
    setPage(1);
    fetchFromRegistry(1, true);
  }, [category, sortType, search, showSearch]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/category/list');
      if (response.data.success) {
        const names = response.data.categories.map(cat => cat.name).sort();
        setCategoryOptions(names);
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchCategories(); }, [backendUrl]);

  const toggleCategory = (val) => {
    setCategory(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]);
  }

  const filteredCategoryList = useMemo(() => {
    return ALL_CATEGORIES.filter(cat => cat.toLowerCase().includes(filterSearch.toLowerCase()));
  }, [filterSearch, ALL_CATEGORIES]);

  return (
    <div className='bg-white min-h-screen pt-24 pb-20 px-6 md:px-16 lg:px-24 select-none relative animate-fade-in'>
      
      <div className="absolute -right-[10vw] top-0 h-[60vh] w-[40vw] bg-[#BC002D]/5 rounded-bl-[600px] pointer-events-none z-0"></div>

      {/* --- HEADER --- */}
      <div className='relative z-10 flex flex-col md:flex-row justify-between items-end mb-16 gap-8'>
          <div className='max-w-2xl'>
              <div className='flex items-center gap-4 mb-4'>
                  <span className='h-[1.5px] w-12 bg-[#BC002D]'></span>
                  <p className='text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-black'>Registry Database</p>
              </div>
              <h2 className='text-6xl md:text-5xl font-bold text-gray-900 tracking-tighter leading-none uppercase'>
                  THE <span className='text-[#BC002D]'>GALLERY.</span>
              </h2>
              
              {/* NEW: SEARCH RESULTS HEADER */}
              {showSearch && search && (
                <div className='mt-6 flex items-center gap-2 animate-slide-down'>
                  <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Search Results for:</p>
                  <span className='text-[10px] font-black text-[#BC002D] uppercase tracking-widest bg-[#BC002D]/5 px-3 py-1 border border-[#BC002D]/20 rounded-sm italic'>"{search}"</span>
                </div>
              )}

              <p className='mt-6 text-gray-400 text-xs font-bold uppercase tracking-[0.2em] leading-relaxed'>
                  <span className='text-black'>{totalFound} certified specimens archived</span> 
              </p>
          </div>

          <div className='hidden lg:flex items-center gap-4 bg-gray-50 p-2 rounded-full border border-gray-100'>
              <div className='pl-4 text-[9px] font-black uppercase tracking-widest text-gray-700'>Order By:</div>
              <select onChange={(e)=>setSortType(e.target.value)} className='bg-white border-none text-[10px] text-gray-700 font-black tracking-widest uppercase px-6 py-3 rounded-full outline-none cursor-pointer'>
                  <option value="relevant">Relevance</option>
                  <option value="low-high">Value: Low-High</option>
                  <option value="high-low">Value: High-Low</option>
              </select>
          </div>
      </div>

      <div className='flex flex-col lg:flex-row gap-12 relative z-20'>
        {/* --- SIDEBAR --- */}
        <aside className={`fixed inset-0 z-[3000] lg:relative lg:z-0 lg:inset-auto lg:w-80 lg:block lg:sticky lg:top-32 lg:h-fit transition-all duration-700 ${showFilter ? 'opacity-100' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'}`}>
          <div onClick={() => setShowFilter(false)} className='absolute inset-0 bg-black/80 backdrop-blur-sm lg:hidden'></div>
          <div className={`absolute top-0 right-0 h-full w-[85%] bg-[#BC002D] p-10 flex flex-col transition-transform duration-500 lg:relative lg:w-full lg:p-8 lg:translate-x-0 lg:bg-[#BC002D] lg:rounded-br-[80px] lg:shadow-2xl ${showFilter ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
            <div className='flex justify-between items-center mb-8'>
                <h3 className='text-white font-black text-xs tracking-[0.3em] uppercase'>Registry Index</h3>
                <button onClick={() => setShowFilter(false)} className='lg:hidden text-white'><X size={24}/></button>
            </div>
            
            <div className='relative mb-8'>
                <SearchIcon size={14} className='absolute left-5 top-1/2 -translate-y-1/2 text-white/50' />
                <input type="text" placeholder="SEARCH CATEGORIES..." className='w-full bg-black/20 border border-white/10 rounded-full px-12 py-4 text-[10px] font-black tracking-widest text-white outline-none placeholder:text-white/30' onChange={(e) => setFilterSearch(e.target.value)} />
            </div>

            <div className='flex-1 overflow-y-auto custom-scrollbar'>
              <div className='flex flex-col space-y-3 pb-10'>
                {filteredCategoryList.map((item) => (
                  <button key={item} onClick={() => toggleCategory(item)} className={`w-full group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${category.includes(item) ? 'bg-white border-white' : 'bg-black/5 border-transparent hover:border-white/20'}`}>
                    <span className={`text-[9px] tracking-[0.2em] uppercase font-black ${category.includes(item) ? 'text-[#BC002D]' : 'text-[#fff442] group-hover:text-white'}`}>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* --- MAIN DISPLAY --- */}
        <main className='flex-1'>
          <div className='lg:hidden flex gap-4 mb-8'>
            <button onClick={() => setShowFilter(true)} className='flex-1 bg-black text-white p-5 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest'>
               <Filter size={14} /> Categories
            </button>
            <div className='flex-1 bg-gray-100 p-5 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-900'>
               <ArrowUpDown size={14} /> {sortType === 'relevant' ? 'Relevant' : 'Price'}
            </div>
          </div>

          {category.length > 0 && (
            <div className='flex flex-wrap gap-3 mb-12'>
              {category.map(cat => (
                <div key={cat} className='flex items-center gap-3 bg-black text-white px-5 py-2.5 rounded-full text-[9px] font-black tracking-widest uppercase'>
                  {cat}
                  <X size={12} onClick={() => toggleCategory(cat)} className='cursor-pointer text-[#BC002D]' />
                </div>
              ))}
              <button onClick={() => setCategory([])} className='text-[9px] font-black tracking-widest uppercase text-[#BC002D] border-b-2 border-[#BC002D]/20'>Reset All</button>
            </div>
          )}

          <div className='grid grid-cols-2 md:grid-col-4 lg:grid-cols-4 xl:grid-cols-4 gap-x-8 gap-y-16'>
            {products.map((item, index) => (
              <ProductItem 
                key={`${item._id}-${index}`} 
                id={item._id} 
                {...item} 
                image={item.image} 
              />
            ))}
          </div>

          <div ref={lastElementRef} className='h-60 flex flex-col items-center justify-center gap-4'>
            {loading && (
              <div className='flex flex-col items-center gap-2'>
                <RefreshCw size={24} className='animate-spin text-[#BC002D]' />
                <p className='text-[8px] font-black uppercase tracking-widest text-gray-400'>Syncing Registry...</p>
              </div>
            )}
            {!hasMore && products.length > 0 && (
              <p className='text-[9px] font-black uppercase tracking-[0.5em] text-gray-300'>Archive Fully Synchronized</p>
            )}
          </div>

          {!loading && products.length === 0 && (
            <div className='py-40 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200'>
               <h3 className='text-2xl font-black text-gray-900 uppercase tracking-tighter'>Specimen Not Found</h3>
               <button onClick={() => setCategory([])} className='mt-6 bg-black text-white px-12 py-5 text-[10px] font-black uppercase tracking-[0.5em] rounded-full'>Clear Index</button>
            </div>
          )}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f3f4f6; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #BC002D; }
        .animate-fade-in { animation: fadeIn 0.8s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-down { animation: slideDown 0.4s ease-out forwards; }
      `}} />
    </div>
  )
}

export default Collection;