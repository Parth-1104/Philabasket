import React, { useContext, useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from '../components/ProductItem';
import { Filter, X, ArrowUpDown, RefreshCw, ShoppingCart, Zap, FolderTree, ChevronRight, LayoutGrid } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const Collection = () => {
  const { search, showSearch, backendUrl, addToCart } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
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
  const [dbCategories, setDbCategories] = useState([]);
  const [openGroups, setOpenGroups] = useState({});

  const observer = useRef();

  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1);
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/category/list');
      if (response.data.success) {
        setDbCategories(response.data.categories);
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => { if(backendUrl) fetchCategories(); }, [backendUrl]);

  const toggleGroupAccordion = (groupName) => {
    setOpenGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const { grouped, independent } = useMemo(() => {
    const groupedResult = {};
    const independentResult = [];
    dbCategories.forEach(cat => {
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

  useEffect(() => {
    if (categoryParam) setCategory(categoryParam.split(','));
    if (groupParam) setActiveGroup(groupParam);
  }, [categoryParam, groupParam]);

  const fetchFromRegistry = async (currentPage, isNewQuery = false, currentCategory = category, currentGroup = activeGroup) => {
    if (!backendUrl) return;
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        params: {
          page: currentPage,
          limit: 20,
          category: currentCategory.join(','), // Use passed value
          group: currentGroup,                 // Use passed value
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
    const newCategories = category.includes(val) 
        ? category.filter(i => i !== val) 
        : [...category, val];
    
    setCategory(newCategories);
    setActiveGroup(""); // Reset group
    setPage(1);
    
    // Call fetch immediately with the new category array
    fetchFromRegistry(1, true, newCategories, "");
}

const selectGroup = (groupName) => {
    setActiveGroup(groupName);
    setCategory([]); 
    setShowFilter(false);
    setPage(1);
    
    // Call fetch immediately with the new group name
    fetchFromRegistry(1, true, [], groupName);
}
  const handleAddToCart = (e, id) => {
    e.stopPropagation();
    addToCart(id, 1);
    toast.success("Added to Registry");
  };

  const handleBuyNow = async (e, id) => {
    e.stopPropagation();
    await addToCart(id, 1);
    navigate('/cart');
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortType(newSort);
    setPage(1);
    fetchFromRegistry(1, true, category, activeGroup);
};

  return (
    <div className='bg-white min-h-screen pt-4 pb-20 px-6 md:px-16 lg:px-24 select-none animate-fade-in'>
      
      {/* --- TOP BANNER / TITLE --- */}
      <div className='mb-12'>
        <div className='flex items-center gap-4 mb-4'>
            <span className='h-[1px] w-12 bg-[#BC002D]'></span>
            <p className='text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-black'>Certified Archive</p>
        </div>
        <h2 className='text-4xl md:text-6xl font-bold text-gray-900 tracking-tighter uppercase'>
          Global <span className='text-[#BC002D]'>Collection.</span>
        </h2>
      </div>

      <div className='flex flex-col lg:flex-row gap-12 relative z-20'>

        {/* --- SIDEBAR --- */}
        <aside className={`fixed inset-0 z-[3000] lg:relative lg:z-0 lg:inset-auto lg:w-64 lg:block lg:sticky lg:top-10 lg:self-start transition-all duration-700 ${showFilter ? 'opacity-100' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'}`}>
          <div onClick={() => setShowFilter(false)} className='absolute inset-0 bg-black/80 backdrop-blur-sm lg:hidden'></div>
          
          <div className='absolute top-0 right-0 h-full w-[85%] overflow-y-auto bg-[#BC002D] p-8 flex flex-col lg:relative lg:w-full lg:h-auto lg:overflow-visible lg:p-10 lg:translate-x-0 lg:rounded-[40px] lg:shadow-2xl transition-transform duration-500'>
            
            <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
                <h3 className='text-white font-black text-[10px] tracking-[0.3em] uppercase'>Registry Index</h3>
                <X onClick={() => setShowFilter(false)} className="lg:hidden text-white/60 cursor-pointer" size={20} />
            </div>
            
            <div className='flex flex-col gap-8'>
              <div className="space-y-4">
                {Object.keys(grouped).sort().map(groupName => (
                  <div key={groupName} className="flex flex-col">
                    <div className='flex items-center justify-between cursor-pointer py-1' onClick={() => toggleGroupAccordion(groupName)}>
                        <div className='flex items-center gap-3'>
                            <FolderTree size={14} className={activeGroup === groupName ? 'text-white' : 'text-white/40'} />
                            <button onClick={(e) => { e.stopPropagation(); selectGroup(groupName); }} className={`text-[10px] font-black uppercase tracking-widest text-left transition-all ${activeGroup === groupName ? 'text-white' : 'text-white/60 hover:text-white'}`}>
                                {groupName}
                            </button>
                        </div>
                        <ChevronRight size={12} className={`text-white/40 transition-transform duration-300 ${openGroups[groupName] ? 'rotate-90' : ''}`} />
                    </div>

                    <div className={`flex flex-col gap-2 ml-6 border-l border-white/10 pl-4 overflow-hidden transition-all duration-500 ${openGroups[groupName] ? 'max-h-[2000px] mt-3 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                      {grouped[groupName].map(cat => (
                        <button key={cat} onClick={() => toggleCategory(cat)} className={`text-left py-1 text-[9px] font-bold uppercase tracking-widest transition-all ${category.includes(cat) ? 'text-white translate-x-1' : 'text-white/40 hover:text-white hover:translate-x-1'}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {independent.length > 0 && (
                <div className="pt-8 border-t border-white/20">
                    <p className='text-[8px] text-white/20 font-black uppercase tracking-widest mb-6 ml-1'>General Archive</p>
                    <div className='flex flex-col gap-2'>
                        {independent.sort().map(cat => (
                            <button key={cat} onClick={() => toggleCategory(cat)} className={`text-left py-2.5 px-4 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${category.includes(cat) ? 'bg-white text-[#BC002D]' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
              )}
            </div>

            <button onClick={() => {setCategory([]); setActiveGroup("");}} className="mt-12 pt-6 border-t border-white/10 text-[10px] font-black text-white/40 hover:text-white uppercase tracking-[0.3em] transition-all">
                Reset Filters
            </button>
          </div>
        </aside>

        {/* --- MAIN DISPLAY --- */}
        <main className='flex-1'>
          
          {/* MOBILE TOGGLES */}
          <div className='lg:hidden flex gap-4 mb-8'>
            <button onClick={() => setShowFilter(true)} className='flex-1 bg-black text-white p-5 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest'>
               <Filter size={14} /> Index
            </button>
            <div className='flex-1 bg-gray-100 p-5 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-900 relative'>
               <ArrowUpDown size={14} />
               <select 
    value={sortType}
    onChange={handleSortChange} className='absolute inset-0 opacity-0 cursor-pointer'>
                  <option value="relevant">Relevance</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="year-new">Year: Recent First</option>
                        <option value="year-old">Year: Oldest First</option>
                        <option value="name-asc">Alphabetical: A-Z</option>
               </select>
               Sort
            </div>
          </div>

          {/* DESKTOP FILTER BAR */}
          <div className='hidden lg:flex items-center justify-between mb-12 pb-6 border-b border-gray-100'>
            <div className='flex items-center gap-6'>
                <div className='flex items-center gap-2'>
                  <LayoutGrid size={14} className='text-gray-400' />
                  <p className='text-[10px] font-black uppercase tracking-[0.4em] text-gray-400'>
                      Registry: <span className='text-black'>{totalFound}</span> Specimens
                  </p>
                </div>
                {category.length > 0 && (
                  <div className='flex items-center gap-2'>
                    {category.slice(0, 2).map(cat => (
                      <span key={cat} className='text-[8px] bg-gray-100 px-3 py-1 rounded-full font-black uppercase text-gray-500'>{cat}</span>
                    ))}
                    {category.length > 2 && <span className='text-[8px] font-black text-gray-300'>+{category.length - 2} More</span>}
                  </div>
                )}
            </div>

            <div className='flex items-center gap-8'>
                <div className='flex items-center gap-3 group'>
                    <ArrowUpDown size={14} className='text-[#BC002D] group-hover:rotate-180 transition-transform duration-500' />
                    <select 
                        value={sortType}
                        onChange={(e) => setSortType(e.target.value)}
                        className='text-[10px] font-black uppercase tracking-[0.2em] text-gray-700 outline-none bg-transparent cursor-pointer hover:text-[#BC002D] transition-colors'
                    >
                        <option value="relevant">Relevance</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="year-new">Year: Recent First</option>
                        <option value="year-old">Year: Oldest First</option>
                        <option value="name-asc">Alphabetical: A-Z</option>
                    </select>
                </div>
            </div>
          </div>

          {/* ACTIVE TAGS */}
          {category.length > 0 && (
            <div className='flex flex-wrap gap-3 mb-12'>
              {category.map(cat => (
                <div key={cat} className='flex items-center gap-3 bg-black text-white px-5 py-2.5 rounded-full text-[9px] font-black tracking-widest uppercase animate-slide-down'>
                  {cat}
                  <X size={12} onClick={() => toggleCategory(cat)} className='cursor-pointer text-[#BC002D] hover:rotate-90 transition-transform' />
                </div>
              ))}
              <button onClick={() => setCategory([])} className='text-[9px] font-black tracking-widest uppercase text-[#BC002D] border-b-2 border-[#BC002D]/20 hover:border-[#BC002D] transition-all ml-2'>Clear All</button>
            </div>
          )}

          {/* GRID */}
          <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-16'>
            {products.map((item, index) => (
              <div 
                key={`${item._id}-${index}`} 
                className="flex flex-col group bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-br-[40px] lg:rounded-br-[60px] overflow-hidden h-full"
              >
                <div className="flex-grow">
                  <ProductItem id={item._id} _id={item._id} {...item} image={item.image} />
                </div>

                <div className="flex flex-col gap-2 p-3 lg:p-5 mt-auto border-t border-gray-50 bg-white group-hover:bg-gray-50/50 transition-colors">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button onClick={(e) => handleAddToCart(e, item._id)} className="w-full bg-gray-100 text-gray-900 py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all duration-300">
                      <ShoppingCart size={13} />
                      <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest">Add</span>
                    </button>
                    <button onClick={(e) => handleBuyNow(e, item._id)} className="w-full bg-black text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#BC002D] transition-all duration-300 shadow-lg shadow-black/5">
                      <Zap size={13} className="fill-amber-400 text-amber-400" />
                      <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest">Buy Now</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* LOADER */}
          <div ref={lastElementRef} className='py-32 flex flex-col items-center justify-center gap-4'>
            {loading && (
              <div className='flex flex-col items-center gap-3'>
                <RefreshCw size={28} className='animate-spin text-[#BC002D]' />
                <p className='text-[9px] font-black uppercase tracking-[0.3em] text-gray-400'>Updating Registry...</p>
              </div>
            )}
            {!hasMore && products.length > 0 && (
              <div className='flex flex-col items-center gap-4'>
                <div className='h-[1px] w-20 bg-gray-100'></div>
                <p className='text-[9px] font-black uppercase tracking-[0.5em] text-gray-300'>End of Archive</p>
              </div>
            )}
          </div>

          {!loading && products.length === 0 && (
            <div className='py-40 text-center bg-gray-50 rounded-[60px] border border-dashed border-gray-200 animate-fade-in'>
               <h3 className='text-3xl font-bold text-gray-900 uppercase tracking-tighter mb-2'>Specimen Not Found</h3>
               <p className='text-[10px] text-gray-400 uppercase tracking-widest mb-8'>Try adjusting your filters or checking a different era.</p>
               <button onClick={() => {setCategory([]); setActiveGroup("");}} className='bg-[#BC002D] text-white px-12 py-5 text-[10px] font-black uppercase tracking-[0.5em] rounded-full hover:bg-black transition-colors'>Reset Index</button>
            </div>
          )}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f3f4f6; border-radius: 10px; }
        .animate-fade-in { animation: fadeIn 0.8s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-down { animation: slideDown 0.4s ease-out forwards; }
      `}} />
    </div>
  )
}

export default Collection;