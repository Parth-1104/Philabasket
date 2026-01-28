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
    <div className='bg-[#0a0a0a] min-h-screen pt-24 px-4 md:px-16 lg:px-24 select-none'>
      
      {/* --- TOP NAV BAR --- */}
      <div className='flex justify-between items-end mb-10 border-b border-[#B8860B]/20 pb-6'>
        <h2 className='text-3xl md:text-5xl font-serif text-white'>The <span className='italic text-[#B8860B]'>Archive</span></h2>
        
        <div className='flex items-center gap-3'>
            {/* Mobile Filter Trigger */}
            <button 
                onClick={() => setShowFilter(true)}
                className='lg:hidden flex items-center gap-2 px-4 py-2 border border-[#B8860B]/40 text-[#B8860B] text-[10px] tracking-widest uppercase rounded-sm'
            >
                Categories
            </button>
            
            <select onChange={(e)=>setSortType(e.target.value)} className='bg-transparent border border-white/10 text-white text-[10px] tracking-widest uppercase px-4 py-2 outline-none cursor-pointer'>
                <option className='bg-[#0a0a0a]' value="relevant">Sort</option>
                <option className='bg-[#0a0a0a]' value="low-high">Low-High</option>
                <option className='bg-[#0a0a0a]' value="high-low">High-Low</option>
            </select>
        </div>
      </div>

      <div className='flex flex-col lg:flex-row gap-12 relative'>
        
        {/* --- DUAL-MODE SIDEBAR (Sticky on Desktop, Drawer on Mobile) --- */}
        <aside className={`
            fixed inset-0 z-[1000] lg:relative lg:z-0 lg:inset-auto
            lg:w-80 lg:block lg:sticky lg:top-24 lg:h-[calc(100vh-120px)]
            transition-all duration-500 ease-in-out
            ${showFilter ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          {/* Overlay for Mobile */}
          <div onClick={() => setShowFilter(false)} className='absolute inset-0 bg-black/80 lg:hidden'></div>

          <div className='relative ml-auto w-[85%] h-full lg:w-full bg-[#111111] border-l lg:border border-[#B8860B]/20 p-8 lg:p-6 flex flex-col shadow-2xl lg:shadow-none'>
            
            {/* Sidebar Header */}
            <div className='flex justify-between items-center mb-8'>
              <h3 className='text-[#B8860B] text-[11px] tracking-[0.4em] uppercase font-bold'>Classifications</h3>
              <button onClick={() => setShowFilter(false)} className='lg:hidden text-white text-xl'>✕</button>
            </div>

            {/* Internal Search */}
            <input 
              type="text" 
              placeholder="Search Varieties..." 
              className='bg-transparent border-b border-[#B8860B]/20 text-white text-xs py-3 mb-6 outline-none focus:border-[#B8860B] placeholder:text-gray-700'
              onChange={(e) => setFilterSearch(e.target.value)}
            />

            {/* Scrollable List */}
            <div className='flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4'>
              {filteredCategoryList.map((item) => (
                <div 
                  key={item} 
                  onClick={() => toggleCategory(item)}
                  className={`group flex items-center gap-4 cursor-pointer transition-all duration-300 ${category.includes(item) ? 'text-[#B8860B]' : 'text-gray-500 hover:text-white'}`}
                >
                  <div className={`w-3 h-3 border rotate-45 transition-all duration-500 ${category.includes(item) ? 'bg-[#B8860B] border-[#B8860B]' : 'border-gray-800 group-hover:border-[#B8860B]/40'}`}></div>
                  <span className={`text-[11px] tracking-[0.2em] uppercase ${category.includes(item) ? 'font-bold' : 'font-light'}`}>
                      {item}
                  </span>
                </div>
              ))}
            </div>

            {/* Mobile Apply Button */}
            <button 
                onClick={() => setShowFilter(false)}
                className='lg:hidden mt-8 w-full bg-[#B8860B] text-black py-4 text-xs font-bold tracking-[0.3em] uppercase'
            >
                See {filterProducts.length} Results
            </button>
          </div>
        </aside>

        {/* --- PRODUCT GRID --- */}
        <main className='flex-1'>
          {/* Active Chips */}
          {category.length > 0 && (
            <div className='flex flex-wrap gap-2 mb-8'>
              {category.map(cat => (
                <div key={cat} className='flex items-center gap-2 border border-[#B8860B]/30 bg-[#B8860B]/5 text-[#B8860B] px-4 py-1.5 rounded-full text-[9px] tracking-widest uppercase font-bold'>
                  {cat}
                  <span onClick={() => toggleCategory(cat)} className='cursor-pointer text-xs'>✕</span>
                </div>
              ))}
              <button onClick={() => setCategory([])} className='text-[10px] text-gray-600 underline underline-offset-4 ml-2'>Clear All</button>
            </div>
          )}

          <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-16'>
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
            <div className='flex flex-col items-center justify-center py-40'>
                <p className='text-[#B8860B] font-serif text-xl italic mb-6 opacity-60'>No specimens located.</p>
                <button onClick={() => setCategory([])} className='border border-[#B8860B]/40 text-[#B8860B] px-10 py-3 text-[10px] tracking-[0.4em] uppercase hover:bg-[#B8860B] hover:text-black transition-all'>Reset</button>
            </div>
          )}
        </main>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #B8860B33; }
      `}} />
    </div>
  )
}

export default Collection;