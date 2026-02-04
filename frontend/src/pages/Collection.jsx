import React, { useContext, useEffect, useState, useMemo } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import ProductItem from '../components/ProductItem';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ArrowUpDown, Search as SearchIcon } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Collection = () => {
  const { products, search, showSearch, backendUrl } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false); 
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');
  const [filterSearch, setFilterSearch] = useState("");
  const [ALL_CATEGORIES, setCategoryOptions] = useState([]);

  // FETCH CATEGORIES - Optimized with sorting
  const fetchCategories = async () => {
    if (!backendUrl) return;
    try {
        const response = await axios.get(backendUrl + '/api/category/list');
        if (response.data.success) {
            // Sort alphabetically once at source for speed
            const names = response.data.categories.map(cat => cat.name).sort();
            setCategoryOptions(names);
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [backendUrl]); // Re-run once backendUrl is available

  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  useEffect(() => {
    if (categoryFromUrl) {
      setCategory([decodeURIComponent(categoryFromUrl)]);
    }
  }, [categoryFromUrl]);

  const toggleCategory = (val) => {
    setCategory(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]);
  }

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => 
        item.category && item.category.some(cat => category.includes(cat))
      );
    }

    if (sortType === 'low-high') {
      productsCopy.sort((a, b) => a.price - b.price);
    } else if (sortType === 'high-low') {
      productsCopy.sort((a, b) => b.price - a.price);
    }

    setFilterProducts(productsCopy);
  }

  useEffect(() => {
    applyFilter();
  }, [category, search, showSearch, products, sortType]);

  // OPTIMIZED MEMO: Now watches ALL_CATEGORIES for instant updates
  const filteredCategoryList = useMemo(() => {
    return ALL_CATEGORIES.filter(cat => 
      cat.toLowerCase().includes(filterSearch.toLowerCase())
    );
  }, [filterSearch, ALL_CATEGORIES]);

  return (
    <div className='bg-white min-h-screen pt-24 pb-20 px-6 md:px-16 lg:px-24 select-none relative animate-fade-in'>
      
      {/* --- DECORATIVE BACKGROUND ARC --- */}
      <div className="absolute -right-[10vw] top-0 h-[60vh] w-[40vw] bg-[#BC002D]/5 rounded-bl-[600px] pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className='relative z-10 flex flex-col md:flex-row justify-between items-end mb-16 gap-8 lg:pt-[-5vh]'>
          <div className='max-w-2xl'>
              <div className='flex items-center gap-4 md:mt-[-5vh] mb-4'>
                  <span className='h-[1.5px] md:mt-[-9vh] w-12 bg-[#BC002D]'></span>
                  <p className='text-[10px] tracking-[0.6em] md:mt-[-9vh] text-[#BC002D] uppercase font-black'>Registry Database</p>
              </div>
              <h2 className='text-6xl md:text-5xl font-bold text-gray-900 md:mt-[-5vh] tracking-tighter leading-none'>
                  THE <span className='text-[#BC002D]'>GALLERY.</span>
              </h2>
              <p className='mt-6 text-gray-400 text-xs font-bold uppercase tracking-[0.2em] leading-relaxed'>
                  <span className='text-black'>{filterProducts.length} certified specimens found</span> 
              </p>
          </div>

          {/* Desktop Sort */}
          <div className='hidden lg:flex items-center gap-4 bg-gray-50 p-2 rounded-full border border-gray-100'>
              <div className='pl-4 text-[9px] font-black uppercase tracking-widest text-gray-400'>Order By:</div>
              <select 
                  onChange={(e)=>setSortType(e.target.value)} 
                  className='bg-white border-none text-[10px] font-black tracking-widest uppercase px-6 py-3 rounded-full outline-none cursor-pointer focus:ring-2 focus:ring-[#BC002D]/20 transition-all'
              >
                  <option value="relevant">Relevance</option>
                  <option value="low-high">Value: Low-High</option>
                  <option value="high-low">Value: High-Low</option>
              </select>
          </div>
      </div>

      <div className='flex flex-col lg:flex-row gap-12 relative z-10'>
        
        {/* --- SIDEBAR --- */}
        <aside className={`
            fixed inset-0 z-[2000] lg:relative lg:z-0 lg:inset-auto
            lg:w-80 lg:block lg:sticky lg:top-32 lg:h-fit
            transition-all duration-700
            ${showFilter ? 'opacity-100' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'}
        `}>
          <div onClick={() => setShowFilter(false)} className='absolute inset-0 bg-black/80 backdrop-blur-sm lg:hidden'></div>

          <div className={`
            absolute top-0 right-0 h-full w-[85%] bg-[#BC002D] p-10 flex flex-col transition-transform duration-500
            lg:relative lg:w-full lg:p-8 lg:translate-x-0 lg:bg-[#BC002D] lg:rounded-br-[80px] lg:shadow-[0_20px_50px_rgba(188,0,45,0.3)]
            ${showFilter ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}>
            <div className='flex justify-between items-center mb-8 shrink-0'>
              <div className='flex flex-col'>
                <h3 className='text-white font-black text-xs tracking-[0.3em] uppercase'>Registry Index</h3>
                <div className='h-[2px] w-8 bg-white/30 mt-2'></div>
              </div>
              <button onClick={() => setShowFilter(false)} className='lg:hidden text-white/60 hover:text-white'><X size={24}/></button>
            </div>

            <div className='relative mb-8 shrink-0'>
                <SearchIcon size={14} className='absolute left-5 top-1/2 -translate-y-1/2 text-white/50' />
                <input 
                  type="text" 
                  placeholder="SEARCH CATEGORIES..." 
                  className='w-full bg-black/20 border border-white/10 rounded-full px-12 py-4 text-[10px] font-black tracking-widest text-white outline-none focus:border-white/40 focus:bg-black/40 transition-all placeholder:text-white/30'
                  onChange={(e) => setFilterSearch(e.target.value)}
                />
            </div>

            <div className='flex-1 overflow-y-auto lg:overflow-visible pr-2 lg:pr-0 custom-scrollbar'>
              <div className='flex flex-col space-y-3 pb-10 lg:pb-0'>
                {filteredCategoryList.map((item) => (
                  <button 
                    key={item} 
                    onClick={() => toggleCategory(item)}
                    className={`w-full group flex items-center justify-between p-4 rounded-xl transition-all duration-500 border ${
                      category.includes(item) 
                      ? 'bg-white border-white shadow-xl shadow-black/10' 
                      : 'bg-black/5 border-transparent hover:border-white/20 hover:bg-black/10'
                    }`}
                  >
                    <span className={`text-[9px] tracking-[0.2em] uppercase font-black transition-colors duration-300 ${
                      category.includes(item) ? 'text-[#BC002D]' : 'text-[#fff442] group-hover:text-white'
                    }`}>
                        {item}
                    </span>
                    {category.includes(item) ? (
                      <div className='w-1.5 h-1.5 bg-[#BC002D] rounded-full shadow-[0_0_8px_rgba(188,0,45,0.4)]'></div>
                    ) : (
                      <div className='w-1 h-1 bg-white/10 rounded-full group-hover:bg-white/40 transition-all'></div>
                    )}
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
                <div key={cat} className='flex items-center gap-3 bg-black text-white px-5 py-2.5 rounded-full text-[9px] font-black tracking-widest uppercase animate-in zoom-in duration-300'>
                  {cat}
                  <X size={12} onClick={() => toggleCategory(cat)} className='cursor-pointer text-[#BC002D] hover:text-white transition-colors' />
                </div>
              ))}
              <button onClick={() => setCategory([])} className='text-[9px] font-black tracking-widest uppercase text-[#BC002D] border-b-2 border-[#BC002D]/20 hover:border-[#BC002D] transition-all ml-2'>Reset All</button>
            </div>
          )}

          <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-16'>
            {filterProducts.map((item, index) => (
              <div key={item._id || index} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <ProductItem 
                  name={item.name} 
                  id={item._id} 
                  price={item.price} 
                  marketPrice={item.marketPrice}
                  image={item.image} 
                  category={item.category && item.category[0]} 
                />
              </div>
            ))}
          </div>

          {filterProducts.length === 0 && (
            <div className='flex flex-col items-center justify-center py-40 bg-gray-50 rounded-[40px] border border-dashed border-gray-200'>
                <div className='w-20 h-20 bg-white shadow-xl flex items-center justify-center rounded-full mb-8'>
                    <SearchIcon size={30} className='text-[#BC002D] opacity-20' />
                </div>
                <h3 className='text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter'>Specimen Not Found</h3>
                <button onClick={() => setCategory([])} className='bg-black text-white px-12 py-5 text-[10px] font-black uppercase tracking-[0.5em] rounded-full hover:bg-[#BC002D] transition-all shadow-xl'>Clear Index</button>
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
      `}} />
    </div>
  )
}

export default Collection;