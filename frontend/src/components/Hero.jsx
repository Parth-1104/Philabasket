import React from 'react'
import { assets } from '../assets/assets'

const Hero = () => {
  return (
    <div className='w-full min-h-screen bg-[#0a0a0a] overflow-hidden relative select-none flex flex-col justify-center py-20 px-6 md:px-16 lg:px-24'>
      
      {/* --- Ambient Background Layers --- */}
      {/* Radial Gold Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(184,134,11,0.1)_0%,_transparent_65%)] pointer-events-none"></div>
      
      {/* Decorative Large Watermark */}
      <div className='absolute left-[-5%] top-[10%] opacity-[0.03] rotate-[-15deg] pointer-events-none'>
          <img src={assets.main02} className='w-[40vw] filter grayscale invert' alt="" />
      </div>

      {/* --- Text Content: Editorial Layout --- */}
      <div className='relative z-50 flex flex-col items-center text-center'>
        
        {/* Top Tagline */}
        <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-8 md:w-16 bg-gradient-to-r from-transparent to-[#B8860B]"></div>
            <p className='text-[10px] md:text-xs tracking-[0.5em] text-[#B8860B] uppercase font-light'>
                Philately Excellence • MMXXVI
            </p>
            <div className="h-[1px] w-8 md:w-16 bg-gradient-to-l from-transparent to-[#B8860B]"></div>
        </div>

        {/* Cinematic Title */}
        <h1 className='font-serif text-5xl sm:text-7xl lg:text-9xl text-white leading-[1] mb-8 tracking-tighter'>
            The Private <br />
            <span className="italic font-light text-[#B8860B]/80 ml-8 md:ml-16 leading-none">Archives.</span>
        </h1>

        <div className="max-w-xl mx-auto space-y-8">
            <p className='text-sm md:text-base text-gray-400 font-light leading-relaxed tracking-wide italic'>
                Discover rare specimens and historical artifacts curated for the world's most distinguished philatelists.
            </p>
            
            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row items-center justify-center gap-6 pt-4'>
                <button className='bg-[#B8860B] text-black px-12 py-4 text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-white transition-all duration-500 rounded-sm shadow-[0_0_30px_rgba(184,134,11,0.2)]'>
                    Enter The Vault
                </button>
                <button className='text-white border-b border-white/20 pb-2 text-[10px] tracking-[0.4em] uppercase hover:text-[#B8860B] hover:border-[#B8860B] transition-all duration-500'>
                    View New Arrivals
                </button>
            </div>
        </div>
      </div>

      {/* --- Scattered Artifact Collage --- */}
      <div className='relative w-full h-[300px] md:h-[400px] mt-20 md:mt-10'>
        
        {/* Main Center Stamp - Floating with Gold Shadow */}
        <div className='absolute left-1/2 top-0 -translate-x-1/2 w-[60%] sm:w-[40%] lg:w-[22%] z-30 transform hover:scale-105 transition-transform duration-1000'>
            <div className="relative p-2 bg-gradient-to-tr from-[#B8860B]/40 to-white/10 rounded-sm shadow-2xl">
                <img draggable="false" className='w-full h-auto drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]' src={assets.main01} alt="Primary Specimen" />
            </div>
        </div>

        {/* Secondary Stamp Left */}
        <div className='absolute left-[5vw] top-[20%] w-[35%] sm:w-[25%] lg:w-[15%] z-20 opacity-40 hover:opacity-100 transition-opacity duration-700 animate-hb-side-delayed'>
            <img draggable="false" className='w-full h-auto filter grayscale group-hover:grayscale-0' src={assets.main02} alt="Artifact 2" />
        </div>

        {/* Secondary Stamp Right */}
        <div className='absolute right-[5vw] top-[10%] w-[35%] sm:w-[25%] lg:w-[15%] z-20 opacity-40 hover:opacity-100 transition-opacity duration-700 animate-hb-side'>
            <img draggable="false" className='w-full h-auto filter grayscale' src={assets.main03} alt="Artifact 3" />
        </div>
      </div>

      {/* --- Scroll Indicator --- */}
      <div className='absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30'>
          <span className='text-[8px] tracking-[0.5em] text-[#B8860B] uppercase font-bold'>Scroll to Explore</span>
          <div className='w-[1px] h-12 bg-gradient-to-b from-[#B8860B] to-transparent'></div>
      </div>

    </div>
  )
}

export default Hero