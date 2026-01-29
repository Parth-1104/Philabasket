import React, { useContext, useEffect, useState, useMemo } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import ProductItem from '../components/ProductItem';
import { useSearchParams } from 'react-router-dom';

const ALL_CATEGORIES = [
  "AgriCulture Stamp", "Airmail", "Americas", "Ancillaries", "Animal & WildLife", 
  "Army", "Army Postal Cover APC", "Asia", "Autograph Cover", "Aviation Stamps", 
  "Bank", "Bird Stamps", "Block of Four", "Block of Four with Traffic light", 
  "Booklet", "BOPP", "Bridge Stamps", "Brochure Blank", "Brochure with MS", 
  "Brochure with stamp", "Buddha / Buddhism", "Building Stamps", "Butterfly & Insects", 
  "Carried Cover", "Cars", "Catalogue", "Children's Day Series", "Christianity", 
  "Christmas", "Cinema on Stamps", "Classic Items", "Coffee", "Color Cancellation", 
  "Commemorative", "Commemorative Coin", "Commemorative Year", "Country", "Covid 19", 
  "Cricket", "Cultural Theme", "Currency Stamps", "Dance Stamps", "Definitive", 
  "Definitive Block", "Definitive Number Strip", "Definitive Sheet", "Definitive Stamp", 
  "Educational Institute", "Environment", "Error", "Europe", "Exhibition Special", 
  "Face Value", "Fauna and Flora", "Festival", "First Day Cover", "First Day Cover Blank", 
  "First Day Cover Commercial Used", "First Day Cover with Miniature Sheet", 
  "First Flight/ AirMail", "Flag", "Food on Stamps", "FootBall", "Foreign First Day Covers", 
  "Foreign Miniature Sheets", "Foreign Stamps", "Fort / Castle/ Palace", "Fragrance Stamps", 
  "Freedom", "Freedom Fighter", "Full Sheet", "Gandhi Stamps", "GI Tag", "Greeting Card", 
  "Greetings", "Hinduism", "Historical", "Historical Place", "Indian Theme", "Jainism", 
  "Joint Issue", "Judiciary System", "Kumbh", "Light House", "Literature", 
  "Locomotive / Trains", "Marine / Fish", "Medical / Health", "Meghdoot", 
  "Miniature Sheets", "Musical Instrument", "My Stamp", "News Paper", 
  "Odd Shape / Unusual", "Olympic", "Organizations", "Personality", 
  "Place Cancellation", "Post Office", "Postal Stationery", "Postcard / Maxim Card", 
  "PPC", "Presentation Pack", "Ramayana", "Rare", "Red Cross", "River / Canal", 
  "RSS Rashtriya Swayamsevak Sangh", "Scout", "SheetLet", "Ships", "Sikhism", 
  "Single Stamp", "Single Stamp with Traffic light", "Social Message", "Space", 
  "Special Cancellation", "Special Cover", "Sports Stamps", "Stamp on Stamp", 
  "Technology", "Temple", "Tiger", "Transport", "United Nations UN", "Women Power", 
  "WWF", "Year", "Year Pack", "Yoga"
];

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false); 
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');
  const [filterSearch, setFilterSearch] = useState("");
  
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
      productsCopy = productsCopy.filter(item => item.category && item.category.some(cat => category.includes(cat)));
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

  const filteredCategoryList = useMemo(() => {
    return ALL_CATEGORIES.filter(cat => cat.toLowerCase().includes(filterSearch.toLowerCase()));
  }, [filterSearch]);

  return (
    <div className='bg-white min-h-screen pt-24 pb-20 px-6 md:px-16 lg:px-24 select-none animate-fade-in'>
      
      {/* --- RESTRUCTURED HEADER: Mobile Responsive Two-Row --- */}
      <div className='flex flex-col mb-12 border-b border-black/5 pb-8 gap-8'>
        <div className='flex justify-between items-end w-full'>
            <div className='max-w-xl'>
                <div className='flex items-center gap-3 mb-2'>
                    <span className='h-[1px] w-8 bg-[#BC002D]'></span>
                    <p className='text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-bold'>The Archives</p>
                </div>
                <h2 className='text-4xl md:text-7xl font-serif text-black tracking-tighter leading-none'>
                    Masterpiece <span className='italic font-light text-black/20'>Registry.</span>
                </h2>
            </div>
            <p className='hidden md:block text-[10px] tracking-[0.3em] text-black/30 font-bold uppercase'>
                {filterProducts.length} Specimens Located
            </p>
        </div>
        
        {/* Row 2: Actions Bar */}
        <div className='flex flex-wrap items-center justify-between gap-4'>
            <button 
                onClick={() => setShowFilter(true)}
                className='lg:hidden flex-1 flex items-center justify-center gap-3 px-6 py-4 border border-black/10 text-black text-[10px] font-bold tracking-[0.3em] uppercase rounded-sm active:bg-black active:text-white transition-all'
            >
                <img src={assets.menu_icon} className='w-3 brightness-0 opacity-40' alt="" />
                Categories
            </button>
            
            <div className='relative flex-1 lg:flex-none min-w-[160px]'>
                <select 
                    onChange={(e)=>setSortType(e.target.value)} 
                    className='appearance-none w-full bg-transparent border border-black/10 text-black text-[10px] font-bold tracking-[0.2em] uppercase px-6 py-4 pr-12 outline-none cursor-pointer focus:border-[#BC002D]'
                >
                    <option value="relevant">SORT: RELEVANT</option>
                    <option value="low-high">VALUATION: LOW TO HIGH</option>
                    <option value="high-low">VALUATION: HIGH TO LOW</option>
                </select>
                <div className='absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none'>
                    <img src={assets.dropdown_icon} className='w-2.5 opacity-30 brightness-0' alt="" />
                </div>
            </div>
        </div>
      </div>

      <div className='flex flex-col lg:flex-row gap-16 relative'>
        
        {/* --- SIDEBAR: Catalogue Index --- */}
        <aside className={`
            fixed inset-0 z-[2000] lg:relative lg:z-0 lg:inset-auto
            lg:w-72 lg:block lg:sticky lg:top-32 lg:h-[calc(100vh-160px)]
            transition-all duration-700 ease-in-out
            ${showFilter ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'}
        `}>
          {/* Backdrop Blur for Mobile */}
          <div onClick={() => setShowFilter(false)} className='absolute inset-0 bg-black/40 backdrop-blur-sm lg:hidden'></div>

          <div className={`
            absolute top-0 right-0 h-full w-[85%] bg-white p-10 flex flex-col transition-transform duration-500
            lg:relative lg:w-full lg:p-0 lg:translate-x-0 lg:bg-transparent
            ${showFilter ? 'translate-x-0 shadow-[-30px_0_60px_rgba(0,0,0,0.1)]' : 'translate-x-full lg:translate-x-0'}
          `}>
            
            <div className='flex justify-between items-center mb-10'>
              <h3 className='text-black font-serif text-xl tracking-tight uppercase'>Index</h3>
              <button onClick={() => setShowFilter(false)} className='lg:hidden text-black text-2xl font-light'>✕</button>
            </div>

            <div className='relative mb-10 group'>
                <input 
                  type="text" 
                  placeholder="Filter Classifications..." 
                  className='w-full bg-transparent border-b border-black/10 text-black text-xs py-4 outline-none focus:border-[#BC002D] transition-all placeholder:text-gray-300 font-light'
                  onChange={(e) => setFilterSearch(e.target.value)}
                />
                <div className='absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#BC002D] group-focus-within:w-full transition-all duration-500'></div>
            </div>

            <div className='flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-6'>
              {filteredCategoryList.map((item) => (
                <div 
                  key={item} 
                  onClick={() => toggleCategory(item)}
                  className={`group flex items-center justify-between cursor-pointer transition-all duration-300`}
                >
                  <span className={`text-[10px] tracking-[0.3em] uppercase transition-colors duration-500 ${category.includes(item) ? 'text-[#BC002D] font-black' : 'text-gray-400 group-hover:text-black font-medium'}`}>
                      {item}
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${category.includes(item) ? 'bg-[#BC002D] scale-125' : 'bg-transparent border border-black/10 group-hover:border-[#BC002D]'}`}></div>
                </div>
              ))}
            </div>

            <button 
                onClick={() => setShowFilter(false)}
                className='lg:hidden mt-10 w-full bg-black text-white py-5 text-[11px] font-black tracking-[0.5em] uppercase shadow-2xl active:scale-95'
            >
                Reveal {filterProducts.length} Results
            </button>
          </div>
        </aside>

        {/* --- MAIN DISPLAY --- */}
        <main className='flex-1'>
          
          {/* Active Filtering Chips (Scrollable on Mobile) */}
          {category.length > 0 && (
            <div className='flex overflow-x-auto pb-4 mb-10 gap-3 no-scrollbar scroll-smooth'>
              <p className='flex-shrink-0 text-[9px] font-black tracking-[0.4em] text-black/20 uppercase py-2 mr-2'>Active Selections:</p>
              {category.map(cat => (
                <div key={cat} className='flex-shrink-0 flex items-center gap-3 border border-black/10 bg-[#F9F9F9] text-black px-5 py-2 rounded-sm text-[9px] font-black tracking-widest uppercase'>
                  {cat}
                  <span onClick={() => toggleCategory(cat)} className='cursor-pointer text-gray-300 hover:text-[#BC002D] transition-colors'>✕</span>
                </div>
              ))}
              <button onClick={() => setCategory([])} className='flex-shrink-0 text-[9px] font-black tracking-[0.4em] uppercase text-[#BC002D] hover:underline underline-offset-8 px-4'>Reset Archives</button>
            </div>
          )}

          {/* Grid: 2 columns on mobile, 4 on desktop */}
          <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-12 md:gap-y-24'>
            {filterProducts.map((item, index) => (
              <ProductItem 
                key={item._id || index} 
                name={item.name} 
                id={item._id} 
                price={item.price} 
                image={item.image} 
                category={item.category && item.category[0]} 
              />
            ))}
          </div>

          {filterProducts.length === 0 && (
            <div className='flex flex-col items-center justify-center py-48 text-center'>
                <div className='w-20 h-20 border border-black/5 flex items-center justify-center rounded-full mb-8 opacity-20'>
                    <img src={assets.search_icon} className='w-6 brightness-0' alt="" />
                </div>
                <h3 className='font-serif text-2xl text-black mb-4'>Specimen Not Found</h3>
                <p className='text-gray-400 text-xs tracking-widest uppercase mb-10'>The archive contains no records matching this criteria.</p>
                <button onClick={() => setCategory([])} className='bg-black text-white px-12 py-4 text-[10px] font-black tracking-[0.5em] uppercase hover:bg-[#BC002D] transition-all'>Reset Archives</button>
            </div>
          )}
        </main>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 1.5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #0000001a; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #BC002D; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-fade-in { animation: fadeIn 1s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  )
}

export default Collection;