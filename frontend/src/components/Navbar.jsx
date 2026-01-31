import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const Navbar = () => {
    const [visible, setVisible] = useState(false);
    const { 
        currency, toggleCurrency, setShowSearch, getCartCount, 
        navigate, token, wishlist,setToken, setCartItems, 
        userPoints, fetchUserData 
    } = useContext(ShopContext);

    useEffect(() => {
        if (token) fetchUserData(); 
    }, [token]);

    const logout = () => {
        navigate('/login');
        localStorage.removeItem('token');
        setToken('');
        setCartItems({});
    };

    const CATEGORY_GROUPS = {
        philatelic: { title: "VARIANTS", items: { "MINT & SHEETS": ["Mint Variety", "Miniature Sheets", "Full Sheet"], "SPECIALS": ["First Day Cover", "My Stamp", "Definitive"] }},
        thematic: { title: "THEMES", items: { "NATURE": ["WildLife", "Bird Stamps", "Yoga"], "CULTURE": ["Cinema", "Gandhi", "Space"] }},
        postal: { title: "HISTORY", items: { "COVERS": ["Airmail", "Army Postal", "Special Cover"], "STATIONERY": ["Postal Stationery", "Cancellations"] }},
        regions: { title: "REGIONS", items: { "DOMESTIC": ["India"], "INTERNATIONAL": ["Asia", "Europe", "Americas"] }}
    };

    const MegaMenu = ({ menuData }) => (
        <div className='group relative flex flex-col items-center gap-1 cursor-pointer'>
            <div className='hover:text-[#BC002D] transition-all duration-500 px-2 flex items-center gap-2'>
                <p className='text-[10px] font-bold tracking-[0.5em] uppercase text-black/60 group-hover:text-[#BC002D]'>{menuData.title}</p>
                <img src={assets.dropdown_icon} className='w-2 opacity-20 group-hover:rotate-180 group-hover:opacity-100 transition-all duration-500 brightness-0' alt="" />
            </div>
            
            <div className='absolute top-full left-1/2 -translate-x-1/2 pt-6 hidden group-hover:block z-[110]'>
                <div className='bg-white border border-black/5 p-10 flex gap-16 w-max shadow-[0_40px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl'>
                    {Object.entries(menuData.items).map(([groupName, items], idx) => (
                        <div key={idx} className='flex flex-col min-w-[160px]'>
                            <h3 className='text-[9px] font-black text-[#D4AF37] mb-6 tracking-[0.4em] uppercase border-b border-black/5 pb-3'>
                                {groupName}
                            </h3>
                            <div className='flex flex-col gap-4 text-black/40'>
                                {items.map((item, i) => (
                                    <Link 
                                        key={i} 
                                        onClick={() => { window.scrollTo(0,0); setVisible(false); }}
                                        to={`/collection?category=${encodeURIComponent(item)}`}
                                        className='text-[10px] hover:text-[#BC002D] hover:translate-x-2 transition-all duration-300 font-medium uppercase tracking-[0.2em]'
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
        <div className='flex items-center justify-between py-6 px-[6%] sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-black/5'>
            
            {/* LOGO SECTION */}
            <Link to='/' className='flex-shrink-0 group'>
                <div className='flex items-center gap-5'>
                    <img src={assets.logo} className='w-12 lg:w-14 group-hover:scale-110 transition-transform duration-700' alt="PhilaBasket" />
                    <div className='hidden sm:flex flex-col'>
                        <h1 className='text-xl lg:text-2xl font-serif text-black tracking-tighter'>
                            PHILA<span className='text-[#BC002D] italic font-light'>BASKET</span>
                        </h1>
                        <p className='text-[8px] text-[#D4AF37] font-bold uppercase tracking-[0.6em]'>The Archive</p>
                    </div>
                </div>
            </Link>

            {/* MAIN NAVIGATION */}
            <nav className='hidden xl:flex items-center gap-12'>
                <NavLink to='/' className='group relative'>
                    <p className='text-[10px] font-bold tracking-[0.5em] text-black/60 group-hover:text-[#BC002D] transition-colors uppercase'>Home</p>
                    <div className='absolute -bottom-1 left-0 w-0 h-[1px] bg-[#BC002D] group-hover:w-full transition-all duration-500'></div>
                </NavLink>

                <MegaMenu menuData={CATEGORY_GROUPS.philatelic} />
                <MegaMenu menuData={CATEGORY_GROUPS.thematic} />
                <MegaMenu menuData={CATEGORY_GROUPS.postal} />
                <MegaMenu menuData={CATEGORY_GROUPS.regions} />

                <NavLink to='/about' className='group relative'>
                    <p className='text-[10px] font-bold tracking-[0.5em] text-black/60 group-hover:text-[#BC002D] transition-colors uppercase'>Archive</p>
                </NavLink>
            </nav>

            {/* UTILITY ACTIONS */}
            <div className='flex items-center gap-8'>
                
                {/* REWARD MODULE */}
                <div className='relative group'>
                    <div className='hidden md:flex items-center gap-3 bg-black text-white px-5 py-2.5 rounded-full cursor-pointer hover:bg-[#BC002D] transition-all duration-500 shadow-xl shadow-black/10'>
                        <img className='w-5 h-5' src={token ? assets.coin : assets.quality_icon} alt="Points" />
                        <span className='text-[10px] font-bold tracking-widest uppercase'>
                            {token ? `${userPoints} PTS` : 'Join'}
                        </span>
                    </div>

                    {/* Point Panel Dropdown */}
                    <div className='absolute right-0 top-full pt-5 hidden group-hover:block z-[120]'>
                        <div className='w-80 bg-white border border-black/5 p-8 shadow-[0_30px_60px_rgba(0,0,0,0.12)]'>
                            <h4 className='text-black font-serif text-base mb-6 border-b border-black/5 pb-3'>
                                {token ? 'Portfolio Value' : 'Membership'}
                            </h4>
                            
                            {token ? (
                                <div className='space-y-5'>
                                    <div className='bg-[#F9F9F9] p-5 border-l-2 border-[#D4AF37]'>
                                        <p className='text-[9px] text-black/30 uppercase tracking-widest mb-1'>Credit Valuation</p>
                                        <p className='text-black font-bold text-lg tracking-tight'>
                                            {/* PRESERVED CONVERSION LOGIC */}
                                            {currency === 'INR' ? `₹${(userPoints * 0.1).toFixed(2)}` : `$${(userPoints * 0.0012).toFixed(2)}`}
                                        </p>
                                    </div>

                                    <div 
                                        onClick={() => { navigate('/referral'); setVisible(false); }} 
                                        className='p-4 border border-black/5 bg-white hover:bg-[#BC002D]/5 transition-all cursor-pointer group/ref'
                                    >
                                        <p className='text-[#BC002D] text-[9px] font-black uppercase tracking-[0.3em] mb-2'>Refer a Collector</p>
                                        <p className='text-black/40 text-[9px] leading-relaxed uppercase tracking-wider'>Earn 500 PTS for every invitation.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className='space-y-4 text-center'>
                                    <p className='text-black/40 text-[10px] uppercase leading-relaxed tracking-widest'>Access exclusive specimens and 10% acquisition credits.</p>
                                    <button onClick={() => { navigate('/login'); setVisible(false); }} className='w-full bg-black text-white py-3 text-[9px] font-bold uppercase tracking-[0.4em] hover:bg-[#BC002D] transition-all'>Initialize</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className='flex items-center gap-6'>
                    <img onClick={() => { setShowSearch(true); navigate('/collection') }} src={assets.search_icon} className='w-4 cursor-pointer brightness-0 opacity-40 hover:opacity-100 transition-all' alt="Search" />
                    
                    <div className='group relative'>
                        <img onClick={() => token ? null : navigate('/login')} className='w-4 cursor-pointer brightness-0 opacity-40 hover:opacity-100 transition-all' src={assets.profile_icon} alt="Profile" />
                        {token && (
                            <div className='group-hover:block hidden absolute right-0 pt-5 w-48'>
                                <div className='bg-white border border-black/5 p-5 shadow-2xl'>
                                    <p onClick={()=>navigate('/orders')} className='text-[10px] text-black/60 cursor-pointer hover:text-[#BC002D] mb-4 uppercase tracking-widest'>Orders</p>
                                    <p onClick={() => navigate('/wishlist')} className='text-[10px] text-gray-400 cursor-pointer hover:text-white mb-3 uppercase tracking-widest flex justify-between items-center'>
                Wishlist 
                <span className='text-[8px] bg-[#B8860B]/20 px-1 rounded text-[#B8860B]'>{wishlist.length}</span>
            </p>
                                    <p onClick={logout} className='text-[10px] text-[#BC002D] cursor-pointer font-bold uppercase tracking-widest'>Sign Out</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <select 
                        value={currency} 
                        onChange={(e) => toggleCurrency(e.target.value)} 
                        className='bg-transparent text-black text-[10px] font-bold border-none focus:ring-0 uppercase tracking-[0.2em] cursor-pointer'
                    >
                        <option value="INR">INR ₹</option>
                        <option value="USD">USD $</option>
                    </select>

                    <Link to='/cart' className='relative group'>
                        <div className='bg-black p-2 rounded-full group-hover:bg-[#BC002D] transition-all duration-500 shadow-lg shadow-black/10'>
                            <img src={assets.cart_icon} className='w-3.5 brightness-0 invert' alt="Cart" />
                        </div>
                        <p className='absolute -right-1 -top-1 w-4 h-4 text-[8px] flex items-center justify-center bg-[#D4AF37] text-black rounded-full font-bold'>{getCartCount()}</p>
                    </Link> 

                    <img onClick={() => setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer xl:hidden brightness-0 opacity-60' alt="Menu" /> 
                </div>
            </div>

            {/* --- MOBILE NAVIGATION DRAWER --- */}
            {/* --- MOBILE NAVIGATION DRAWER --- */}
<div className={`fixed inset-0 z-[5000] transition-all duration-500 ${visible ? 'visible' : 'invisible'}`}>
    
    {/* 1. Backdrop Overlay: Heavy blur to isolate the Hero section */}
    <div 
        onClick={() => setVisible(false)} 
        className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
    ></div>

    {/* 2. Side Panel: Slide-in logic with solid background */}
    <div className={`absolute top-0 right-0 h-full w-[85%] sm:w-[450px] bg-white shadow-[-30px_0_60px_rgba(0,0,0,0.3)] transition-transform duration-500 ease-in-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Decorative Background Text */}
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-serif text-black/[0.02] pointer-events-none select-none uppercase italic'>Archive</div>
        
        <div className='flex flex-col h-full text-black relative z-10 bg-white'>
            
            {/* Header Section */}
            <div className='flex items-center justify-between p-8 border-b border-black/5 bg-white'>
                <div onClick={() => setVisible(false)} className='flex items-center gap-4 cursor-pointer group'>
                    <div className='w-10 h-10 flex items-center justify-center rounded-full border border-black/10 group-hover:border-[#BC002D] transition-all'>
                        <img className='h-3 rotate-180 brightness-0' src={assets.dropdown_icon} alt="Back" />
                    </div>
                    <p className='text-[10px] tracking-[0.4em] uppercase font-black'>Return</p>
                </div>
                <img src={assets.logo} className='w-12' alt="Logo" />
            </div>

            {/* Links Content - Added bg-white to ensure no bleed-through */}
            <div className='flex flex-col p-12 items-start flex-1 gap-10  bg-white'>
                
                {/* Main Catalogue Portals */}
                <div className='space-y-6 w-full'>
                    <p className='text-[9px] tracking-[0.6em] text-[#BC002D] uppercase font-black mb-6'>Catalogue Portals</p>
                    <NavLink onClick={() => setVisible(false)} className='block text-5xl font-serif tracking-tighter text-black hover:text-[#BC002D] transition-colors uppercase' to='/'>Home</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='block text-5xl font-serif tracking-tighter text-black hover:text-[#BC002D] transition-colors uppercase' to='/collection'>Gallery</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='block text-5xl font-serif tracking-tighter text-black hover:text-[#BC002D] transition-colors uppercase' to='/about'>Archive</NavLink>
                </div>

                <div className='h-[1px] w-full bg-black/5 my-2'></div>

                {/* NEW: Personal Vault (Orders & Wishlist) with specialized background */}
                <div className='space-y-6 w-full'>
                    <p className='text-[9px] tracking-[0.6em] text-gray-400 uppercase font-black mb-6'>Personal Vault</p>
                    
                    <div className='flex flex-col gap-4'>
                        {/* My Orders Link */}
                        <div 
                            onClick={() => { navigate('/orders'); setVisible(false); }}
                            className='flex items-center justify-between p-5 bg-[#F9F9F9] border border-black/5 rounded-sm active:bg-[#BC002D]/5 transition-all'
                        >
                            <span className='text-sm font-bold tracking-[0.2em] uppercase'>Registry Orders</span>
                            <img className='h-3 rotate-270 brightness-0 opacity-30' src={assets.dropdown_icon} alt="" />
                        </div>

                        {/* Wishlist Link with Count */}
                        <div 
                            onClick={() => { navigate('/wishlist'); setVisible(false); }}
                            className='flex items-center justify-between p-5 bg-[#F9F9F9] border border-black/5 rounded-sm active:bg-[#BC002D]/5 transition-all'
                        >
                            <div className='flex items-center gap-3'>
                                <span className='text-sm font-bold tracking-[0.2em] uppercase'>Wishlist</span>
                                <span className='bg-[#BC002D]/10 text-[#BC002D] px-2 py-0.5 rounded-sm text-[10px] font-black'>
                                    {wishlist.length}
                                </span>
                            </div>
                            <img className='h-4 brightness-0 opacity-30' src={assets.star_icon} alt="" />
                        </div>
                    </div>
                </div>

                <div className='h-[1px] w-full bg-black/5 my-2'></div>

                {/* Identity & Status */}
                <div className='w-full'>
                    <p className='text-[9px] tracking-[0.6em] text-gray-400 uppercase font-black mb-8'>Identity Status</p>
                    {token ? (
                        <div className='space-y-8'>
                            <div className='flex flex-col gap-2 bg-[#F9F9F9] p-5 border-l-2 border-[#D4AF37]'>
                                <p className='text-[9px] text-black/30 uppercase tracking-widest mb-1'>Credit Valuation</p>
                                <p className='text-black font-bold text-lg tracking-tight'>
                                    {currency === 'INR' ? `₹${(userPoints * 0.1).toFixed(2)}` : `$${(userPoints * 0.0012).toFixed(2)}`}
                                </p>
                                <p className='text-[8px] text-[#D4AF37] font-black uppercase tracking-widest mt-1'>{userPoints} PTS IN VAULT</p>
                            </div>
                            
                            <button onClick={()=>{setVisible(false); logout();}} className='w-full bg-[#BC002D] text-white py-5 text-[11px] tracking-[0.5em] font-black uppercase shadow-2xl active:scale-95 transition-transform'>Terminate Session</button>
                        </div>
                    ) : (
                        <button onClick={() => { navigate('/login'); setVisible(false); }} className='w-full bg-black text-white py-5 text-[11px] tracking-[0.5em] font-black uppercase shadow-2xl active:scale-95 transition-transform'>Initialize Access</button>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className='p-10 text-center border-t border-black/5 bg-white'>
                <p className='text-[9px] tracking-[0.8em] text-black/20 uppercase font-black italic'>PhilaBasket Sovereign • MMXXVI</p>
            </div>
        </div>
    </div>
</div>
        </div>
    );
};

export default Navbar;