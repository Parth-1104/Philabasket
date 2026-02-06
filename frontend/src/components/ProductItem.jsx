import React, { useContext, useEffect, useState, useMemo } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link, useNavigate } from 'react-router-dom'

const ProductItem = ({ id, _id, image, name, price, marketPrice, category, linkToFilter = false }) => {
    
  const { formatPrice, currency } = useContext(ShopContext);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  
  // FIX: Support both MongoDB _id and standard id props
  const productId = _id || id;
  
  const createSeoSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/ /g, '-')           // Replace spaces with -
      .replace(/[^\w-]+/g, '')      // Remove all non-word chars
      .replace(/--+/g, '-')         // Replace multiple - with single -
      .trim();
  };



  const handleDragStart = (e) => e.preventDefault();
  const isRare = price > 1000; 

  const optimizedImage = useMemo(() => {
    const rawUrl = image && image[0] ? image[0] : "";
    if (!rawUrl || !rawUrl.includes('cloudinary')) return rawUrl;
  
    const watermarkTransform = 'l_Logo-5_nqnyl4,o_50,w_0.6,c_scale';
    
    if (rawUrl.includes('f_auto,q_auto')) {
        return rawUrl.replace('/f_auto,q_auto/', `/f_auto,q_auto,${watermarkTransform}/`);
    }
  
    return rawUrl.replace('/upload/', `/upload/f_auto,q_auto,w_600,${watermarkTransform}/`);
  }, [image]);

  // LOGIC: Determine where the user goes
  const handleNavigation = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (linkToFilter) {
      navigate('/collection', { state: { priorityId: productId } });
    } else {
      // HYBRID URL: /product/ID/seo-name
      const slug = createSeoSlug(name || "specimen");
      navigate(`/product/${productId}/${slug}`);
    }
    window.scrollTo(0,0);
  };

  return (
      <div 
        className='relative block group select-none transition-all duration-700 cursor-pointer' 
        onClick={handleNavigation}
        onDragStart={handleDragStart} 
      >
          <div className='relative overflow-hidden bg-white p-1.5 lg:p-1.5 transition-all duration-700 border border-black/[0.05] group-hover:border-[#BC002D]/30 rounded-br-[30px] lg:rounded-br-[60px] shadow-sm group-hover:shadow-2xl will-change-transform'>
              
              {isRare && (
                <div className='absolute top-3 left-3 z-20 flex items-center gap-1.5'>
                  <div className='w-1 h-1 bg-[#BC002D] rounded-full animate-pulse shadow-[0_0_8px_#BC002D]'></div>
                  <span className='text-[6px] lg:text-[7px] font-black text-[#BC002D] tracking-widest uppercase'>Rare</span>
                </div>
              )}

              <div className='relative aspect-[4/5] flex items-center justify-center overflow-hidden bg-[#F8F8F8] group-hover:bg-white transition-colors duration-700 rounded-br-[25px] lg:rounded-br-[30px]'>
                  {!isLoaded && (
                    <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
                  )}
                  
                  <img 
                      draggable="false"
                      loading="lazy"
                      onLoad={() => setIsLoaded(true)}
                      className={`z-10 w-full h-full object-contain p-2 lg:p-5 filter transform transition-all duration-1000 ease-out
                        ${isLoaded ? 'opacity-100 scale-100 group-hover:scale-105' : 'opacity-0 scale-95'}`} 
                      src={optimizedImage} 
                      alt={name} 
                  />

                  <div className="absolute inset-0 z-15 pointer-events-none flex items-center justify-center opacity-[0.03] rotate-[-30deg]">
                      <span className="text-black font-black text-4xl lg:text-6xl uppercase">PhilaBasket</span>
                  </div>
              </div>
          </div>
          
          <div className='mt-3 lg:mt-5 px-1'>
              <div className='flex justify-between items-start gap-1'>
                <div className='flex flex-col gap-0.5 max-w-[65%]'>
                  <h3 className='text-[10px] lg:text-[12px] font-black uppercase tracking-[0.05em] text-gray-900 group-hover:text-[#BC002D] transition-colors line-clamp-1'>
                      {name || "Untitled"}
                  </h3>
                  <p className='text-[8px] font-bold text-gray-400 uppercase tracking-widest truncate'>
                    {category} 
                  </p>
                </div>
                
                <div className='flex flex-col items-end shrink-0'>
                    <p className='text-[11px] lg:text-[14px] font-black text-gray-900 tabular-nums'>
                        <span className='text-[9px] mr-0.5 text-[#BC002D]'>{currency}</span>
                        {formatPrice(price)}
                    </p>
                </div>
              </div>
          </div>
      </div>
  )
}

export default ProductItem;