import React from 'react'
import { assets } from '../assets/assets'

const Hero = () => {
  return (
    /* Added 'select-none' to prevent text/image highlighting during drag */
    <div className='w-full h-[100vh] border-b border-gray-400 bg-[#FCF9F4] py-20 overflow-hidden relative select-none'>
      
      {/* Top Text Content */}
      <div className='text-center mb-16 relative z-50 px-6'>
        <div className='flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-16'>

            {/* Background decorative stamp (Top Left) */}
            <div className='absolute left-[2%] top-[-18vh] w-1/4 lg:w-1/6 z-0 opacity-40 grayscale rotate-[12deg]'>
                {/* Added draggable="false" */}
                <img draggable="false" className='w-full h-auto' src={assets.main02} alt="Background" />
            </div>

            <p className='hidden lg:block text-[16px] leading-tight text-gray-900 uppercase tracking-[0.2em] text-left w-28'>
                Explore This Year's <span className='text-[#E63946] font-bold'>Exclusive</span> Stamp Releases
            </p>

            {/* Title with the Red "Stamps" highlight */}
            <h1 className='prata-regular text-5xl sm:text-7xl lg:text-8xl text-[#2D2825] leading-[1.1]'>
                Curated <span className='font-bold italic text-[#E63946]'>Stamps</span> <br />
                <span className='italic font-light'>for</span> True Philatelist
            </h1>
            
            <div className='hidden lg:block w-28'></div>
        </div>
      </div>

      {/* Full Width Scattered Image Collage */}
      <div className='relative w-full h-[500px] sm:h-[650px] lg:h-[750px]'>
        
        {/* Main Center Stamp - Clean White Border */}
        <div className='absolute left-[47vh] top-[1vh] w-[85%] sm:w-[65%] lg:w-[30%] z-10 shadow-2xl border-[10px] border-white animate-hb-side'>
            <img draggable="false" className='w-full h-auto' src={assets.main01} alt="Main Stamp" />
        </div>

        {/* Floating Stamp Left - Top */}
        <div className='absolute left-[13vw] top-[-2%] w-1/3 sm:w-1/4 lg:w-[15%] z-20 shadow-xl border-2 border-[#E63946] animate-hb-side'>
            <img draggable="false" className='w-full h-auto' src={assets.main02} alt="Stamp 2" />
        </div>

        {/* Floating Stamp Right - Middle */}
        <div className='absolute right-[25vw] top-[20%] w-1/3 sm:w-1/4 lg:w-[15%] z-30 shadow-2xl border-4 border-black animate-hb-side'>
            <img draggable="false" className='w-full h-auto' src={assets.main03} alt="Stamp 3" />
        </div>

        {/* Floating Stamp Left - Bottom */}
        <div className='absolute left-[10%] bottom-[33%] w-[40%] sm:w-[30%] lg:w-[20%] z-40 shadow-2xl border-2 border-[#E63946] animate-hb-side-delayed'>
            <img draggable="false" className='w-full h-auto' src={assets.main04} alt="Stamp 4" />
        </div>

        {/* Background Detail (Right Bottom) */}
        <div className='absolute right-[2%] bottom-[10%] w-1/4 lg:w-1/6 z-0 opacity-40 grayscale rotate-[12deg]'>
            <img draggable="false" className='w-full h-auto' src={assets.main02} alt="Background" />
        </div>
      </div>

      {/* --- Attractive Offers Bottom Right --- */}
      <div className='absolute bottom-[33vh] right-20 hidden lg:flex flex-col items-center gap-6 z-50'>
          <p className='text-[16px] text-gray-600 uppercase tracking-[0.1em] text-right w-28'>
              Get attractive <span className='text-[#E63946] font-bold'>offers</span> for your first purchase.
          </p>
          <div className='border-2 border-[#E63946] text-[#E63946] rounded-full p-3 cursor-pointer hover:bg-[#E63946] hover:text-white transition-all duration-300 shadow-md'>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/>
              </svg>
          </div>
      </div>

    </div>
  )
}

export default Hero