import React from 'react'
import { assets } from '../assets/assets'

const OurPolicy = () => {
  return (
    <div className='bg-[#0a0a0a] py-24 border-y border-[#B8860B]/10'>
      <div className='max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-around gap-16 sm:gap-8 text-center'>
        
        {/* Policy Item 1: Exchange */}
        <div className='group flex flex-col items-center'>
          <div className='relative mb-8 p-4 border border-[#B8860B]/20 rounded-full group-hover:border-[#B8860B]/60 transition-all duration-700'>
            <img 
              draggable="false" 
              src={assets.exchange_icon} 
              className='w-10 brightness-0 invert opacity-60 group-hover:opacity-100 transition-opacity' 
              alt="Exchange" 
            />
            {/* Subtle Gold Pulse Effect */}
            <div className='absolute inset-0 rounded-full bg-[#B8860B]/5 animate-pulse'></div>
          </div>
          <h4 className='text-[#B8860B] font-serif text-lg tracking-widest uppercase mb-3'>
            Premier Exchange
          </h4>
          <p className='text-gray-500 text-xs md:text-sm font-light leading-relaxed max-w-[200px]'>
            Effortless transitions for your growing collection.
          </p>
        </div>

        {/* Policy Item 2: Return */}
        <div className='group flex flex-col items-center'>
          <div className='relative mb-8 p-4 border border-[#B8860B]/20 rounded-full group-hover:border-[#B8860B]/60 transition-all duration-700'>
            <img 
              draggable="false" 
              src={assets.quality_icon} 
              className='w-10 brightness-0 invert opacity-60 group-hover:opacity-100 transition-opacity' 
              alt="Quality" 
            />
          </div>
          <h4 className='text-[#B8860B] font-serif text-lg tracking-widest uppercase mb-3'>
            7-Day Assurance
          </h4>
          <p className='text-gray-500 text-xs md:text-sm font-light leading-relaxed max-w-[200px]'>
            A week of reflection to ensure absolute satisfaction.
          </p>
        </div>

        {/* Policy Item 3: Support */}
        <div className='group flex flex-col items-center'>
          <div className='relative mb-8 p-4 border border-[#B8860B]/20 rounded-full group-hover:border-[#B8860B]/60 transition-all duration-700'>
            <img 
              draggable="false" 
              src={assets.support_img} 
              className='w-10 brightness-0 invert opacity-60 group-hover:opacity-100 transition-opacity' 
              alt="Support" 
            />
          </div>
          <h4 className='text-[#B8860B] font-serif text-lg tracking-widest uppercase mb-3'>
            Global Concierge
          </h4>
          <p className='text-gray-500 text-xs md:text-sm font-light leading-relaxed max-w-[200px]'>
            Dedicated philatelic experts available around the clock.
          </p>
        </div>

      </div>
    </div>
  )
}

export default OurPolicy