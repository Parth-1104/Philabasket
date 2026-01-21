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

    const CATEGORY_GROUPS = {
        "PHILATELIC ITEMS": [
            "Mint Variety", "First Day Cover", "Miniature Sheets", "Definitive", 
            "SheetLet", "Full Sheet", "Booklet", "My Stamp", "Presentation Pack"
        ],
        "THEMATIC STAMPS": [
            "Animal & WildLife", "Bird Stamps", "Space", "Sports Stamps", 
            "Cinema on Stamps", "Gandhi Stamps", "Ramayana", "Yoga", "Fairy Tales"
        ],
        "POSTAL HISTORY": [
            "Airmail", "Army Postal Cover APC", "Special Cover", "Censored Cover", 
            "Postal Stationery", "Special Cancellation", "First Flight/ AirMail"
        ],
        "REGIONS": [
            "India", "Asia", "Europe", "Americas", "Foreign Stamps", "United Nations UN"
        ]
    };

    const MegaMenu = ({ title, groups }) => (
        <div className='group relative flex flex-col items-center gap-1 cursor-pointer'>
            <div className='hover:text-red-600 transition-colors duration-300 px-2 flex items-center gap-1'>
                <p className='text-[12px] font-bold tracking-widest uppercase'>{title}</p>
                <img src={assets.dropdown_icon} className='w-2 group-hover:rotate-180 transition-transform' alt="" />
                <hr className='absolute bottom-[-10px] left-0 w-full border-none h-[2px] bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300' />
            </div>
            
            <div className='absolute top-full left-1/2 -translate-x-1/2 pt-6 hidden group-hover:block z-[110]'>
                <div className='bg-white shadow-2xl border-t-4 border-red-600 p-8 flex gap-12 w-max max-w-[90vw] animate-in fade-in slide-in-from-top-2 duration-300'>
                    {Object.entries(groups).map(([groupName, items], idx) => (
                        <div key={idx} className='flex flex-col min-w-[150px]'>
                            <h3 className='text-[10px] font-black text-gray-400 mb-4 tracking-[0.2em] border-b pb-2 uppercase'>
                                {groupName}
                            </h3>
                            <div className='flex flex-col gap-2'>
                                {items.map((item, i) => (
                                    <Link 
                                        key={i} 
                                        onClick={() => window.scrollTo(0,0)}
                                        to={`/collection?category=${encodeURIComponent(item)}`}
                                        className='text-[11px] text-gray-600 hover:text-red-600 hover:translate-x-1 transition-all duration-200 font-bold uppercase'
                                    >
                                        {item}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className='hidden lg:flex flex-col w-48 bg-gray-50 p-4 border rounded-sm'>
                        <p className='text-[9px] font-black text-red-600 mb-2 uppercase'>Featured Collection</p>
                        <img src={assets.main01} className='w-full h-24 object-cover rounded-sm mb-3' alt="" />
                        <Link to='/collection?category=Rare' className='text-[10px] font-black hover:underline uppercase'>View Rare Stamps →</Link>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className='flex items-center justify-between py-4 px-[4%] font-medium relative z-[100] bg-white border-b border-gray-100'>
            
            <Link to='/' className='flex-shrink-0 group'>
                <div className='flex items-center gap-3'>
                    <img src={assets.logo} className='w-10 lg:w-12 group-hover:rotate-12 transition-transform duration-300' alt="PhilaBasket Seal" />
                    <div className='flex flex-col'>
                        <h1 className='text-2xl font-black text-gray-900 tracking-tighter leading-none'>
                            PHILABASKET <span className='text-red-600'>.</span>
                        </h1>
                        <p className='text-[8px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-1'>Philatelic Archive</p>
                    </div>
                </div>
            </Link>

            {/* --- CENTRAL NAVIGATION --- */}
            <div className='hidden xl:flex items-center gap-8'>
                <ul className='flex gap-8'>
                    <NavLink to='/' className='flex flex-col items-center gap-1 group relative'>
                        <p className='text-[12px] font-bold tracking-widest'>HOME</p>
                        <hr className='absolute bottom-[-10px] left-0 w-full border-none h-[2px] bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300' />
                    </NavLink>

                    <MegaMenu title="STAMP VARIETY" groups={CATEGORY_GROUPS} />

                    <NavLink to='/about' className='flex flex-col items-center gap-1 group relative'>
                        <p className='text-[12px] font-bold tracking-widest'>UPDATES</p>
                        <hr className='absolute bottom-[-10px] left-0 w-full border-none h-[2px] bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300' />
                    </NavLink>

                    <NavLink to='/contact' className='flex flex-col items-center gap-1 group relative'>
                        <p className='text-[12px] font-bold tracking-widest'>CONTACT</p>
                        <hr className='absolute bottom-[-10px] left-0 w-full border-none h-[2px] bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300' />
                    </NavLink>
                </ul>
                
                {/* --- SECONDARY LOGO / SEAL ON THE SIDE --- */}
                <div className='h-8 w-[1px] bg-gray-200 mx-2'></div>
                <img src={assets.logo} className='w-8 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-help' title="Certified Philatelic Dealer" alt="Seal" />
            </div>

            {/* --- RIGHT SIDE ACTIONS --- */}
            <div className='flex items-center gap-5'>
                {token && (
                    <div className='hidden lg:flex items-center gap-2 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100'>
                        <img src={assets.star_icon} className='w-3 h-3' alt="" />
                        <span className='text-[11px] font-black text-orange-600'>{userPoints} PTS</span>
                    </div>
                )}

                <div className='flex items-center gap-4'>
                    <img onClick={() => { setShowSearch(true); navigate('/collection') }} src={assets.search_icon} className='w-5 cursor-pointer hover:scale-110 transition-all' alt="Search" />
                    
                    <div className='group relative'>
                        <img onClick={() => token ? null : navigate('/login')} className='w-5 cursor-pointer hover:scale-110 transition-all' src={assets.profile_icon} alt="Profile" />
                        {token && 
                        <div className='group-hover:block hidden absolute right-0 pt-4 '>
                            <div className='flex flex-col gap-2 w-48 py-4 px-6 bg-white shadow-2xl rounded-sm border border-gray-50'>
                                <p className='text-[10px] font-bold text-orange-600 border-b pb-2 mb-1 uppercase tracking-widest'>Philatelist: {userPoints} Pts</p>
                                <p onClick={()=>navigate('/orders')} className='text-xs cursor-pointer hover:text-red-600 transition-colors py-1 font-bold uppercase'>My Orders</p>
                                <p onClick={logout} className='text-xs cursor-pointer hover:text-red-600 transition-colors py-1 font-bold text-gray-400 uppercase'>Logout</p>
                            </div>
                        </div>}
                    </div>

                    <select value={currency} onChange={(e) => toggleCurrency(e.target.value)} className='bg-transparent text-[11px] font-bold border rounded-sm px-2 py-1 cursor-pointer hover:border-black transition-all'>
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                    </select>

                    <Link to='/cart' className='relative group'>
                        <img src={assets.cart_icon} className='w-5 group-hover:scale-110 transition-all' alt="Cart" />
                        <p className='absolute -right-2 -bottom-2 w-4 h-4 text-center leading-4 bg-red-600 text-white rounded-full text-[8px] font-bold shadow-md'>{getCartCount()}</p>
                    </Link> 

                    <img onClick={() => setVisible(true)} src={assets.menu_icon} className='w-6 cursor-pointer xl:hidden' alt="Menu" /> 
                </div>
            </div>
            
            {/* Mobile Sidebar logic remains the same */}
        </div>
    )
}

export default Navbar;