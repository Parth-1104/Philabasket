import React from 'react'
import { assets } from '../assets/assets'

const OurPolicy = () => {
  return (
    <div className='bg-[#FBFBFB] py-32 border-y border-black/[0.03] select-none'>
      <div className='max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-20 md:gap-12 text-center'>
        
        {/* Policy Item 1: Authenticity / Provenance */}
        <div className='group flex flex-col items-center'>
          <div className='relative mb-10 w-20 h-20 flex items-center justify-center'>
            {/* Elegant Outer Ring */}
            <div className='absolute inset-0 border border-black/5 rounded-full group-hover:border-[#D4AF37]/40 group-hover:scale-110 transition-all duration-1000'></div>
            
            <img 
              draggable="false" 
              src={assets.quality_icon} 
              className='w-8 brightness-0 opacity-40 group-hover:opacity-100 transition-opacity duration-700' 
              alt="Authenticity" 
            />
            
            {/* Small Crimson Seal Dot */}
            <div className='absolute top-0 right-0 w-2 h-2 bg-[#BC002D] rounded-full group-hover:animate-ping'></div>
          </div>

          <h4 className='text-black font-serif text-sm tracking-[0.4em] uppercase mb-4'>
            Verified <span className='italic font-light'>Provenance</span>
          </h4>
          <p className='text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-[0.2em] leading-relaxed max-w-[240px]'>
            Every specimen undergoes rigorous appraisal with a lifetime guarantee of authenticity.
          </p>
        </div>

        {/* Policy Item 2: Insured Transit */}
        <div className='group flex flex-col items-center'>
          <div className='relative mb-10 w-20 h-20 flex items-center justify-center'>
            <div className='absolute inset-0 border border-black/5 rounded-full group-hover:border-[#D4AF37]/40 group-hover:scale-110 transition-all duration-1000'></div>
            
            <img 
              draggable="false" 
              src={assets.exchange_icon} 
              className='w-8 brightness-0 opacity-40 group-hover:opacity-100 transition-opacity duration-700' 
              alt="Insurance" 
            />
          </div>

          <h4 className='text-black font-serif text-sm tracking-[0.4em] uppercase mb-4'>
            Sovereign <span className='italic font-light'>Protection</span>
          </h4>
          <p className='text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-[0.2em] leading-relaxed max-w-[240px]'>
            Fully insured white-glove shipping to over 140 countries via secure global corridors.
          </p>
        </div>

        {/* Policy Item 3: Expert Concierge */}
        <div className='group flex flex-col items-center'>
          <div className='relative mb-10 w-20 h-20 flex items-center justify-center'>
            <div className='absolute inset-0 border border-black/5 rounded-full group-hover:border-[#D4AF37]/40 group-hover:scale-110 transition-all duration-1000'></div>
            
            <img 
              draggable="false" 
              src={assets.support_img} 
              className='w-8 brightness-0 opacity-40 group-hover:opacity-100 transition-opacity duration-700' 
              alt="Concierge" 
            />
          </div>

          <h4 className='text-black font-serif text-sm tracking-[0.4em] uppercase mb-4'>
            Expert <span className='italic font-light'>Curators</span>
          </h4>
          <p className='text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-[0.2em] leading-relaxed max-w-[240px]'>
            Direct access to dedicated philatelists for portfolio guidance and acquisition advice.
          </p>
        </div>

      </div>

      {/* Luxury Detail: Centered Emblem or Motto */}
      <div className='mt-24 flex flex-col items-center opacity-20'>
          <div className='h-12 w-[1px] bg-gradient-to-b from-black to-transparent mb-6'></div>
          <p className='text-[8px] tracking-[0.8em] text-black uppercase font-black'>A Legacy Built on Trust • MMXXVI</p>
      </div>
    </div>
  )
}

export default OurPolicy