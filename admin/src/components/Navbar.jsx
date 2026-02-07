import React from 'react'
import { assets } from '../assets/assets'

const Navbar = ({ setToken }) => {
  return (
    <nav className='flex items-center py-4 px-[6%] justify-between bg-white border-b border-gray-100 sticky top-0 z-50'>
      
      {/* --- BRANDING SECTION --- */}
      <div className='flex items-center gap-3'>
        <div className='relative'>
          <img 
            draggable="false" 
            className='w-12 h-12 object-contain' 
            src='/Logo-5.png' 
            alt="PhilaBasket Logo" 
          />
          {/* Subtle "Admin" badge to distinguish from the shop */}
          <span className='absolute -bottom-1 -right-1 bg-red-600 text-white text-[8px] font-bold px-1 rounded-sm tracking-tighter'>
            ADMIN
          </span>
        </div>
        
        <div className='flex flex-col'>
          <h1 className='text-xl font-black text-gray-900 tracking-tighter leading-none'>
            PHILABASKET <span className='text-red-600'>.</span>
          </h1>
          <p className='text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1'>
            Stamp Archive Management
          </p>
        </div>
      </div>

      {/* --- ACTIONS SECTION --- */}
      <div className='flex items-center gap-6'>
        <div className='hidden sm:flex flex-col items-end'>
          <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>System Status</p>
          <div className='flex items-center gap-1.5'>
            <div className='w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse'></div>
            <p className='text-[11px] font-bold text-gray-700'>Server Online</p>
          </div>
        </div>

        <button 
          onClick={() => setToken('')} 
          className='bg-black hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-sm text-[10px] uppercase tracking-widest transition-all duration-300 shadow-sm active:scale-95'
        >
          Logout Session
        </button>
      </div>

    </nav>
  )
}

export default Navbar