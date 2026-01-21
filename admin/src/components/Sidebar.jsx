import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-r border-gray-100 bg-white'>
        <div className='flex flex-col gap-2 pt-8 pl-[15%]'>
            
            {/* Sidebar Header Hint */}
            <p className='text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 hidden md:block'>
              Management
            </p>

            <NavLink 
              className={({isActive}) => `flex items-center gap-3 px-4 py-3 transition-all duration-200 border-r-4 ${isActive ? 'bg-red-50 border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:bg-gray-50'}`} 
              to="/dashboard"
            >
                <img draggable="false" className='w-5 h-5 opacity-80' src={assets.order_icon} alt="" />
                <p className='hidden md:block font-bold text-xs uppercase tracking-wider'>Dashboard</p>
            </NavLink>

            <NavLink 
              className={({isActive}) => `flex items-center gap-3 px-4 py-3 transition-all duration-200 border-r-4 ${isActive ? 'bg-red-50 border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:bg-gray-50'}`} 
              to="/add"
            >
                <img draggable="false" className='w-5 h-5 opacity-80' src={assets.add_icon} alt="" />
                <p className='hidden md:block font-bold text-xs uppercase tracking-wider'>Add Stamps</p>
            </NavLink>

            <NavLink 
              className={({isActive}) => `flex items-center gap-3 px-4 py-3 transition-all duration-200 border-r-4 ${isActive ? 'bg-red-50 border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:bg-gray-50'}`} 
              to="/list"
            >
                <img draggable="false" className='w-5 h-5 opacity-80' src={assets.order_icon} alt="" />
                <p className='hidden md:block font-bold text-xs uppercase tracking-wider'>Inventory List</p>
            </NavLink>

            <NavLink 
              className={({isActive}) => `flex items-center gap-3 px-4 py-3 transition-all duration-200 border-r-4 ${isActive ? 'bg-red-50 border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:bg-gray-50'}`} 
              to="/orders"
            >
                <img draggable="false" className='w-5 h-5 opacity-80' src={assets.order_icon} alt="" />
                <p className='hidden md:block font-bold text-xs uppercase tracking-wider'>Orders</p>
            </NavLink>

        </div>
    </div>
  )
}

export default Sidebar