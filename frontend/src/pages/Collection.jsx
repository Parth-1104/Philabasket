import React, { useContext, useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from '../components/ProductItem';
import { Filter, X, ArrowUpDown, Search as SearchIcon, RefreshCw, ShoppingCart, Zap, FolderTree, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const Collection = () => {
  const { search, showSearch, backendUrl, addToCart } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // URL PARAMS
  const groupParam = searchParams.get('group');
  const categoryParam = searchParams.get('category');

  const [products, setProducts] = useState([]); 
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [totalFound, setTotalFound] = useState(0); 

  const [showFilter, setShowFilter] = useState(false); 
  const [category, setCategory] = useState([]);
  const [activeGroup, setActiveGroup] = useState("");
  const [sortType, setSortType] = useState('relevant');
  const [filterSearch, setFilterSearch] = useState("");
  const [dbCategories, setDbCategories] = useState([]);

  const observer = useRef();

  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1);
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // FETCH & GROUP CATEGORIES
  const fetchCategories = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/category/list');
      if (response.data.success) {
        setDbCategories(response.data.categories);
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => { if(backendUrl) fetchCategories(); }, [backendUrl]);

  // 1. Add this state at the top of your component for the accordion
const [openGroups, setOpenGroups] = useState({});

// 2. Add a toggle function
const toggleGroupAccordion = (groupName) => {
    setOpenGroups(prev => ({
        ...prev,
        [groupName]: !prev[groupName]
    }));
};

// 3. Update your useMemo to handle data accurately
const { grouped, independent } = useMemo(() => {
    const groupedResult = {};
    const independentResult = [];

    dbCategories.forEach(cat => {
        // Strict check for grouping
        if (!cat.group || ['General', 'Independent', 'none', ''].includes(cat.group.trim())) {
            independentResult.push(cat.name);
        } else {
            const groupName = cat.group.trim();
            if (!groupedResult[groupName]) groupedResult[groupName] = [];
            groupedResult[groupName].push(cat.name);
        }
    });

    return { grouped: groupedResult, independent: independentResult };
}, [dbCategories]);
  // SYNC URL PARAMS TO STATE
  useEffect(() => {
    if (categoryParam) setCategory(categoryParam.split(','));
    if (groupParam) setActiveGroup(groupParam);
  }, [categoryParam, groupParam]);

  const fetchFromRegistry = async (currentPage, isNewQuery = false) => {
    if (!backendUrl) return;
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        params: {
          page: currentPage,
          limit: 20,
          category: category.join(','),
          group: activeGroup, // NEW: Sending Group Filter to Backend
          sort: sortType,
          search: showSearch ? search : ''
        }
      });

      if (response.data.success) {
        let newItems = response.data.products;
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

  useEffect(() => { if (page > 1) fetchFromRegistry(page); }, [page]);

  useEffect(() => {
    setPage(1);
    fetchFromRegistry(1, true);
  }, [category, activeGroup, sortType, search, showSearch, backendUrl]);

  const toggleCategory = (val) => {
    setCategory(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]);
    setActiveGroup(""); // Clear group filter if specific category is picked
  }

  const selectGroup = (groupName) => {
    setActiveGroup(groupName);
    setCategory([]); // Clear individual categories when a broad group is selected
    setShowFilter(false);
  }

  return (
    <div className='bg-white min-h-screen pt-4 pb-20 px-6 md:px-16 lg:px-24 select-none animate-fade-in'>
      
      {/* HEADER SECTION REMAINS SAME */}

      <div className='flex flex-col lg:flex-row gap-12 relative z-20'>

      <aside className={`fixed inset-0 z-[3000] lg:relative lg:z-0 lg:inset-auto lg:w-60 lg:block lg:sticky lg:top-10 lg:self-start transition-all duration-700 ${showFilter ? 'opacity-100' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'}`}>
  {/* Mobile Backdrop */}
  <div onClick={() => setShowFilter(false)} className='absolute inset-0 bg-black/80 backdrop-blur-sm lg:hidden'></div>
  
  <div className={`
    /* MOBILE: Full height and scrollable */
    absolute top-0 right-0 h-full w-[85%] overflow-y-auto bg-[#BC002D] p-8 flex flex-col 
    /* DESKTOP: Natural height, no internal scroll, rounded corners */
    lg:relative lg:w-full lg:h-auto lg:overflow-visible lg:p-8 lg:translate-x-0 lg:rounded-3xl lg:shadow-2xl 
    transition-transform duration-500 ${showFilter ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
  `}>
    
    <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
        <h3 className='text-white font-black text-[10px] tracking-[0.3em] uppercase'>Registry Index</h3>
        {/* Mobile Close Button */}
        <X onClick={() => setShowFilter(false)} className="lg:hidden text-white/60 cursor-pointer" size={20} />
    </div>
    
    <div className='flex flex-col'>
      {/* 1. PARENT GROUPS */}
      <div className="space-y-4 mb-10">
        {Object.keys(grouped).sort().map(groupName => (
          <div key={groupName} className="flex flex-col">
            <div 
                className='flex items-center justify-between cursor-pointer py-1' 
                onClick={() => toggleGroupAccordion(groupName)}
            >
                <div className='flex items-center gap-3'>
                    <FolderTree size={14} className={activeGroup === groupName ? 'text-white' : 'text-white/40'} />
                    <button 
                        onClick={(e) => { e.stopPropagation(); selectGroup(groupName); }}
                        className={`text-[10px] font-black uppercase tracking-widest text-left transition-all ${activeGroup === groupName ? 'text-white' : 'text-white/60 hover:text-white'}`}
                    >
                        {groupName}
                    </button>
                </div>
                <ChevronRight 
                    size={12} 
                    className={`text-white/40 transition-transform duration-300 ${openGroups[groupName] ? 'rotate-90' : ''}`} 
                />
            </div>

            <div className={`flex flex-col gap-2 ml-6 border-l border-white/10 pl-4 overflow-hidden transition-all duration-500 ${openGroups[groupName] ? 'max-h-[2000px] mt-3 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
              {grouped[groupName].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => toggleCategory(cat)}
                  className={`text-left py-1 text-[9px] font-bold uppercase tracking-widest transition-all ${category.includes(cat) ? 'text-white translate-x-1' : 'text-white/40 hover:text-white hover:translate-x-1'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 2. INDEPENDENT CATEGORIES */}
      {independent.length > 0 && (
        <div className="pt-8 border-t border-white/20">
            <p className='text-[8px] text-white/20 font-black uppercase tracking-widest mb-6 ml-1'>General Archive</p>
            <div className='flex flex-col gap-2'>
                {independent.sort().map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => toggleCategory(cat)}
                        className={`text-left py-2.5 px-4 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${category.includes(cat) ? 'bg-white text-[#BC002D]' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      )}
    </div>

    <button 
        onClick={() => {setCategory([]); setActiveGroup("");}} 
        className="mt-10 mb-8 lg:mb-0 pt-6 border-t border-white/10 text-[10px] font-black text-white/40 hover:text-white uppercase tracking-[0.3em] transition-all"
    >
        Reset Filters
    </button>
  </div>
</aside>

        {/* --- MAIN DISPLAY REMAINS SAME --- */}
      {/* </div>
    </div>
  )
} */}

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

          {/* --- GRID MODIFIED TO INCLUDE BUTTONS --- */}
          <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-16'>
            {products.map((item, index) => (
              <div 
                key={`${item._id}-${index}`} 
                className="flex flex-col group bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-br-[40px] lg:rounded-br-[60px] overflow-hidden h-full"
              >
                <div className="flex-grow">
                  <ProductItem 
                    id={item._id} 
                    _id={item._id}
                    {...item} 
                    image={item.image} 
                  />
                </div>

                <div className="flex flex-col gap-2 p-3 lg:p-4 mt-auto border-t border-gray-50 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button 
                      onClick={(e) => handleAddToCart(e, item._id)}
                      className="w-full bg-gray-50 text-gray-900 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all duration-300"
                    >
                      <ShoppingCart size={12} />
                      <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest">Add</span>
                    </button>
                    
                    <button 
                      onClick={(e) => handleBuyNow(e, item._id)}
                      className="w-full bg-black text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#BC002D] transition-all duration-300 shadow-lg shadow-black/5"
                    >
                      <Zap size={12} className="fill-amber-400 text-amber-400" />
                      <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest">Buy Now</span>
                    </button>
                  </div>
                </div>
              </div>
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