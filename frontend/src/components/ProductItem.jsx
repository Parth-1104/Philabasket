import React, { useContext, useMemo, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'

const ProductItem = ({ _id, image, name, price, marketPrice, category, linkToFilter = false }) => {
    
  const { formatPrice, currency } = useContext(ShopContext);
  const [isLoaded, setIsLoaded] = useState(false); // Track loading status
  
  const handleDragStart = (e) => e.preventDefault();
  const isRare = price > 1000; 

  const optimizedImage = useMemo(() => {
    const rawUrl = image && image[0] ? image[0] : "";
    if (!rawUrl || !rawUrl.includes('cloudinary')) return rawUrl;
    return rawUrl.includes('f_auto,q_auto') 
      ? rawUrl 
      : rawUrl.replace('/upload/', '/upload/f_auto,q_auto,w_600/');
  }, [image]);

  const destination = linkToFilter 
    ? `/collection?category=${encodeURIComponent(category || "")}` 
    : `/product/${_id}`;

  return (
      <Link 
        className='relative block group select-none transition-all duration-700' 
        to={destination}
        onClick={() => window.scrollTo(0,0)} 
        onDragStart={handleDragStart} 
      >
          <div className='relative overflow-hidden bg-white p-1.5 lg:p-1.5 transition-all duration-700 border border-black/[0.05] group-hover:border-[#BC002D]/30 rounded-br-[30px] lg:rounded-br-[60px] shadow-sm group-hover:shadow-2xl will-change-transform'>
              
              {isRare && (
                <div className='absolute top-3 left-3 z-20 flex items-center gap-1.5'>
                  <div className='w-1 h-1 bg-[#BC002D] rounded-full animate-pulse shadow-[0_0_8px_#BC002D]'></div>
                  <span className='text-[6px] lg:text-[7px] font-black text-[#BC002D] tracking-widest uppercase'>Rare</span>
                </div>
              )}

              {/* Inner Specimen Frame */}
              <div className='relative aspect-[4/5] flex items-center justify-center overflow-hidden bg-[#F8F8F8] group-hover:bg-white transition-colors duration-700 rounded-br-[25px] lg:rounded-br-[30px]'>
                  
                  {/* SKELETON LOADER: Only visible while image is loading */}
                  {!isLoaded && (
                    <div className="absolute inset-0 bg-gray-100 animate-pulse transition-opacity duration-500"></div>
                  )}

                  <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(188,0,45,0.05)_0%,_transparent_80%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000'></div>
                  
                  <img 
                      draggable="false"
                      loading="lazy"
                      decoding="async"
                      onLoad={() => setIsLoaded(true)} // Trigger fade-in
                      /* CSS LOGIC: 
                         - starts at opacity 0 and slightly blurred
                         - transitions to opacity 1 and blur 0 when isLoaded is true
                      */
                      className={`z-10 w-full h-full object-contain p-2 lg:p-5 filter transform transition-all duration-1000 ease-out
                        ${isLoaded ? 'opacity-100 blur-0 grayscale-[0.3] group-hover:grayscale-0 scale-100 group-hover:scale-105' : 'opacity-0 blur-lg grayscale-100 scale-95'}
                        drop-shadow-[0_5px_15px_rgba(0,0,0,0.08)]`} 
                      src={optimizedImage} 
                      alt={name} 
                  />

                  <div className='absolute inset-0 z-20 opacity-0 group-hover:opacity-10 transition-opacity duration-1000 bg-gradient-to-tr from-transparent via-[#BC002D]/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1.8s] pointer-events-none'></div>
              </div>

              <div className='absolute bottom-0 left-0 w-full h-[2px] bg-black/5'>
                <div className='h-full bg-[#BC002D] w-0 group-hover:w-full transition-all duration-700 ease-in-out'></div>
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
                    {marketPrice && Number(marketPrice) > Number(price) && (
                        <p className='text-[8px] lg:text-[9px] font-bold text-gray-400 line-through tabular-nums decoration-[#BC002D]/40'>
                            {currency}{formatPrice(marketPrice)}
                        </p>
                    )}
                    
                    <p className='text-[11px] lg:text-[14px] font-black text-gray-900 tabular-nums'>
                        <span className='text-[9px] mr-0.5 text-[#BC002D]'>{currency}</span>
                        {formatPrice(price)}
                    </p>
                </div>
              </div>
              
              <div className='mt-2 lg:mt-3 flex items-center pb-3 lg:pb-5 gap-2 opacity-0 lg:opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0'>
                <div className='h-[1px] w-4 lg:w-6 bg-[#BC002D]'></div>
                <span className='text-[6px] lg:text-[7px] tracking-[0.3em] font-black text-[#BC002D] uppercase'>
                    {linkToFilter ? 'Ledger' : 'Acquire'}
                </span>
              </div>
          </div>
      </Link>
  )
}

export default ProductItem;