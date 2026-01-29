import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'

const ProductItem = ({ id, image, name, price, category, linkToFilter = false }) => {
    
  const { formatPrice, currency } = useContext(ShopContext);
  
  const handleDragStart = (e) => e.preventDefault();
  
  // High-end specimen logic
  const isRare = price > 1000; 

  // Safety check to prevent .slice() or .toUpperCase() errors on undefined data
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
          {/* Main Container: Gallery White & Champagne Gold Accents */}
          <div className='relative overflow-hidden bg-[#FDFDFD] p-5 transition-all duration-700 group-hover:bg-white border border-black/[0.03] group-hover:border-[#D4AF37]/30 shadow-[0_10px_30px_rgba(0,0,0,0.02)] group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)]'>
              
              {/* Rare Specimen Registry No - Crimson Accent */}
              <div className='absolute top-4 left-4 z-20 overflow-hidden'>
                <p className='text-[8px] tracking-[0.4em] font-black text-black/20 group-hover:text-[#BC002D] uppercase transition-colors duration-500 transform -translate-x-full group-hover:translate-x-0'>
                   REG. {registryNo}
                </p>
              </div>

              {/* Gold Hallmark - Top Right (Pulsing for Rare items) */}
              {isRare && (
                <div className='absolute top-4 right-4 z-20'>
                  <div className='w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37] animate-pulse'></div>
                </div>
              )}

              {/* Specimen Mounting Area (The Inner Frame) */}
              <div className='relative aspect-[4/5] flex items-center justify-center overflow-hidden bg-[#F9F9F9] group-hover:bg-white transition-colors duration-700'>
                  {/* Soft Internal Glow: Mimics Museum Spotlighting */}
                  <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.08)_0%,_transparent_75%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000'></div>
                  
                  <img 
                      draggable="false"
                      onDragStart={handleDragStart}
                      className='z-10 w-full h-full object-contain p-6 filter grayscale-[0.2] group-hover:grayscale-0 drop-shadow-[0_5px_15px_rgba(0,0,0,0.05)] transform group-hover:scale-110 transition-transform duration-[1.8s] ease-out' 
                      src={image && image[0] ? image[0] : ""} 
                      alt={name} 
                  />

                  {/* Luxury Reflection: Gold Foil Shine Effect */}
                  <div className='absolute inset-0 z-20 opacity-0 group-hover:opacity-10 transition-opacity duration-1000 bg-gradient-to-tr from-transparent via-[#D4AF37]/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2s] pointer-events-none'></div>
              </div>

              {/* Signature Red Underline: Mimics a Curator's Ink Stroke */}
              <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-[#BC002D] group-hover:w-[80%] transition-all duration-700 ease-in-out'></div>
          </div>
          
          {/* Typography Section: Elegant Gallery Labels */}
          <div className='mt-8 space-y-3 px-1 text-center'>
              <div className='flex flex-col items-center gap-1'>
                <h3 className='text-[13px] uppercase tracking-[0.2em] font-serif text-black leading-tight group-hover:text-[#BC002D] transition-colors duration-500'>
                    {name || "Untitled Specimen"}
                </h3>
                <div className='w-4 h-[1px] bg-black/10 group-hover:bg-[#D4AF37]/50 transition-all'></div>
              </div>
              
              <div className='flex flex-col items-center gap-2'>
                <p className='text-[9px] tracking-[0.4em] font-bold text-black/30 uppercase italic'>
                   {category} Archive
                </p>
                
                {/* --- DYNAMIC CURRENCY SYNC --- */}
                <div className='flex items-center justify-center gap-1'>
                    <span className='text-[14px] font-serif text-[#D4AF37]'>
                        {currency === 'USD' ? '$' : '₹'}
                    </span>
                    <p className='text-[14px] font-medium text-[#D4AF37] tabular-nums tracking-[0.1em]'>
                        {/* We use String() to avoid the .replace() crash on numbers */}
                        {String(formatPrice(price)).replace(/[₹$]/g, '')}
                    </p>
                </div>
              </div>
          </div>

          {/* Luxury Action Call: Elegant Fade-in */}
          <div className='mt-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-700 text-center'>
              <span className='text-[8px] tracking-[0.6em] uppercase font-black text-[#BC002D] border-b border-[#BC002D]/20 pb-1'>
                  {linkToFilter ? 'View Ledger' : 'View Specimen'}
              </span>
          </div>
      </Link>
  )
}

export default ProductItem;