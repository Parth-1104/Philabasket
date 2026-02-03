import React from 'react';
import { assets } from '../assets/assets';

const NewHero = ({ scrollHandler }) => {
  return (
    <div className="relative w-full max-h-[50vh] pt-[10vh] bg-white overflow-hidden flex flex-col lg:flex-row items-center font-sans">
      
      {/* --- LEFT CONTENT AREA --- */}
      <div className="relative z-20 w-full lg:w-1/2 px-10 lg:px-24 flex flex-col items-start text-left">
        
        {/* Top Logo / Stamp Icon */}
        <div className="mb-12">
          <div className="w-16 h-16 border-2 border-amber-500 rounded-full flex items-center justify-center">
            <div className="w-12 h-12 border border-amber-400 rounded-full flex items-center justify-center text-amber-600 font-serif font-bold italic">
              PB
            </div>
          </div>
        </div>

        {/* Headlines */}
        <h1 className="text-5xl  lg:text-7xl font-bold text-gray-900 leading-tight w-full">
          It’s Not Just Paper, <br />
          <span className="text-[#a07b17]">It’s A Piece Of History</span>
        </h1>

        <p className="mt-8 text-gray-500 max-w-md text-lg leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Curate your legacy, one stamp at a time.
        </p>

        {/* CTA Button */}
        <button 
          onClick={scrollHandler}
          className="mt-10 px-10 py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg tracking-widest uppercase text-sm"
        >
          Learn More
        </button>

        {/* Social Icons (Bottom Left) */}
        <div className="mt-16 flex gap-4 opacity-70">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs">f</div>
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs">𝕏</div>
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs">in</div>
        </div>
      </div>

      
{/* --- RIGHT GRAPHIC AREA --- */}
{/* --- RIGHT GRAPHIC AREA --- */}
<div className="relative w-full p-[20vh]  top-[10vh] lg:w-1/2 h-[500px] ml-[20vw] lg:h-screen flex items-center justify-center lg:mt-5 mt-10">
  
  {/* Curved Background Shape - Adjusted for better curve flow */}
  <div className="absolute right-[10vw] top-1/2 -translate-y-1/2 lg:top-[55%] h-[80%] lg:h-[90%] w-[160%] lg:w-[120%] bg-[#bd002d] rounded-l-[100px] lg:rounded-l-[600px] transform translate-x-1/2 lg:translate-x-[40%] transition-all duration-700"></div>

  {/* Aligned Stamp Grid with subtle offsets for a "hand-placed" feel */}
  <div className="relative z-30 grid grid-cols-2 gap-4 lg:gap-6 p-4 w-full max-w-[380px] lg:max-w-[500px]">
    
    {/* Top Left: Gandhiji - Pulled slightly down */}
    <div className="bg-white p-1.5 shadow-xl self-end justify-self-end w-fit transform -rotate-1 lg:mt-8">
      <img src={assets.gandhiji} alt="Gandhi" className="w-24 lg:w-36 border border-gray-100 block" />
    </div>

    {/* Top Right: Pandit - Tilted slightly */}
    <div className="bg-white p-1.5 shadow-xl self-end w-fit transform rotate-2">
      <img src={assets.pandit} alt="Pandit" className="w-24 lg:w-36 border border-gray-100 block" />
    </div>

    {/* Center Wide Stamp: Spans 2 Columns - Added more padding for impact */}
    <div className="col-span-2 bg-white p-2 shadow-2xl mx-auto w-full transform hover:scale-[1.02] transition-transform duration-300">
      <img 
        src={assets.wide} 
        alt="Featured Stamp" 
        className="w-full h-auto block object-cover border border-gray-100" 
      />
    </div>

    {/* Bottom Left: Vidhan - Pushed left slightly */}
    <div className=" relative left-[19vw] bottom-[25vh] bg-white p-1.5 shadow-xl justify-self-end w-fit transform  lg:-translate-x-4">
      <img src={assets.vidhan} alt="Vidhan" className="w-24 lg:w-36 border border-gray-100 block" />
    </div>

    <div className="relative right-[18vw] bottom-[11vh] bg-white p-1.5 shadow-xl justify-self-end w-fit transform rotate-1 lg:-translate-x-4 h-fit">
      <img src={assets.bal69} alt="Vidhan" className="w-24 lg:w-36 border border-gray-100 block" />
    </div>
    <div className="relative right-[9vw] bottom-[55vh] bg-white p-1.5 shadow-xl justify-self-end w-fit transform  lg:-translate-x-4 h-fit">
      <img src={assets.bal} alt="Vidhan" className="w-24 lg:w-36 border border-gray-100 block" />
    </div>

    {/* Bottom Right: Baldin - Dark frame for contrast */}
    <div className="relative right-[-5vw] bottom-[30vh] bg-[#bd002d] p-1.5 shadow-xl w-fit transform  h-fit">
      <img src={assets.baldin} alt="Baldin" className="w-24 lg:w-36 h-fit border border-gray-100 block object-contain" />
    </div>

  </div>
</div>

      {/* Floating Navigation (Top Right) */}


    </div>
  );
};

export default NewHero;