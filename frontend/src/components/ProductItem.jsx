import React, { useContext, useEffect, useState, useMemo } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { toast } from 'react-toastify'

const ProductItem = ({ id, _id, image, name, price, marketPrice, category, linkToFilter = false }) => {
    
  const { formatPrice, currency, addToCart, wishlist, toggleWishlist } = useContext(ShopContext);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const productId = _id || id;
  
  const createSeoSlug = (text) => {
    return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').trim();
  };

  const optimizedImage = useMemo(() => {
    const rawUrl = image && image[0] ? image[0] : "";
    if (!rawUrl || !rawUrl.includes('cloudinary')) return rawUrl;

    // Optimized: Use c_limit or remove forced padding to keep the specimen large
    const watermarkTransform = 'l_Logo-5_tagline_yaxuag,fl_relative,w_0.5,c_scale,o_70,a_-45';
    
    // Using c_limit ensures the image doesn't get shrunk by forced padding
    if (rawUrl.includes('f_auto,q_auto')) {
        return rawUrl.replace('/f_auto,q_auto/', `/f_auto,q_auto,w_800,c_limit,${watermarkTransform}/`);
    }
    return rawUrl.replace('/upload/', `/upload/f_auto,q_auto,w_800,c_limit,${watermarkTransform}/`);
  }, [image]);

  const handleNavigation = (e) => {
    e.preventDefault();
    const slug = createSeoSlug(name || "specimen");
    navigate(`/product/${productId}/${slug}`);
    window.scrollTo(0,0);
  };

  const onToggleWishlist = (e) => {
    e.stopPropagation(); 
    toggleWishlist(productId);
  };

  const symbol = currency === 'USD' ? '$' : '₹';

  return (
      <div className='relative block group select-none transition-all duration-700 cursor-pointer w-full'>
          {/* IMAGE CONTAINER */}
          <div className='relative aspect-square overflow-hidden bg-[#FDFDFD] border border-black/[0.03] group-hover:border-[#BC002D]/40 transition-all duration-500' onClick={handleNavigation}>
              
              <button 
                onClick={onToggleWishlist}
                className='absolute top-2 right-2 z-30 p-1.5 bg-white/80 backdrop-blur-md rounded-full border border-black/10 hover:bg-[#BC002D] hover:text-white transition-all shadow-sm'
              >
                <Heart 
                  size={14} 
                  className={`${wishlist.includes(productId) ? 'fill-[#BC002D] text-[#BC002D]' : 'text-black'} transition-colors`} 
                />
              </button>

              <div className='w-full h-full flex items-center justify-center'>
                  <img 
                      onLoad={() => setIsLoaded(true)}
                      // Added h-full and w-full with object-contain to force visibility
                      className={`z-10 w-full h-full object-contain p-2 transition-all duration-1000 ease-in-out ${
                        isLoaded ? 'opacity-100 scale-100 group-hover:scale-110' : 'opacity-0 scale-95'
                      }`} 
                      src={optimizedImage} 
                      alt={name} 
                  />
                  
                  <div className='absolute inset-0 bg-[#BC002D]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700'></div>
              </div>
          </div>
          
          <div className='py-4 px-1'>
    <div className='flex flex-col gap-1.5'>
        <div className='flex justify-between items-start gap-4'>
            {/* Changed font-black to font-bold for a cleaner, slightly lighter look */}
            <p className='text-[10px] lg:text-[13px] font-semibold tracking-tight text-gray-900 group-hover:text-[#BC002D] transition-colors leading-[1.2] line-clamp-4 min-h-[3.6em] overflow-hidden' onClick={handleNavigation}>
                {name || "Untitled Specimen"}
            </p>
                  
                  <div className='flex flex-col items-end shrink-0 pt-0.5'>
                    {marketPrice > price && (
                        <p className='text-[8px] lg:text-[10px] font-bold text-gray-400 tabular-nums line-through decoration-[#BC002D]/50'>
                            {symbol}{formatPrice(marketPrice)}
                        </p>
                    )}
                    <p className='text-[11px] lg:text-[16px] font-black text-gray-900 tabular-nums leading-none'>
                        <span className='text-[9px] lg:text-[11px] mr-0.5 text-[#BC002D]'>{symbol}</span>
                        {formatPrice(price)}
                    </p>
                  </div>
                </div>
                {/* {category && (
                    <p className='text-[7px] lg:text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em]'>
                        {category[0]}
                    </p>
                )} */}
              </div>
          </div>
      </div>
  )
}

export default ProductItem;