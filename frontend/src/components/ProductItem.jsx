import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'

const ProductItem = ({ id, image, name, price, category, linkToFilter = false }) => {
    
  const { formatPrice, currency } = useContext(ShopContext);
  
  const handleDragStart = (e) => e.preventDefault();
  
  // Rarity check for high-value items
  const isRare = price > 1000; 

  const safeId = id ? String(id) : "";
  const registryNo = safeId ? safeId.slice(-5).toUpperCase() : "XXXXX";

  const destination = linkToFilter 
    ? `/collection?category=${encodeURIComponent(category || "")}` 
    : `/product/${id}`;

  return (
      <Link 
        className='relative block group select-none transition-all duration-700' 
        to={destination}
        onClick={() => window.scrollTo(0,0)} 
        onDragStart={handleDragStart} 
      >
          {/* Main Container: Crimson Accents & NewHero Curve */}
          <div className='relative overflow-hidden bg-white p-4 transition-all duration-700 border border-black/[0.05] group-hover:border-[#BC002D]/30 rounded-br-[60px] group-hover:rounded-br-[80px] shadow-sm group-hover:shadow-2xl'>
              
              {/* Vertical Registry Tag - NewHero Style */}
              <div className='absolute top-0 right-6 z-20'>
                <div className='bg-black text-white px-2 py-4 flex flex-col items-center gap-2 group-hover:bg-[#BC002D] transition-colors duration-500'>
                  <span className='[writing-mode:vertical-lr] text-[7px] font-black tracking-[0.3em] uppercase'>
                    REG. {registryNo}
                  </span>
                </div>
              </div>

              {/* Rarity Pulse - Crimson */}
              {isRare && (
                <div className='absolute top-4 left-4 z-20 flex items-center gap-2'>
                  <div className='w-1.5 h-1.5 bg-[#BC002D] rounded-full animate-pulse shadow-[0_0_8px_#BC002D]'></div>
                  <span className='text-[7px] font-black text-[#BC002D] tracking-widest uppercase'>Rare Asset</span>
                </div>
              )}

              {/* Inner Specimen Frame */}
              <div className='relative aspect-[4/5] flex items-center justify-center overflow-hidden bg-[#F8F8F8] group-hover:bg-white transition-colors duration-700 rounded-br-[40px]'>
                  {/* Crimson Spotlight Glow */}
                  <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(188,0,45,0.05)_0%,_transparent_80%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000'></div>
                  
                  <img 
                      draggable="false"
                      className='z-10 w-full h-full object-contain p-8 filter grayscale-[0.3] group-hover:grayscale-0 drop-shadow-[0_10px_20px_rgba(0,0,0,0.08)] transform group-hover:scale-110 transition-transform duration-[1.5s] ease-out' 
                      src={image && image[0] ? image[0] : ""} 
                      alt={name} 
                  />

                  {/* Red Foil Shine Overlay */}
                  <div className='absolute inset-0 z-20 opacity-0 group-hover:opacity-10 transition-opacity duration-1000 bg-gradient-to-tr from-transparent via-[#BC002D]/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1.8s] pointer-events-none'></div>
              </div>

              {/* Bold Bottom Line */}
              <div className='absolute bottom-0 left-0 w-full h-[2px] bg-black/5'>
                <div className='h-full bg-[#BC002D] w-0 group-hover:w-full transition-all duration-700 ease-in-out'></div>
              </div>
          </div>
          
          {/* Typography: Sharp & Categorical */}
          <div className='mt-6 px-1'>
              <div className='flex justify-between items-start gap-4'>
                <div className='flex flex-col gap-1'>
                  <h3 className='text-[12px] font-black uppercase tracking-[0.1em] text-gray-900 group-hover:text-[#BC002D] transition-colors'>
                      {name || "Untitled Specimen"}
                  </h3>
                  <p className='text-[9px] font-bold text-gray-400 uppercase tracking-widest'>
                    {category} • Archive
                  </p>
                </div>
                
                {/* Currency Display */}
                <div className='text-right'>
                  <p className='text-[14px] font-black text-gray-900 tabular-nums'>
                    <span className='text-[10px] mr-0.5 text-[#BC002D]'>{currency === 'USD' ? '$' : '₹'}</span>
                    {String(formatPrice(price)).replace(/[₹$]/g, '')}
                  </p>
                </div>
              </div>
              
              {/* Action Prompt */}
              <div className='mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0'>
                <div className='h-[1px] w-6 bg-[#BC002D]'></div>
                <span className='text-[8px] tracking-[0.4em] font-black text-[#BC002D] uppercase'>
                    {linkToFilter ? 'Open Ledger' : 'Acquire'}
                </span>
              </div>
          </div>
      </Link>
  )
}

export default ProductItem;