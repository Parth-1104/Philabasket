import React, { useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext'; // Ensure this path is correct

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

const StampCategoryScroll = () => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { products } = useContext(ShopContext);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 400 : scrollLeft + 400;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/collection?category=${encodeURIComponent(categoryName)}`);
    window.scrollTo(0,0);
  };

  // Helper function to find the first image for a category
  const getCategoryImage = (categoryName) => {
    const product = products.find(item => 
      item.category && item.category.includes(categoryName)
    );
    // Returns the first image of the found product, or fallback to main01
    return product && product.image && product.image.length > 0 
      ? product.image[0] 
      : assets.main01;
  };

  return (
    <div className='my-5'>
      <div className='relative group mt-5'>
        
        {/* Left Arrow */}
        <button 
          onClick={() => scroll('left')}
          className='absolute left-2 sm:left-5 top-1/2 z-20 bg-white/90 p-2 rounded-full shadow-lg hidden group-hover:flex items-center justify-center -translate-y-1/2 border border-gray-100 hover:bg-black hover:invert transition-all'
        >
          <img src={assets.dropdown_icon} className='w-3 rotate-180' alt="prev" />
        </button>

        {/* Categories Container */}
        <div 
  ref={scrollRef}
  className='flex items-center gap-6 sm:gap-10 overflow-x-auto no-scrollbar px-4 sm:px-[5vw] py-4 scroll-smooth'
>
  {ALL_CATEGORIES.map((item, index) => {
    const displayImage = getCategoryImage(item);
    
    return (
      <div 
        key={index} 
        onClick={() => handleCategoryClick(item)}
        className='flex flex-col items-center gap-3 cursor-pointer group/item shrink-0'
      >
        {/* Enforced Constant Circle Wrapper */}
        <div className='w-24 h-24 sm:w-32 sm:h-32 aspect-square flex-none rounded-full border-[3px] border-[#C32127] p-1 transition-all duration-300 group-hover/item:shadow-xl group-hover/item:scale-105'>
          <div className='w-full h-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center'>
            <img 
              src={displayImage} 
              alt={item} 
              // object-cover is vital here to keep the image centered without stretching
              className='w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110'
            />
          </div>
        </div>

        {/* Text Container with fixed width to prevent circle stretching */}
        <div className='w-24 sm:w-32'>
          <p className='text-[10px] sm:text-xs font-bold text-gray-700 text-center uppercase tracking-wider leading-tight truncate px-1'>
            {item}
          </p>
        </div>
      </div>
    );
  })}
</div>

        {/* Right Arrow */}
        <button 
          onClick={() => scroll('right')}
          className='absolute right-2 sm:right-5 top-1/2 z-20 bg-white/90 p-2 rounded-full shadow-lg hidden group-hover:flex items-center justify-center -translate-y-1/2 border border-gray-100 hover:bg-black hover:invert transition-all'
        >
          <img src={assets.dropdown_icon} className='w-3 -rotate-360' alt="next" />
        </button>
      </div>
    </div>
  );
};

export default StampCategoryScroll;