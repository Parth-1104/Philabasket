import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    { image: assets.banner001 || 'banner.png', title: "FDC Festival" },
    { image: assets.banner002 || 'phila.png', title: "Royal Collection" },
    { image: assets.banner009, title: "Royal Collection" },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className='relative w-full overflow-hidden select-none bg-white group
        /* RESPONSIVE HEIGHT SCALE */
        h-[25vh]       /* Mobile: Short height to prevent huge scrolling */
        sm:h-[35vh]    /* Tablet */
        md:h-[50vh]    /* Small Laptop */
        lg:h-[55vh]    /* Desktop */
        xl:h-[60vh]    /* Ultra-wide */
    '>
      
      {/* Slide Content */}
      {banners.map((slide, index) => (
        <div 
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* IMAGE SCALING LOGIC:
             - object-cover: Ensures the container is ALWAYS filled (no white gaps).
             - object-center: Keeps the middle of the stamp/banner visible on mobile crop.
          */}
          <img 
              draggable="false" 
              className='w-full h-full object-contain object-center sm:object-fill lg:object-contain md:object-contain' 
              src={slide.image}
              alt={slide.title} 
          />
          
          {/* Subtle Gradient Overlay to make navigation/text pop */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-transparent pointer-events-none"></div>
        </div>
      ))}

      {/* Navigation Arrows - Optimized for Touch & Mouse */}
      <div className='absolute inset-0 flex items-center justify-between px-2 md:px-4 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none'>
        <button 
          onClick={prevSlide} 
          className='pointer-events-auto p-1.5 md:p-3 bg-black/20 hover:bg-[#BC002D] backdrop-blur-sm rounded-full text-white transition-all transform hover:scale-110'
        >
            <ChevronLeft className='w-5 h-5 md:w-8 md:h-8' />
        </button>
        <button 
          onClick={nextSlide} 
          className='pointer-events-auto p-1.5 md:p-3 bg-black/20 hover:bg-[#BC002D] backdrop-blur-sm rounded-full text-white transition-all transform hover:scale-110'
        >
            <ChevronRight className='w-5 h-5 md:w-8 md:h-8' />
        </button>
      </div>

      {/* Pagination - Slimmer for better visibility */}
      <div className='absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-3 z-30'>
        {banners.map((_, i) => (
          <button 
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`cursor-pointer transition-all duration-500 h-1 rounded-full ${
              i === currentSlide ? 'w-6 md:w-12 bg-[#BC002D]' : 'w-2 md:w-3 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;