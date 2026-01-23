import React, { useContext, useEffect, useState, useMemo } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
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
  const [condition, setCondition] = useState([]);
  const [sortType, setSortType] = useState('relavent');
  const [filterSearch, setFilterSearch] = useState("");
  
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  useEffect(() => {
    if (categoryFromUrl) {
      const decoded = decodeURIComponent(categoryFromUrl);
      setCategory([decoded]); 
      if (window.innerWidth < 640) setShowFilter(true);
    }
  }, [categoryFromUrl]);

  const toggleCategory = (e) => {
    const val = e.target.value;
    setCategory(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]);
  }

  const toggleCondition = (e) => {
    const val = e.target.value;
    setCondition(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]);
  }

  const resetFilters = () => {
    setCategory([]);
    setCondition([]);
    setFilterSearch("");
  }
  

  const applyFilter = () => {
    let productsCopy = products.slice();
    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    }
    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => item.category && item.category.some(cat => category.includes(cat)));
    }
    if (condition.length > 0) {
      productsCopy = productsCopy.filter(item => condition.includes(item.condition))
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
  }, [category, condition, search, showSearch, products, sortType]);

  // --- FIXED: SORT SELECTED CATEGORIES TO TOP ---
  const filteredCategoryList = useMemo(() => {
    const searched = ALL_CATEGORIES.filter(cat => 
      cat.toLowerCase().includes(filterSearch.toLowerCase())
    );

    // Sort: if category is in 'category' state, move to top
    return searched.sort((a, b) => {
      const aSelected = category.includes(a);
      const bSelected = category.includes(b);
      
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });
  }, [filterSearch, category]);

  return (
    <div className='flex flex-col px-3 sm:flex-row gap-1 sm:gap-10 pt-10 border-t select-none'>
      
      {/* --- SIDEBAR FILTERS --- */}
      <div className='min-w-60'>
        <div onClick={() => setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2 uppercase tracking-wider group'>
          FILTERS
          <img draggable="false" className={`h-3 sm:hidden transition-transform ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
          {(category.length > 0 || condition.length > 0) && (
            <span className='ml-auto text-[10px] bg-black text-white px-2 py-0.5 rounded-full'>{category.length + condition.length} Active</span>
          )}
        </div>

        <div className={`border border-gray-300 px-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
          <div className='flex justify-between items-center mb-3'>
            <p className='text-sm font-medium uppercase tracking-tighter'>Collections</p>
            {category.length > 0 && <button onClick={() => setCategory([])} className='text-[10px] text-orange-600 hover:underline'>Clear</button>}
          </div>
          <input type="text" placeholder="Search categories..." value={filterSearch} className="border border-gray-200 text-xs px-2 py-2 mb-3 w-full rounded focus:ring-1 focus:ring-orange-400 outline-none" onChange={(e) => setFilterSearch(e.target.value)} />
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700 max-h-60 overflow-y-auto pr-2'>
            {filteredCategoryList.map((item) => (
              <label 
                key={item} 
                className={`flex gap-2 items-center cursor-pointer p-1 rounded transition-colors ${category.includes(item) ? 'bg-orange-50' : 'hover:text-black'}`}
              >
                <input className='w-3 h-3 accent-orange-600' type="checkbox" value={item} onChange={toggleCategory} checked={category.includes(item)} /> 
                <span className={category.includes(item) ? "font-medium text-black" : ""}>{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* --- MAIN PRODUCT GRID --- */}
      <div className='flex-1'>
        
        {/* --- TOP ACTIVE FILTER CHIPS --- */}
        {(category.length > 0 || condition.length > 0) && (
          <div className='flex flex-wrap gap-2 mb-6 animate-fade-in'>
            {category.map((cat) => (
              <div key={cat} className='flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1 rounded-full text-[11px] font-medium'>
                {cat}
                <button onClick={() => setCategory(prev => prev.filter(i => i !== cat))} className='hover:text-black'>✕</button>
              </div>
            ))}
            {condition.map((cond) => (
              <div key={cond} className='flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-[11px] font-medium'>
                {cond}
                <button onClick={() => setCondition(prev => prev.filter(i => i !== cond))} className='hover:text-black'>✕</button>
              </div>
            ))}
            <button onClick={resetFilters} className='text-[11px] text-gray-400 hover:text-orange-600 underline underline-offset-4 ml-2'>Clear all</button>
          </div>
        )}

        <div className='flex justify-between items-center text-base sm:text-2xl mb-4'>
            <Title text1={'PHILATELIC'} text2={'COLLECTIONS'} />
            <select onChange={(e)=>setSortType(e.target.value)} className='border border-gray-300 text-sm px-2 py-1 bg-white outline-none cursor-pointer'>
              <option value="relavent">Sort by: Relevant</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {filterProducts.map((item, index) => (
            <ProductItem key={item._id || index} name={item.name} id={item._id} price={item.price} image={item.image} category={item.category && item.category[0]} linkToFilter={false} />
          ))}
        </div>

        {filterProducts.length === 0 && (
          <div className='flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg mt-10 border border-dashed border-gray-300'>
            <p className='text-gray-500 font-medium'>No stamps match your selection.</p>
            <button onClick={resetFilters} className='mt-4 px-6 py-2 bg-black text-white text-sm'>Reset All Filters</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Collection;