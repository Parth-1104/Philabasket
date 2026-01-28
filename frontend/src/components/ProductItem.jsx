import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'

const ProductItem = ({ id, image, name, price, category, linkToFilter = false }) => {
    
  const { formatPrice } = useContext(ShopContext);
  const handleDragStart = (e) => e.preventDefault();
  
  // High-end specimen logic
  const isRare = price > 1000; 

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
          {/* Main Specimen Container: Deep Black/Obsidian */}
          <div className='relative overflow-hidden bg-[#111111] p-6 transition-all duration-500 group-hover:bg-[#0a0a0a] border border-white/5 group-hover:border-[#B8860B]/30 shadow-2xl'>
              
              {/* Rare Specimen Badge - Gold Accent */}
              {isRare && (
                <div className='absolute top-4 left-4 z-20'>
                  <span className='text-[8px] tracking-[0.4em] font-bold text-[#B8860B]/60 uppercase border-l border-[#B8860B]/40 pl-2'>
                    SPECIMEN NO. {id.slice(-4)}
                  </span>
                </div>
              )}

              {/* Image with Spotlit Effect */}
              <div className='relative aspect-[4/5] flex items-center justify-center overflow-hidden'>
                  {/* Radial Spotlight: Makes the stamp "pop" from the dark background */}
                  <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)] opacity-100 transition-opacity duration-700'></div>
                  
                  <img 
                      draggable="false"
                      onDragStart={handleDragStart}
                      className='z-10 w-full h-full object-contain p-4 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transform group-hover:scale-110 transition-transform duration-[1.5s] ease-out' 
                      src={image[0]} 
                      alt={name} 
                  />

                  {/* Reflection/Glass Glare Effect: Gold-tinted reflection */}
                  <div className='absolute inset-0 z-20 opacity-0 group-hover:opacity-20 transition-opacity duration-1000 bg-gradient-to-br from-[#B8860B]/20 via-transparent to-transparent pointer-events-none'></div>
              </div>

              {/* Hover Action Line: Gold reveal */}
              <div className='absolute bottom-0 left-0 w-0 h-[1px] bg-[#B8860B] group-hover:w-full transition-all duration-700 ease-in-out'></div>
          </div>
          
          {/* Typography Section: Champagne Gold & White */}
          <div className='mt-6 space-y-2 px-1'>
              <div className='flex justify-between items-start gap-2'>
                <h3 className='text-[12px] uppercase tracking-[0.2em] font-serif text-white/90 leading-tight group-hover:text-[#B8860B] transition-colors duration-500'>
                    {name}
                </h3>
              </div>
              
              <div className='flex justify-between items-end pt-1'>
                <p className='text-[9px] tracking-[0.3em] font-light text-gray-500 uppercase italic'>
                   {category} Archive
                </p>
                <p className='text-[13px] font-medium text-[#B8860B] tabular-nums tracking-widest'>
                    {formatPrice(price)}
                </p>
              </div>
          </div>

          {/* Luxury Reveal Hint: Sliding Gold Text */}
          <div className='mt-4 overflow-hidden h-0 group-hover:h-6 transition-all duration-500'>
              <p className='text-[9px] tracking-[0.5em] uppercase text-center font-bold text-white/40 group-hover:text-[#B8860B] opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-700'>
                  {linkToFilter ? 'Full Collection' : 'Inspect Details'}
              </p>
          </div>
      </Link>
  )
}

export default ProductItem