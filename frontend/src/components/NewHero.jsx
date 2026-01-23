import React from 'react';
import { assets } from '../assets/assets';

const NewHero = () => {
  return (
    /* Changed 'justify-center' to 'justify-start' and added padding-top 'pt-20' */
    <div className='w-full h-screen bg-[#FDFBF7] relative overflow-hidden select-none flex flex-col items-center justify-start pt-10 sm:pt-12 border-b border-gray-200'>
      
      {/* Decorative Background Stamp (Faded Right) */}
      <div className='absolute -right-20 top-1/4 w-[30%] opacity-[0.03] rotate-12 pointer-events-none'>
        <img src={assets.main02} alt="" className='w-full h-auto grayscale' />
      </div>

      {/* --- HERO TEXT CONTENT --- */}
      <div className='relative z-20 text-center px-4'>
        {/* Subtitle - Reduced margin-bottom 'mb-2' */}
        {/* <p className='text-[10px] sm:text-xs uppercase tracking-[0.4em] text-gray-400 mb-2 font-medium'>
          Est. 1840 • Premium Philately
        </p> */}

        {/* Main Heading Container */}
        <div className='relative inline-block top-[20%]'>
          {/* Large Background Serif Text - Reduced scale slightly for better fit */}
          <h1 className='text-6xl top-[20%] sm:text-8xl lg:text-[10rem] font-serif text-[#403126] tracking-tight leading-[0.9] opacity-100' style={{ fontFamily: "'Playfair Display', serif" }}>
            COLLECTION
          </h1>

          {/* Overlapping Script Text - Adjusted 'top' to move it up slightly */}
          <h2 
  className='absolute top-[3%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl sm:text-7xl lg:text-[5rem] text-[#E63946] z-30 opacity-100 select-none' 
  style={{ 
    fontFamily: "'Great Vibes', cursive",
    letterSpacing: "0.05em", // Tightens the connection between script letters
    textShadow: "0 0 20px rgba(253, 251, 247, 0.97)" // Creates a soft "halo" to keep it readable over the brown text
  }}
>
  elegant
</h2>
        </div>
      </div>

      {/* --- FLOATING STAMP IMAGES --- */}
      <div className='absolute inset-0 z-10 pointer-events-none'>
        
        {/* Main Center Stamp (Floral) - Adjusted top position to 'top-[40%]' */}
        <div className='absolute left-1/2 -top-[3%] -translate-x-1/2 w-[75%] sm:w-[50%] lg:w-[30%] z-20 drop-shadow-[#FDFBF7] border-[10px] border-[#FDFBF7]  transition-all duration-700'>
            <img draggable="false" className='w-full h-auto' src={assets.main01} alt="Floral Stamp" />
        </div>

        {/* Left Stamp (Pink Flowers) - Moved up with 'bottom-[25%]' */}
        <div className='absolute left-[4%] lg:left-[10%] bottom-[23%] lg:bottom-[32%] w-[38%] sm:w-[28%] lg:w-[25%] z-10 drop-shadow-2xl border-[6px] border-white '>
            <img draggable="false" className='w-full h-auto' src={assets.main06} alt="Pink Flower Stamp" />
            <div className='absolute -top-8 left-0 bg-white/90 backdrop-blur-sm px-2 py-1 text-[9px] tracking-widest font-bold text-gray-800 uppercase border border-gray-100 shadow-sm'>
                Rare Stamps of Pre 1800
            </div>
        </div>

        {/* Right Stamp (Blue Portrait) - Moved up with 'bottom-[15%]' */}
        <div className='absolute right-[4%] lg:right-[10%] bottom-[20%] lg:bottom-[32%] w-[32%] sm:w-[22%] lg:w-[25%] z-10 drop-shadow-2xl border-[6px] border-white '>
            <img draggable="false" className='w-full h-auto' src={assets.main04} alt="Blue Portrait Stamp" />
            <div className='absolute -top-8 right-0 bg-white/90 backdrop-blur-sm px-2 py-1 text-[9px] tracking-widest font-bold text-gray-800 uppercase border border-gray-100 shadow-sm'>
                High Value Stamps
            </div>
        </div>
      </div>

      {/* --- CTA BOTTOM --- */}
      <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-50'>
          <div className='flex items-center gap-4 group cursor-pointer'>
            <span className='h-[1px] w-8 bg-gray-300 group-hover:w-16 group-hover:bg-[#E63946] transition-all duration-500'></span>
            <p className='text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 group-hover:text-black transition-colors'>
                Discover More
            </p>
            <span className='h-[1px] w-8 bg-gray-300 group-hover:w-16 group-hover:bg-[#E63946] transition-all duration-500'></span>
          </div>
      </div>

    </div>
  );
};

export default NewHero;