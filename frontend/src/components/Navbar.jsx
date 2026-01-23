import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';

const Navbar = () => {
    const [visible, setVisible] = useState(false);
    const { 
        currency, toggleCurrency, setShowSearch, getCartCount, 
        navigate, token, setToken, setCartItems, 
        userPoints, fetchUserPoints 
    } = useContext(ShopContext);

    useEffect(() => {
        if (token) fetchUserPoints();
    }, [token]);

    const logout = () => {
        navigate('/login');
        localStorage.removeItem('token');
        setToken('');
        setCartItems({});
    }

    // Organized Data Structures
    const CATEGORY_GROUPS = {
        philatelic: {
            title: "STAMP VARIETY",
            items: {
                "MINT & SHEETS": ["Mint Variety", "Miniature Sheets", "SheetLet", "Full Sheet", "Booklet"],
                "SPECIAL ISSUES": ["First Day Cover", "My Stamp", "Presentation Pack", "Definitive"]
            }
        },
        thematic: {
            title: "THEMATIC",
            items: {
                "NATURE & SPORT": ["Animal & WildLife", "Bird Stamps", "Sports Stamps", "Yoga"],
                "CULTURE": ["Cinema on Stamps", "Gandhi Stamps", "Ramayana", "Fairy Tales", "Space"]
            }
        },
        postal: {
            title: "POSTAL HISTORY",
            items: {
                "COVERS": ["Airmail", "Army Postal Cover APC", "Special Cover", "Censored Cover"],
                "STATIONERY": ["Postal Stationery", "Special Cancellation", "First Flight/ AirMail"]
            }
        },
        regions: {
            title: "REGIONS",
            items: {
                "DOMESTIC": ["India"],
                "INTERNATIONAL": ["Asia", "Europe", "Americas", "Foreign Stamps", "United Nations UN"]
            }
        }
    };

    const MegaMenu = ({ menuData }) => (
        <div className='group relative flex flex-col items-center gap-1 cursor-pointer'>
            <div className='hover:text-red-600 transition-colors duration-300 px-2 flex items-center gap-1.5'>
                <p className='text-[13px] font-bold tracking-[0.15em] uppercase'>{menuData.title}</p>
                <img src={assets.dropdown_icon} className='w-2 opacity-50 rotate-90 transition-transform duration-300' alt="" />
                <hr className='absolute bottom-[-15px] left-0 w-full border-none h-[2px] bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300' />
            </div>
            
            {/* Dropdown Panel */}
            <div className='absolute top-full left-0 pt-6 hidden group-hover:block z-[110]'>
                <div className='bg-white shadow-2xl border-t-4 border-red-600 p-8 flex gap-10 w-max min-w-[400px] animate-in fade-in slide-in-from-top-2 duration-300'>
                    {Object.entries(menuData.items).map(([groupName, items], idx) => (
                        <div key={idx} className='flex flex-col min-w-[160px]'>
                            <h3 className='text-[10px] font-black text-gray-400 mb-4 tracking-[0.2em] border-b border-gray-100 pb-2 uppercase'>
                                {groupName}
                            </h3>
                            <div className='flex flex-col gap-2.5'>
                                {items.map((item, i) => (
                                    <Link 
                                        key={i} 
                                        onClick={() => window.scrollTo(0,0)}
                                        to={`/collection?category=${encodeURIComponent(item)}`}
                                        className='text-[11px] text-gray-700 hover:text-red-600 hover:translate-x-1 transition-all duration-200 font-semibold uppercase'
                                    >
                                        {item}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    {/* Featured Promo Section */}
                    <div className='hidden lg:flex flex-col w-44 bg-gray-50 p-4 border border-gray-100 rounded-sm'>
                        <p className='text-[9px] font-black text-red-600 mb-2 uppercase tracking-tighter'>Collector's Choice</p>
                        <Link to='/collection?category=Rare'>
                        <div className='overflow-hidden rounded-sm mb-3'>
                            <img src={assets.main01} className='w-full h-24 object-cover hover:scale-110 transition-transform duration-500' alt="Featured" />
                        </div>
                        </Link>
                        <Link to='/collection?category=Rare' className='text-[10px] font-black hover:text-red-600 transition-colors uppercase'>Explore Rare Items →</Link>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className='flex items-center justify-between py-6 px-[5%] font-medium relative z-[100] bg-[#efe9e3] border-b border-gray-200/50 shadow-sm'>
            
            {/* LOGO SECTION */}
            <Link to='/' className='flex-shrink-0 group'>
                <div className='flex items-center gap-3'>
                    <img src={assets.logo} className='w-14 lg:w-16 transition-transform group-hover:scale-105' alt="Logo" />
                    <div className='flex flex-col'>
                        <h1 className='text-xl lg:text-2xl font-black text-gray-900 tracking-tighter leading-none'>
                            PHILABASKET<span className='text-red-600'>.</span>
                        </h1>
                        <p className='text-[7px] lg:text-[8px] text-gray-500 font-bold uppercase tracking-[0.4em] mt-1'>The Philatelic Archive</p>
                    </div>
                </div>
            </Link>

            {/* CENTRAL NAVIGATION */}
            <nav className='hidden xl:flex items-center gap-6'>
                <ul className='flex items-center gap-6'>
                    <NavLink to='/' className='flex flex-col items-center gap-1 group relative'>
                        <p className='text-[13px] font-bold tracking-widest uppercase'>HOME</p>
                        <hr className='absolute bottom-[-15px] left-0 w-full border-none h-[2px] bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300' />
                    </NavLink>

                    <MegaMenu menuData={CATEGORY_GROUPS.philatelic} />
                    <MegaMenu menuData={CATEGORY_GROUPS.thematic} />
                    <MegaMenu menuData={CATEGORY_GROUPS.postal} />
                    <MegaMenu menuData={CATEGORY_GROUPS.regions} />

                    <NavLink to='/about' className='flex flex-col items-center gap-1 group relative'>
                        <p className='text-[13px] font-bold tracking-widest uppercase'>BLOGS</p>
                        <hr className='absolute bottom-[-15px] left-0 w-full border-none h-[2px] bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300' />
                    </NavLink>
                </ul>
            </nav>

            {/* RIGHT SIDE ACTIONS */}
            <div className='flex items-center gap-4 lg:gap-6'>
                {token && (
                    <div className='hidden md:flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-orange-200'>
                        <div className='w-2 h-2 bg-orange-500 rounded-full animate-pulse'></div>
                        <span className='text-[10px] font-black text-orange-700 uppercase'>{userPoints} PTS</span>
                    </div>
                )}

                <div className='flex items-center gap-4'>
                    <img onClick={() => { setShowSearch(true); navigate('/collection') }} src={assets.search_icon} className='w-5 cursor-pointer hover:opacity-70 transition-all' alt="Search" />
                    
                    <div className='group relative'>
                        <img onClick={() => token ? null : navigate('/login')} className='w-5 cursor-pointer hover:opacity-70 transition-all' src={assets.profile_icon} alt="Profile" />
                        {token && (
                            <div className='group-hover:block hidden absolute right-0 pt-4 w-48'>
                                <div className='bg-white shadow-xl border border-gray-100 p-4 rounded-sm'>
                                    <p className='text-[9px] font-bold text-gray-400 uppercase mb-3 tracking-widest'>Collector Account</p>
                                    <p onClick={()=>navigate('/orders')} className='text-[11px] font-bold cursor-pointer hover:text-red-600 py-2 border-b border-gray-50 uppercase'>My Orders</p>
                                    <p onClick={logout} className='text-[11px] font-bold cursor-pointer hover:text-red-600 py-2 text-gray-400 uppercase'>Logout</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <select 
                        value={currency} 
                        onChange={(e) => toggleCurrency(e.target.value)} 
                        className='bg-white/50 text-[10px] font-black border-none rounded-sm px-1 py-1 cursor-pointer focus:ring-0 uppercase'
                    >
                        <option value="INR">₹ INR</option>
                        <option value="USD">$ USD</option>
                    </select>

                    <Link to='/cart' className='relative group'>
                        <img src={assets.cart_icon} className='w-5' alt="Cart" />
                        <p className='absolute -right-1.5 -top-1.5 w-4 h-4 text-center leading-4 bg-red-600 text-white rounded-full text-[9px] font-bold'>{getCartCount()}</p>
                    </Link> 

                    <img onClick={() => setVisible(true)} src={assets.menu_icon} className='w-6 cursor-pointer xl:hidden' alt="Menu" /> 
                </div>
            </div>
        </div>
    )
}

export default Navbar;