import React from 'react';
import { assets } from '../assets/assets';

const NewHero = ({ scrollHandler }) => {
  return (
    <div className="w-full min-h-screen  lg:h-[100vh] bg-[#FDFCFB] border-b-8 border-[#BC002D] py-10 lg:py-0 overflow-hidden relative select-none flex flex-col items-center justify-center font-sans">
      
      {/* --- LAYER 0: ARCHIVAL GRID & MAP --- */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* --- LAYER 1: BRAND COLOR STRIPES --- */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#BC002D]/5 -skew-x-12 transform origin-top pointer-events-none"></div>

      {/* --- LAYER 2: TOP BADGES (Registry Style) --- */}
      <div className="absolute top-12 left-10 z-50 hidden lg:block">
        <div className="bg-[#BC002D] text-white px-4 py-1 font-black text-[10px] tracking-[0.3em] shadow-xl transform -rotate-2">
          OFFICIAL REGISTRY / 2026
        </div>
      </div>

      {/* --- LAYER 3: CENTRAL TYPOGRAPHY --- */}
      <div className="relative z-40 text-center flex flex-col items-center gap-2 px-4">
        
        {/* Archival Status Badge */}
        <div className="inline-flex items-center gap-3 bg-white border-2 border-black px-5 py-2 mb-6 shadow-[4px_4px_0px_0px_rgba(188,0,45,1)]">
          <div className="w-2 h-2 bg-[#BC002D] rounded-full animate-pulse"></div>
          <span className="text-[10px]  font-black uppercase tracking-widest text-black">
            PhilaBasket Digital Archive
          </span>
        </div>

        {/* The Title: High-Contrast & Bold */}
        <div className="relative">
          <h1 className="text-6xl sm:text-9xl lg:text-[13rem] font-black text-[#1A1A1A] tracking-tighter leading-none">
            PHILA<span className="text-[#BC002D]">B</span>ASKET
          </h1>
          <div className="absolute -top-6 -right-12 hidden lg:block">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#BC002D] flex items-center justify-center rotate-12 opacity-40">
                <span className="text-[8px] font-bold text-[#BC002D]">POSTAGE PAID</span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black text-[#BC002D] tracking-tighter uppercase mt-[-10px]">
          The World of Philately
        </h2>

        {/* Call to Action: The Wax Seal Button */}
        <button 
          onClick={scrollHandler}
          className="group relative mt-12 flex items-center justify-center transition-transform hover:scale-105"
        >
          <div className="w-28 h-28 sm:w-36 sm:h-36 bg-[#BC002D] rounded-full flex flex-col items-center justify-center text-white shadow-[0_10px_30px_rgba(188,0,45,0.4)] relative z-10 border-4 border-white">
            <span className="font-black text-sm sm:text-lg tracking-tighter">BUY NOW</span>
            <div className="w-10 h-[2px] bg-white/40 mt-1"></div>
            <span className="text-[8px] font-bold mt-1 opacity-80 uppercase">Enter Shop</span>
          </div>
          {/* Pulsing Aura */}
          <div className="absolute inset-0 bg-[#BC002D] rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
        </button>
      </div>

      {/* --- LAYER 4: THE DYNAMIC STAMP COLLAGE --- */}
      <div className="absolute inset-0 z-20 pointer-events-none lg:pointer-events-auto">
        
        {/* Featured Stamp Card 1 (Red Accent) */}
        <div className="absolute top-[10%] right-[10%] w-48 h-60 lg:w-72 lg:h-96 bg-white p-4 shadow-2xl rotate-6 hover:rotate-0 transition-all duration-500 group border-b-8 border-[#BC002D]">
          <PerforatedEdge />
          <div className="w-full h-full bg-gray-100 overflow-hidden relative">
            <img src={assets.main01} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Stamp 1" />
            <div className="absolute top-4 right-4 bg-[#BC002D] text-white text-[10px] font-black px-3 py-1">PREMIUM</div>
          </div>
        </div>

        {/* Featured Stamp Card 2 (Teal Accent) */}
        <div className="absolute bottom-[5%] left-[5%] w-40 h-52 lg:w-64 lg:h-80 bg-white p-4 shadow-2xl -rotate-12 hover:rotate-0 transition-all duration-500 group border-b-8 border-[#2A9D8F]">
          <PerforatedEdge />
          <div className="w-full h-full bg-gray-100 overflow-hidden">
            <img src={assets.main02} className="w-full h-full object-cover" alt="Stamp 2" />
          </div>
        </div>

        {/* Small Floating Details */}
        <div className="absolute top-[40%] left-[8%] hidden lg:block animate-float">
            <div className="w-20 h-20 rounded-full border-4 border-[#BC002D] flex items-center justify-center opacity-30">
                <span className="text-[10px] font-black text-[#BC002D]">AIRMAIL</span>
            </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float { animation: float 5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

// Helper for Perforated Edge Effect
const PerforatedEdge = () => (
  <>
    <div className="absolute -top-2 left-0 right-0 flex justify-around px-2">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="w-2 h-2 bg-[#FDFCFB] rounded-full shadow-inner"></div>
      ))}
    </div>
    <div className="absolute -bottom-2 left-0 right-0 flex justify-around px-2">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="w-2 h-2 bg-[#FDFCFB] rounded-full shadow-inner"></div>
      ))}
    </div>
  </>
);

export default NewHero;