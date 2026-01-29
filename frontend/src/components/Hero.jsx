import React from 'react'
import { assets } from '../assets/assets'

const Hero = ({scrollHandler}) => {
  return (
    <div className='w-full min-h-screen lg:h-[100vh] border-b border-black/5 bg-[#fffefe] py-10 lg:py-20 overflow-hidden relative select-none flex flex-col items-center justify-center'>
      
      {/* Top Text Content */}
      <div className='text-center mb-8 sm:mb-10 lg:mb-16 relative z-50 px-4 sm:px-6'>
        <div className='flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-16'>

            {/* Decorative stamp - Desktop only */}
            <div className='absolute left-[2%] top-[-10vh] w-1/4 lg:w-1/6 z-0 opacity-20 grayscale rotate-[12deg] hidden lg:block'>
                <img draggable="false" className='w-full h-auto' src={assets.main02} alt="Background" />
            </div>

            {/* Side text - Desktop only */}
            <p className='hidden lg:block text-[14px] font-black leading-tight text-gray-400 uppercase tracking-[0.3em] text-left w-32'>
                Explore This Year's <span className='text-[#BC002D] italic'>Exclusive</span> Stamp Releases
            </p>

            {/* Title with Crimson Red highlight - Responsive sizing */}
            <h1 className='font-serif text-3xl sm:text-5xl md:text-6xl lg:text-8xl text-black tracking-tighter leading-[1.1]'>
                Curated <span className='italic font-light text-[#BC002D]'>Stamps</span> <br />
                <span className='font-light opacity-30'>for</span> True Philatelist
            </h1>
            
            {/* Mobile subtitle */}
            <p className='lg:hidden text-[9px] sm:text-[10px] font-black tracking-[0.3em] sm:tracking-[0.4em] text-[#BC002D] uppercase mt-3 sm:mt-4'>
                Registry MMXXVI • Exclusive Archive
            </p>
        </div>
      </div>

      {/* Full Width Scattered Image Collage - Optimized for all screens */}
      <div className='relative w-full h-[350px] sm:h-[450px] md:h-[500px] lg:h-[600px] max-w-7xl px-4'>
        
        {/* Main Center Stamp - Responsive scaling */}
        <div className='absolute left-1/2 -translate-x-1/2 lg:left-[35%] top-[8%] sm:top-[10%] lg:top-[5%] w-[65%] sm:w-[55%] md:w-[45%] lg:w-[35%] z-20 shadow-2xl border-[6px] sm:border-[10px] lg:border-[15px] border-white bg-white hover:scale-105 transition-transform duration-500'>
            <img draggable="false" className='w-full h-auto' src={assets.main01} alt="Main Stamp" />
        </div>

        {/* Floating Stamp Left - Visible on all screens, adjusted size */}
        <div className='absolute left-[2%] sm:left-[5%] top-[0%] sm:top-[5%] w-[30%] sm:w-[32%] md:w-[28%] lg:w-[18%] z-10 shadow-lg sm:shadow-xl border border-[#BC002D]/20 grayscale hover:grayscale-0 transition-all duration-700 rotate-[-5deg] hover:rotate-[-8deg]'>
            <img draggable="false" className='w-full h-auto' src={assets.main02} alt="Stamp 2" />
        </div>

        {/* Floating Stamp Right - Better mobile positioning */}
        <div className='absolute lg:right-[30%] right-[2%] sm:right-[5%] top-[15%] sm:top-[18%] lg:top-[20%] w-[32%] sm:w-[35%] md:w-[30%] lg:w-[18%] z-30 shadow-xl sm:shadow-2xl border-[1.5px] sm:border-2 border-black  hover:rotate-[8deg] transition-all duration-500'>
            <img draggable="false" className='w-full h-auto' src={assets.main03} alt="Stamp 3" />
        </div>

        {/* Floating Stamp Bottom Left - Visible on tablet and up */}
        <div className='absolute lg:bottom-[5%] lg:left-[4%] left-[10%] sm:left-[15%] bottom-[0%] sm:bottom-[-5%] w-[28%] sm:w-[25%] lg:w-[20%] z-40 shadow-xl sm:shadow-2xl border-[1.5px] sm:border-2 border-[#BC002D] hidden sm:block hover:scale-105 transition-transform duration-500'>
            <img draggable="false" className='w-full h-auto' src={assets.main04} alt="Stamp 4" />
        </div>

        {/* Background Detail - Desktop only */}
        <div className='absolute right-[10%] bottom-[-10%] w-1/4 lg:w-1/6 z-0 opacity-10 grayscale rotate-[25deg] hidden lg:block'>
            <img draggable="false" className='w-full h-auto' src={assets.main02} alt="Background" />
        </div>
      </div>

      {/* Attractive Offers Bottom Right - Desktop only */}
      <div className='absolute bottom-[22%] right-10 hidden lg:flex flex-col items-center gap-4 z-50'>
          <p className='text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] text-right w-32'>
              Acquisition <span className='text-[#BC002D]'>Bonuses</span> for new collectors.
          </p>
          <div 
            onClick={scrollHandler}
            className='border border-[#BC002D] text-[#BC002D] rounded-full p-4 cursor-pointer hover:bg-[#BC002D] hover:text-white transition-all duration-500 shadow-xl shadow-[#BC002D]/10 hover:shadow-[#BC002D]/30 hover:scale-110'
          >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/>
              </svg>
          </div>
      </div>

      {/* Mobile CTA - Enhanced version */}
      <div onClick={scrollHandler} className='lg:hidden mt-6 sm:mt-8 flex flex-col items-center gap-2 cursor-pointer'>
         <p className='text-[8px] sm:text-[9px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] text-black/30'>Explore the Archive</p>
         <div className='w-[1px] h-10 sm:h-12 bg-gradient-to-b from-[#BC002D] to-transparent animate-pulse'></div>
      </div>

    </div>
  )
}

export default Hero