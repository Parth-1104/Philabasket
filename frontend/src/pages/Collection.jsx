
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import ProductItem from '../components/ProductItem';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ArrowUpDown, Search as SearchIcon } from 'lucide-react';

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



// ... (ALL_CATEGORIES array remains same)

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
    <div className='bg-white min-h-screen pt-24 pb-20 px-6 md:px-16 lg:px-24 select-none relative animate-fade-in'>
      
      {/* --- DECORATIVE BACKGROUND ARC --- */}
      <div className="absolute -right-[10vw] top-0 h-[60vh] w-[40vw] bg-[#BC002D]/5 rounded-bl-[600px] pointer-events-none"></div>

      {/* --- HEADER: Archive Status --- */}
      <div className='relative z-10 flex flex-col md:flex-row justify-between items-end mb-16 gap-8'>
          <div className='max-w-2xl'>
              <div className='flex items-center gap-4 mb-4'>
                  <span className='h-[1.5px] w-12 bg-[#BC002D]'></span>
                  <p className='text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-black'>Registry Database</p>
              </div>
              <h2 className='text-6xl md:text-8xl font-bold text-gray-900 tracking-tighter leading-none'>
                  THE <span className='text-[#BC002D]'>GALLERY.</span>
              </h2>
              <p className='mt-6 text-gray-400 text-xs font-bold uppercase tracking-[0.2em] leading-relaxed'>
                  Currently indexing <span className='text-black'>{filterProducts.length} certified specimens</span> for international acquisition.
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
        
        {/* --- SIDEBAR: The Vault Index --- */}
        <aside className={`
    fixed inset-0 z-[2000] lg:relative lg:z-0 lg:inset-auto
    lg:w-80 lg:block lg:sticky lg:top-32 lg:h-[calc(100vh-180px)]
    transition-all duration-700
    ${showFilter ? 'opacity-100' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'}
`}>
  {/* Mobile Backdrop with Blur */}
  <div onClick={() => setShowFilter(false)} className='absolute inset-0 bg-black/80 backdrop-blur-sm lg:hidden'></div>

  <div className={`
    absolute top-0 right-0 h-full w-[85%] bg-[#BC002D] p-10 flex flex-col transition-transform duration-500
    lg:relative lg:w-full lg:p-8 lg:translate-x-0 lg:bg-[#BC002D] lg:rounded-br-[80px] lg:shadow-[0_20px_50px_rgba(188,0,45,0.3)]
    ${showFilter ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
  `}>
    
    {/* Header with Gold Accents */}
    <div className='flex justify-between items-center mb-8'>
      <div className='flex flex-col'>
        <h3 className='text-white font-black text-xs tracking-[0.3em] uppercase'>Registry Index</h3>
        <div className='h-[2px] w-8 bg-white/30 mt-2'></div>
      </div>
      <button onClick={() => setShowFilter(false)} className='lg:hidden text-white/60 hover:text-white'><X size={24}/></button>
    </div>

    {/* Filter Search: High Contrast Dark Mode Style */}
    <div className='relative mb-8'>
        <SearchIcon size={14} className='absolute left-5 top-1/2 -translate-y-1/2 text-white/50' />
        <input 
          type="text" 
          placeholder="SEARCH CATEGORIES..." 
          className='w-full bg-black/20 border border-white/10 rounded-full px-12 py-4 text-[10px] font-black tracking-widest text-white outline-none focus:border-white/40 focus:bg-black/40 transition-all placeholder:text-white/30'
          onChange={(e) => setFilterSearch(e.target.value)}
        />
    </div>

    {/* Scrollable List with Amber/White Highlights */}
    <div className='flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3'>
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
            category.includes(item) ? 'text-[#BC002D]' : 'text-white/70 group-hover:text-white'
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

    {/* Mobile Action Footer */}
    <div className='lg:hidden mt-10 pt-6 border-t border-white/10'>
        <p className='text-[8px] font-black text-white/40 uppercase tracking-[0.5em] text-center mb-4'>Verified Registry Sync</p>
    </div>
  </div>
  
  {/* Custom Scrollbar Styling for Red Theme */}
  <style dangerouslySetInnerHTML={{ __html: `
    .custom-scrollbar::-webkit-scrollbar { width: 3px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.5); }
  `}} />
</aside>

        {/* --- MAIN DISPLAY --- */}
        <main className='flex-1'>
          
          {/* Mobile Actions Bar */}
          <div className='lg:hidden flex gap-4 mb-8'>
            <button onClick={() => setShowFilter(true)} className='flex-1 bg-black text-white p-5 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest'>
               <Filter size={14} /> Filter Index
            </button>
            <div className='flex-1 bg-gray-100 p-5 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-900'>
               <ArrowUpDown size={14} /> {sortType === 'relevant' ? 'Relevant' : 'Price'}
            </div>
          </div>

          {/* Active Chips */}
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

          {/* Result Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16'>
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

          {/* Empty State */}
          {filterProducts.length === 0 && (
            <div className='flex flex-col items-center justify-center py-40 bg-gray-50 rounded-[40px] md:rounded-br-[120px] border border-dashed border-gray-200'>
                <div className='w-20 h-20 bg-white shadow-xl flex items-center justify-center rounded-full mb-8'>
                    <SearchIcon size={30} className='text-[#BC002D] opacity-20' />
                </div>
                <h3 className='text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter'>Specimen Not Found</h3>
                <p className='text-gray-400 text-xs tracking-widest uppercase mb-10'>No registry records match your current criteria.</p>
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