import React from 'react';
import { assets } from '../assets/assets';

const NewHero = ({ scrollHandler }) => {
  return (
    <div className="relative w-full min-h-[40vh] lg:max-h-[50vh] pt-[8vh] lg:pt-[10vh] bg-white overflow-hidden flex flex-col lg:flex-row items-center font-sans">
      
      {/* --- CONTENT AREA --- */}
      {/* On mobile: z-40 to stay above the background graphic */}
      <div className="relative z-40 w-full lg:w-1/2 px-8 md:px-16 lg:px-24 flex flex-col items-start text-left mb-10 lg:mb-0">
        
        {/* Headlines */}
        <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight w-full drop-shadow-sm">
          It’s Not Just Paper, <br />
          <span className="text-[#a07b17] lg:text-[#a07b17] text-[#a07b17]  lg:bg-transparent bg-transparent px-1">It’s A Piece Of History</span>
        </h1>

        <p className="mt-6 text-gray-600 lg:text-gray-500 max-w-md text-base lg:text-lg leading-relaxed font-medium lg:font-normal">
          Every specimen in the PhilaBasket archive tells a story of a bygone era. Curate your legacy, one stamp at a time.
        </p>

        <button 
          onClick={scrollHandler}
          className="mt-8 px-8 py-4 bg-black text-white text-xs font-black uppercase tracking-[0.3em] hover:bg-[#bd002d] transition-all duration-500 rounded-sm"
        >
          Explore Collection
        </button>
      </div>

      {/* --- GRAPHIC AREA --- */}
      {/* On mobile: absolute positioning to act as the background */}
      <div className="absolute lg:relative inset-0 lg:inset-auto w-full lg:w-1/2 lg:h-[50vh] flex items-center justify-center pointer-events-none lg:pointer-events-auto">
        
        {/* Curved Background Shape */}
        {/* Mobile: rounded-l-[100px], Desktop: rounded-l-[600px] */}
        <div className="absolute right-[-20%] lg:right-[10vw] top-1/2 -translate-y-1/2 h-[90%] w-[140%] lg:w-[120%] bg-[#bd002d] rounded-l-[150px] lg:rounded-l-[600px] transform translate-x-1/2 lg:translate-x-[40%] transition-all duration-1000 ease-in-out opacity-90 lg:opacity-100"></div>

        {/* Aligned Stamp Grid */}
        {/* Hidden on very small screens or made very subtle to focus on text */}
        <div className="relative z-30 grid grid-cols-2 gap-4 lg:gap-[5] p-9 w-full max-w-[520px] lg:pb-5 lg:max-w-[550px] opacity-70 lg:opacity-100 transform scale-75 lg:scale-90 translate-x-10 lg:translate-x-0">
          
          <div className="bg-white p-1.5 shadow-xl self-end justify-self-end w-fit transform -rotate-1">
            <img src={assets.gandhiji} alt="Gandhi" className="w-20 lg:w-36 border border-gray-100 block" />
          </div>

          <div className="bg-white p-1.5 shadow-xl self-end w-fit transform rotate-2">
            <img src={assets.pandit} alt="Pandit" className="w-20 lg:w-36 border border-gray-100 block" />
          </div>

          <div className="col-span-2 bg-white p-2 shadow-2xl mx-auto w-full transform">
            <img src={assets.wide} alt="Featured" className="w-full h-auto block object-cover border border-gray-100" />
          </div>

          <div className="bg-white p-1.5 shadow-xl justify-self-end w-fit transform -translate-y-10 lg:-translate-y-20">
            <img src={assets.vidhan} alt="Vidhan" className="w-20 lg:w-36 border border-gray-100 block" />
          </div>

          <div className="bg-[#bd002d] p-1.5 shadow-xl w-fit transform -translate-y-10 lg:-translate-y-20">
            <img src={assets.baldin} alt="Baldin" className="w-20 lg:w-36 h-fit border border-gray-100 block object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewHero;