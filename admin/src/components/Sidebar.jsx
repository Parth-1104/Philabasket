import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  Package, 
  FileEdit, 
  LibraryBig 
} from 'lucide-react'

const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-r border-gray-100 bg-white'>
        <div className='flex flex-col gap-2 pt-8 pl-[15%]'>
            
            <p className='text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4 hidden md:block'>
              Sovereign Ops
            </p>

            {/* Dashboard Link */}
            <NavLink 
              to="/dashboard"
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 transition-all duration-300 border-r-4 ${
                  isActive ? 'bg-[#BC002D]/5 border-[#BC002D] text-[#BC002D]' : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <LayoutDashboard size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <p className='hidden md:block font-black text-[10px] uppercase tracking-widest'>Dashboard</p>
                </>
              )}
            </NavLink>

            {/* Orders Link */}
            <NavLink 
              to="/orders"
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 transition-all duration-300 border-r-4 ${
                  isActive ? 'bg-[#BC002D]/5 border-[#BC002D] text-[#BC002D]' : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Package size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <p className='hidden md:block font-black text-[10px] uppercase tracking-widest'>Orders</p>
                </>
              )}
            </NavLink>

            <p className='text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mt-8 mb-4 hidden md:block'>
              Inventory
            </p>


            <NavLink 
              to="/media"
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 transition-all duration-300 border-r-4 ${
                  isActive ? 'bg-[#BC002D]/5 border-[#BC002D] text-[#BC002D]' : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <PlusCircle size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <p className='hidden md:block font-black text-[10px] uppercase tracking-widest'>Media </p>
                </>
              )}
            </NavLink>


            <NavLink 
              to="/add"
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 transition-all duration-300 border-r-4 ${
                  isActive ? 'bg-[#BC002D]/5 border-[#BC002D] text-[#BC002D]' : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <PlusCircle size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <p className='hidden md:block font-black text-[10px] uppercase tracking-widest'>Add Product</p>
                </>
              )}
            </NavLink>

            <NavLink 
              to="/list"
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 transition-all duration-300 border-r-4 ${
                  isActive ? 'bg-[#BC002D]/5 border-[#BC002D] text-[#BC002D]' : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <ClipboardList size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <p className='hidden md:block font-black text-[10px] uppercase tracking-widest'>Inventory List</p>
                </>
              )}
            </NavLink>

            <p className='text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mt-8 mb-4 hidden md:block'>
              Registry Intel
            </p>

            <NavLink 
              to="/blog"
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 transition-all duration-300 border-r-4 ${
                  isActive ? 'bg-[#BC002D]/5 border-[#BC002D] text-[#BC002D]' : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <FileEdit size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <p className='hidden md:block font-black text-[10px] uppercase tracking-widest'>Write Blog</p>
                </>
              )}
            </NavLink>

            <NavLink 
              to="/list-blog"
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 transition-all duration-300 border-r-4 ${
                  isActive ? 'bg-[#BC002D]/5 border-[#BC002D] text-[#BC002D]' : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <LibraryBig size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <p className='hidden md:block font-black text-[10px] uppercase tracking-widest'>List Blog</p>
                </>
              )}
            </NavLink>



            <NavLink 
              to="/mail"
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 transition-all duration-300 border-r-4 ${
                  isActive ? 'bg-[#BC002D]/5 border-[#BC002D] text-[#BC002D]' : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <LibraryBig size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <p className='hidden md:block font-black text-[10px] uppercase tracking-widest'> Bulk Mail</p>
                </>
              )}
            </NavLink>
            <NavLink 
              to="/news"
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 transition-all duration-300 border-r-4 ${
                  isActive ? 'bg-[#BC002D]/5 border-[#BC002D] text-[#BC002D]' : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <LibraryBig size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <p className='hidden md:block font-black text-[10px] uppercase tracking-widest'>Newsletter</p>
                </>
              )}
            </NavLink>

            {/* <NavLink 
              to="/edit-blog"
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 transition-all duration-300 border-r-4 ${
                  isActive ? 'bg-[#BC002D]/5 border-[#BC002D] text-[#BC002D]' : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <LibraryBig size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <p className='hidden md:block font-black text-[10px] uppercase tracking-widest'>Edit Blog</p>
                </>
              )}
            </NavLink> */}

        </div>
    </div>
  )
}

export default Sidebar