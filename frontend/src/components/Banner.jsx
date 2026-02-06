import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Banner = ({ scrollHandler }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    { image: 'banner.png', title: "FDC Festival" },
    { image: 'phila.png', title: "Royal Collection" },
    // { image: assets.main03, title: "Rare Global" }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    /* Container: Full width, limited height. 
       Mobile: auto height based on aspect ratio. Desktop: max height of 60vh to 75vh */
       <div className='relative -top-[5vh] sm:top-0 w-full overflow-hidden select-none bg-white h-[30vh] md:aspect-auto md:h-[60vh] lg:h-[50vh] group'>
      
      {/* Slide Content */}
      {banners.map((slide, index) => (
        <div 
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          {/* The Image Logic:
            - w-full h-full ensures it fills the container.
            - object-fill or object-contain ensures the full image is visible.
            - Based on your screenshots, the image is tailored to fit the banner width.
          */}
          <img 
              draggable="false" 
              className='w-full h-full object-contain md:object-cover' 
              src={slide.image}
              alt={slide.title} 
          />
        </div>
      ))}

      {/* Minimalist Navigation Arrows - Visible on Hover */}
      <div className='absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none'>
        <button onClick={prevSlide} className='pointer-events-auto p-2 bg-black/10 hover:bg-black/30 rounded-full text-white transition-all'>
            <ChevronLeft size={30} />
        </button>
        <button onClick={nextSlide} className='pointer-events-auto p-2 bg-black/10 hover:bg-black/30 rounded-full text-white transition-all'>
            <ChevronRight size={30} />
        </button>
      </div>

      {/* Pagination Indicators - Bottom Center */}
      <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30'>
        {banners.map((_, i) => (
          <div 
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`cursor-pointer transition-all duration-500 h-1 rounded-full ${i === currentSlide ? 'w-8 bg-[#BC002D]' : 'w-2 bg-black/20'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;