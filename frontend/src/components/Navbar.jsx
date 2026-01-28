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
        philatelic: { title: "VARIANTS", items: { "MINT & SHEETS": ["Mint Variety", "Miniature Sheets", "Full Sheet"], "SPECIALS": ["First Day Cover", "My Stamp", "Definitive"] }},
        thematic: { title: "THEMES", items: { "NATURE": ["WildLife", "Bird Stamps", "Yoga"], "CULTURE": ["Cinema", "Gandhi", "Space"] }},
        postal: { title: "HISTORY", items: { "COVERS": ["Airmail", "Army Postal", "Special Cover"], "STATIONERY": ["Postal Stationery", "Cancellations"] }},
        regions: { title: "REGIONS", items: { "DOMESTIC": ["India"], "INTERNATIONAL": ["Asia", "Europe", "Americas"] }}
    };

    const MegaMenu = ({ menuData }) => (
        <div className='group relative flex flex-col items-center gap-1 cursor-pointer'>
            <div className='hover:text-[#B8860B] transition-colors duration-500 px-2 flex items-center gap-1.5'>
                <p className='text-[11px] font-medium tracking-[0.4em] uppercase text-white group-hover:text-[#B8860B]'>{menuData.title}</p>
                <img src={assets.dropdown_icon} className='w-2 brightness-0 invert opacity-40 group-hover:rotate-180 transition-transform duration-500' alt="" />
            </div>
            
            <div className='absolute top-full left-1/2 -translate-x-1/2 pt-6 hidden group-hover:block z-[110]'>
                <div className='bg-[#111111] border border-[#B8860B]/20 p-8 flex gap-12 w-max shadow-[0_20px_50px_rgba(0,0,0,0.5)]'>
                    {Object.entries(menuData.items).map(([groupName, items], idx) => (
                        <div key={idx} className='flex flex-col min-w-[150px]'>
                            <h3 className='text-[9px] font-bold text-[#B8860B] mb-5 tracking-[0.3em] uppercase border-b border-[#B8860B]/10 pb-2'>
                                {groupName}
                            </h3>
                            <div className='flex flex-col gap-3'>
                                {items.map((item, i) => (
                                    <Link 
                                        key={i} 
                                        onClick={() => window.scrollTo(0,0)}
                                        to={`/collection?category=${encodeURIComponent(item)}`}
                                        className='text-[10px] text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-300 font-light uppercase tracking-widest'
                                    >
                                        {item}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className='flex items-center justify-between py-5 px-[5%] relative z-[100] bg-[#0a0a0a] border-b border-[#B8860B]/10'>
            
            {/* LOGO */}
            <Link to='/' className='flex-shrink-0 group'>
                <div className='flex items-center gap-4'>
                    <img src={assets.logo} className='w-12 lg:w-14 brightness-0 invert group-hover:scale-105 transition-transform duration-500' alt="PhilaBasket" />
                    <div className='hidden sm:flex flex-col'>
                        <h1 className='text-lg lg:text-xl font-serif text-white tracking-[0.1em]'>
                            PHILA<span className='text-[#B8860B] italic'>BASKET</span>
                        </h1>
                        <p className='text-[8px] text-[#B8860B]/60 font-light uppercase tracking-[0.5em]'></p>
                    </div>
                </div>
            </Link>

            {/* NAVIGATION */}
            <nav className='hidden xl:flex items-center gap-10'>
                <NavLink to='/' className='group relative'>
                    <p className='text-[11px] font-medium tracking-[0.4em] text-white group-hover:text-[#B8860B] transition-colors'>HOME</p>
                </NavLink>

                <MegaMenu menuData={CATEGORY_GROUPS.philatelic} />
                <MegaMenu menuData={CATEGORY_GROUPS.thematic} />
                <MegaMenu menuData={CATEGORY_GROUPS.postal} />
                <MegaMenu menuData={CATEGORY_GROUPS.regions} />

                <NavLink to='/about' className='group relative'>
                    <p className='text-[11px] font-medium tracking-[0.4em] text-white group-hover:text-[#B8860B] transition-colors'>ARCHIVE</p>
                </NavLink>
            </nav>

            {/* ACTIONS */}
            <div className='flex items-center gap-6'>
                {token && (
                    <div className='hidden md:flex items-center gap-3 bg-[#111111] border border-[#B8860B]/20 px-4 py-1 rounded-full'>
                        <img className='w-6 h-6' src={assets.coin} alt="Points" />
                        <span className='text-[11px] font-bold text-[#B8860B] tracking-wider'>{userPoints} PTS</span>
                    </div>
                )}

                <div className='flex items-center gap-5'>
                    <img onClick={() => { setShowSearch(true); navigate('/collection') }} src={assets.search_icon} className='w-4 cursor-pointer brightness-0 invert opacity-60 hover:opacity-100 transition-all' alt="Search" />
                    
                    <div className='group relative'>
                        <img onClick={() => token ? null : navigate('/login')} className='w-4 cursor-pointer brightness-0 invert opacity-60 hover:opacity-100 transition-all' src={assets.profile_icon} alt="Profile" />
                        {token && (
                            <div className='group-hover:block hidden absolute right-0 pt-4 w-44'>
                                <div className='bg-[#111111] border border-[#B8860B]/20 p-4 shadow-2xl'>
                                    <p className='text-[8px] font-bold text-[#B8860B] uppercase mb-4 tracking-widest'>Collector Status</p>
                                    <p onClick={()=>navigate('/orders')} className='text-[10px] text-gray-400 cursor-pointer hover:text-white mb-3 uppercase tracking-widest'>Orders</p>
                                    <p onClick={logout} className='text-[10px] text-[#E63946] cursor-pointer hover:brightness-125 uppercase tracking-widest'>Logout</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <select 
                        value={currency} 
                        onChange={(e) => toggleCurrency(e.target.value)} 
                        className='bg-transparent text-white text-[10px] font-medium border-none focus:ring-0 uppercase tracking-widest cursor-pointer'
                    >
                        <option className="bg-[#111111]" value="INR">₹ INR</option>
                        <option className="bg-[#111111]" value="USD">$ USD</option>
                    </select>

                    <Link to='/cart' className='relative group'>
                        <img src={assets.cart_icon} className='w-4 brightness-0 invert opacity-60 group-hover:opacity-100' alt="Cart" />
                        <p className='absolute -right-2 -top-2 w-4 h-4 text-[8px] flex items-center justify-center bg-[#B8860B] text-black rounded-full font-bold'>{getCartCount()}</p>
                    </Link> 

                    <img onClick={() => setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer xl:hidden brightness-0 invert' alt="Menu" /> 
                </div>
            </div>

            {/* MOBILE SIDEBAR */}
            {/* MOBILE SIDEBAR - Fixed Overlay */}
{/* MOBILE SIDEBAR - Fixed Overlay */}
<div className={`fixed top-0 right-0 bottom-0 z-[1000] overflow-y-auto bg-[#0a0a0a] transition-all duration-500 ease-in-out ${visible ? 'w-full' : 'w-0'}`}>
    <div className='flex flex-col min-h-full text-white pb-10'>
        
        {/* Header */}
        <div onClick={() => setVisible(false)} className='flex items-center justify-between p-6 border-b border-[#B8860B]/10 sticky top-0 bg-[#0a0a0a] z-10'>
            <div className='flex items-center gap-4'>
                <img className='h-3 rotate-180 brightness-0 invert' src={assets.dropdown_icon} alt="Back" />
                <p className='text-[10px] tracking-[0.4em] uppercase text-[#B8860B] font-medium'>Close Archive</p>
            </div>
            <img src={assets.logo} className='w-8 brightness-0 invert opacity-50' alt="" />
        </div>

        {/* Main Links */}
        <div className='flex flex-col p-8 gap-6'>
            <NavLink onClick={() => setVisible(false)} className='text-2xl font-serif tracking-widest text-[#B8860B]' to='/'>HOME</NavLink>
            
            <hr className='border-[#B8860B]/10' />
            
            {/* CATEGORIES SECTION (Mobile Accordion) */}
            <p className='text-[10px] tracking-[0.5em] text-gray-500 uppercase mb-2'>Explore Classifications</p>
            
            <div className='flex flex-col gap-6'>
                {Object.entries(CATEGORY_GROUPS).map(([key, group]) => (
                    <div key={key} className='flex flex-col gap-4'>
                        <h3 className='text-sm font-serif tracking-[0.2em] text-white border-l-2 border-[#B8860B] pl-4'>
                            {group.title}
                        </h3>
                        
                        <div className='grid grid-cols-1 gap-y-4 pl-4'>
                            {Object.entries(group.items).map(([subTitle, items]) => (
                                <div key={subTitle} className='flex flex-col gap-2'>
                                    <p className='text-[9px] tracking-[0.2em] text-[#B8860B] font-bold uppercase opacity-70'>
                                        {subTitle}
                                    </p>
                                    <div className='flex flex-wrap gap-x-4 gap-y-2'>
                                        {items.map((item) => (
                                            <Link 
                                                key={item}
                                                to={`/collection?category=${encodeURIComponent(item)}`}
                                                onClick={() => setVisible(false)}
                                                className='text-[11px] tracking-widest text-gray-400 hover:text-white uppercase'
                                            >
                                                {item}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <hr className='border-[#B8860B]/10 mt-4' />

            <NavLink onClick={() => setVisible(false)} className='text-xl font-serif tracking-widest' to='/about'>ABOUT US</NavLink>
            <NavLink onClick={() => setVisible(false)} className='text-xl font-serif tracking-widest' to='/about'>BLOG</NavLink>

            <NavLink onClick={() => setVisible(false)} className='text-xl font-serif tracking-widest' to='/contact'>CONTACT</NavLink>
        </div>

        {/* Mobile Bottom Info */}
        <div className='mt-auto p-8 border-t border-[#B8860B]/10 bg-[#111111]'>
            <div className='flex items-center gap-3 mb-4'>
                <img src={assets.coin} className='w-5 h-5' alt="" />
                <p className='text-[10px] tracking-[0.3em] text-[#B8860B] uppercase font-bold'>
                    {token ? `${userPoints} PTS Balance` : 'Join the Archive'}
                </p>
            </div>
            <p className='text-gray-500 text-[9px] tracking-widest uppercase'>MMXXVI Philatelic Concierge Service</p>
        </div>
    </div>
</div>
        </div>
    )
}

export default Navbar;