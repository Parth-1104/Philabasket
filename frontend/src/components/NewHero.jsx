import React from 'react';
import { assets } from '../assets/assets';

const NewHero = ({ scrollHandler }) => {
  return (
    <div className="relative w-full max-h-[25vh] lg:min-h-[50vh] pt-[8vh] lg:pt-[12vh] bg-white overflow-hidden flex flex-row items-center font-sans">
      
      {/* --- CONTENT AREA (Left Side) --- */}
      <div className="relative z-40 w-[55%] lg:w-1/2 px-4 md:px-16 lg:px-24 flex flex-col items-start text-left">
        
        {/* Scaled Headlines: text-xl on mobile, text-7xl on desktop */}
        <h1 className="text-xl md:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight drop-shadow-sm">
          It’s Not Just Paper, <br />
          <span className="text-[#a07b17]">It’s A Piece Of History</span>
        </h1>

        {/* Scaled Paragraph: hidden on very small phones to keep it clean, or text-[10px] */}
        <p className="mt-2 lg:mt-6 text-gray-600 max-w-[180px] lg:max-w-md text-[9px] lg:text-lg leading-relaxed font-medium">
        Acquire the Unwritten Chapters of History.
        </p>

        {/* <button 
          onClick={scrollHandler}
          className="mt-4 lg:mt-8 px-4 lg:px-8 py-2 lg:py-4 bg-black text-white text-[8px] lg:text-xs font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] hover:bg-[#bd002d] transition-all duration-500 rounded-sm"
        >
          Explore
        </button> */}
      </div>

      {/* --- GRAPHIC AREA (Right Side) --- */}
      <div className="relative w-[45%] lg:w-1/2 h-[35vh] lg:h-[50vh] flex items-center justify-center">
        
        {/* Curved Background: Positioned to stay strictly on the right half */}
        <div className="absolute 
          right-[-20%] lg:right-[10vw] top-1/2 -translate-y-1/2 
          h-[80%] lg:h-[90%] w-[120%] 
          bg-[#bd002d] 
          rounded-l-[80px] lg:rounded-l-[600px] 
          transform translate-x-[10%] lg:translate-x-[40%] 
          transition-all duration-1000">
        </div>

        {/* Mini Stamp Grid for Mobile View */}
        <div className="relative z-30 grid grid-cols-2 gap-1.5    lg:gap-1 p-2 w-full transform scale-5 lg:scale-90 translate-x-4 lg:translate-x-0">
          
          <div className="lg:relative lg:left-[9vw] p-0.5 lg:top-[1vh] shadow-md self-end justify-self-end w-fit transform ">
            <img src={assets.gandhiji} alt="Gandhi" className="w-12 lg:w-36 border border-gray-100" />
          </div>

          <div className="lg:hidden lg:right-[-5vw] lg:top-[3vh]  p-0.5 lg:p-1.5 shadow-md self-end w-fit transform ">
            <img src={assets.pandit} alt="Pandit" className="w-12 lg:w-36 border border-gray-100" />
          </div>

          <div className="lg:h-[12vh] col-span-2  p-1 lg:p-2 lg:w-[24vw] shadow-lg mx-auto w-full">
            <img src={assets.widemiss} alt="Featured" className="w-full h-auto border border-gray-100" />
          </div>

          <div className="lg:relative lg:bottom-[1vh] lg:left-[21vw]   p-0.5 lg:p-1.5 shadow-md justify-self-end w-fit transform -translate-y-4 lg:-translate-y-20">
            <img src={assets.vidhan} alt="Vidhan" className="w-12 lg:w-36 border border-gray-100" />
          </div>

          <div className="lg:relative lg:bottom-[22vh] lg:right-[-11vw] p-0.5 lg:p-1.5 shadow-md w-fit h-fit transform -translate-y-4 lg:-translate-y-20">
            <img src={assets.baldin} alt="Baldin" className="w-12 lg:w-36 border border-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewHero;