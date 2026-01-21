import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';

const Navbar = () => {

    const [visible, setVisible] = useState(false);
    
    // Destructured everything needed from ShopContext
    // userPoints and fetchUserPoints are now global
    const { 
        currency, toggleCurrency, setShowSearch, getCartCount, 
        navigate, token, setToken, setCartItems, 
        userPoints, fetchUserPoints 
    } = useContext(ShopContext);

    // Fetch global points whenever the token (user login state) changes
    useEffect(() => {
        if (token) {
            fetchUserPoints();
        }
    }, [token]);

    const logout = () => {
        navigate('/login')
        localStorage.removeItem('token')
        setToken('')
        setCartItems({})
    }

    return (
        <div className='flex items-center justify-between py-5 font-medium relative z-[100] bg-white'>
            
            <Link to='/'><img src={assets.logo} className='w-36' alt="Logo" /></Link>

            <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
                <NavLink to='/' className='flex flex-col items-center gap-1'>
                    <p>HOME</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
                </NavLink>
                <NavLink to='/collection' className='flex flex-col items-center gap-1'>
                    <p>COLLECTION</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
                </NavLink>
                <NavLink to='/about' className='flex flex-col items-center gap-1'>
                    <p>ABOUT</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
                </NavLink>
                <NavLink to='/contact' className='flex flex-col items-center gap-1'>
                    <p>CONTACT</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
                </NavLink>
            </ul>

            <div className='flex items-center gap-6'>
                
                {/* Global Reward Points Display */}
                {token && (
                    <div className='hidden md:flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full border border-orange-200'>
                        <img src={assets.star_icon} className='w-3' alt="Points" />
                        <span className='text-xs font-bold text-orange-600'>{userPoints} PTS</span>
                    </div>
                )}

                <img draggable="false" onClick={() => { setShowSearch(true); navigate('/collection') }} src={assets.search_icon} className='w-5 cursor-pointer' alt="Search" />
                
                <div className='group relative'>
                    <img draggable="false" onClick={() => token ? null : navigate('/login')} className='w-5 cursor-pointer' src={assets.profile_icon} alt="Profile" />
                    {token && 
                    <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4 '>
                        <div className='flex flex-col gap-2 w-44 py-3 px-5 bg-slate-100 text-gray-500 rounded shadow-lg'>
                            {/* Shows global point balance in dropdown */}
                            <p className='text-[10px] font-bold text-orange-600 border-b pb-1 uppercase tracking-tighter'>Balance: {userPoints} Points</p>
                            <p className='cursor-pointer hover:text-black mt-1'>My Profile</p>
                            <p onClick={() => navigate('/orders')} className='cursor-pointer hover:text-black'>Orders</p>
                            <p onClick={logout} className='cursor-pointer hover:text-black'>Logout</p>
                        </div>
                    </div>}
                </div> 

                <select value={currency} onChange={(e) => toggleCurrency(e.target.value)} className='bg-transparent text-sm border border-gray-300 rounded px-1 outline-none cursor-pointer'>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                </select>

                <Link to='/cart' className='relative'>
                    <img draggable="false" src={assets.cart_icon} className='w-5 min-w-5' alt="Cart" />
                    <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>{getCartCount()}</p>
                </Link> 

                <img draggable="false" onClick={() => setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="Menu" /> 
            </div>

            {/* Sidebar menu for small screens */}
            <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
                <div className='flex flex-col text-gray-600'>
                    <div onClick={() => setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer'>
                        <img draggable="false" className='h-4 rotate-180' src={assets.dropdown_icon} alt="Back" />
                        <p>Back</p>
                    </div>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/'>HOME</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/collection'>COLLECTION</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/about'>ABOUT</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/contact'>CONTACT</NavLink>
                </div>
            </div>
        </div>
    )
}

export default Navbar