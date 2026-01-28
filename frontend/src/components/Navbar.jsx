import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const Navbar = () => {
    const [visible, setVisible] = useState(false);
    const { 
        currency, toggleCurrency, setShowSearch, getCartCount, 
        navigate, token, setToken, setCartItems, 
        userPoints, fetchUserData // <--- Change this from fetchUserPoints
    } = useContext(ShopContext);

    useEffect(() => {
        // Change this from fetchUserPoints() to fetchUserData()
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
                            <div className='flex flex-col gap-3 text-gray-400'>
                                {items.map((item, i) => (
                                    <Link 
                                        key={i} 
                                        onClick={() => window.scrollTo(0,0)}
                                        to={`/collection?category=${encodeURIComponent(item)}`}
                                        className='text-[10px] hover:text-white hover:translate-x-1 transition-all duration-300 font-light uppercase tracking-widest'
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
                        <p className='text-[8px] text-[#B8860B]/60 font-light uppercase tracking-[0.5em]'>MMXXVI Archive</p>
                    </div>
                </div>
            </Link>

            {/* NAVIGATION */}
            <nav className='hidden xl:flex items-center gap-10'>
                <NavLink to='/' className='group relative'>
                    <p className='text-[11px] font-medium tracking-[0.4em] text-white group-hover:text-[#B8860B] transition-colors uppercase'>Home</p>
                </NavLink>

                <MegaMenu menuData={CATEGORY_GROUPS.philatelic} />
                <MegaMenu menuData={CATEGORY_GROUPS.thematic} />
                <MegaMenu menuData={CATEGORY_GROUPS.postal} />
                <MegaMenu menuData={CATEGORY_GROUPS.regions} />

                <NavLink to='/about' className='group relative'>
                    <p className='text-[11px] font-medium tracking-[0.4em] text-white group-hover:text-[#B8860B] transition-colors uppercase'>Archive</p>
                </NavLink>
            </nav>

            {/* RIGHT SIDE ACTIONS */}
            <div className='flex items-center gap-6'>
                
                {/* REWARD & VALUATION MODULE */}
                <div className='relative group'>
                    <div className='hidden md:flex items-center gap-3 bg-[#111111] border border-[#B8860B]/20 px-4 py-1.5 rounded-full cursor-pointer hover:bg-[#1a1a1a] transition-all duration-500'>
                        <img className='w-6 h-6 animate-pulse' src={token ? assets.coin : assets.quality_icon} alt="Reward Icon" />
                        <span className='text-[11px] font-bold text-[#B8860B] tracking-wider uppercase'>
                            {token ? `${userPoints} PTS` : 'Privileges'}
                        </span>
                    </div>

                    {/* Reward Dropdown Panel */}
                    <div className='absolute right-0 top-full pt-4 hidden group-hover:block z-[120]'>
                        <div className='w-72 bg-[#0d0d0d] border border-[#B8860B]/30 p-6 shadow-2xl'>
                            <h4 className='text-[#B8860B] font-serif text-sm uppercase tracking-[0.2em] mb-4 border-b border-[#B8860B]/10 pb-2'>
                                {token ? 'Portfolio Valuation' : 'Collector Benefits'}
                            </h4>
                            
                            {token ? (
                                <div className='space-y-4'>
                                    <div className='flex justify-between items-center bg-[#1a1a1a] p-3 border border-[#B8860B]/10 rounded-sm'>
                                        <div className='flex flex-col'>
                                            <p className='text-[8px] text-gray-500 uppercase tracking-widest mb-1'>Redeemable Value</p>
                                            <p className='text-[#B8860B] font-bold text-sm tracking-widest'>
                                                {currency === 'INR' ? `₹${(userPoints * 0.1).toFixed(2)}` : `$${(userPoints * 0.0012).toFixed(2)}`}
                                            </p>
                                        </div>
                                        <div className='text-right'>
                                            <p className='text-[8px] text-gray-500 uppercase tracking-widest mb-1'>Conversion</p>
                                            <p className='text-white text-[9px] font-light italic'>10 PTS = ₹1.00</p>
                                        </div>
                                    </div>

                                    {/* Refer & Earn Feature Linked to Referral Page */}
                                    <div 
                                        onClick={() => { navigate('/referral'); window.scrollTo(0,0); }} 
                                        className='p-3 border border-[#B8860B]/10 rounded-sm bg-[#B8860B]/5 hover:bg-[#B8860B]/10 transition-all cursor-pointer group/refer'
                                    >
                                        <div className='flex items-center gap-2 mb-1'>
                                            <span className='w-1 h-1 bg-[#B8860B] rounded-full animate-ping'></span>
                                            <p className='text-[#B8860B] text-[10px] font-black uppercase tracking-[0.2em]'>Refer & Earn</p>
                                        </div>
                                        <p className='text-gray-400 text-[9px] font-light leading-relaxed'>Invite a distinguished collector to earn 500 PTS upon their first acquisition.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className='space-y-4'>
                                    <p className='text-gray-400 text-[10px] leading-relaxed font-light'>
                                        Join the PhilaBasket Archive to earn **10% PTS** on every acquisition.
                                    </p>
                                    <ul className='space-y-2'>
                                        <li className='flex items-center gap-2 text-[9px] text-[#B8860B] tracking-widest uppercase'>
                                            <span className='w-1 h-1 bg-[#B8860B] rounded-full'></span> 10 PTS = ₹1.00 Credit
                                        </li>
                                        <li className='flex items-center gap-2 text-[9px] text-[#B8860B] tracking-widest uppercase'>
                                            <span className='w-1 h-1 bg-[#B8860B] rounded-full'></span> Referral Tributes
                                        </li>
                                    </ul>
                                    <button onClick={() => navigate('/login')} className='w-full bg-[#B8860B] text-black py-2 text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all'>
                                        Initialize Membership
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SEARCH, PROFILE, CURRENCY, CART */}
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

            {/* MOBILE SIDEBAR (Drawer) */}
            <div className={`fixed top-0 right-0 bottom-0 z-[1000] overflow-y-auto bg-[#0a0a0a] transition-all duration-500 ease-in-out ${visible ? 'w-full' : 'w-0'}`}>
                <div className='flex flex-col min-h-full text-white pb-10'>
                    <div onClick={() => setVisible(false)} className='flex items-center justify-between p-6 border-b border-[#B8860B]/10 sticky top-0 bg-[#0a0a0a] z-10'>
                        <div className='flex items-center gap-4'>
                            <img className='h-3 rotate-180 brightness-0 invert' src={assets.dropdown_icon} alt="Back" />
                            <p className='text-[10px] tracking-[0.4em] uppercase text-[#B8860B] font-medium'>Close Archive</p>
                        </div>
                        <img src={assets.logo} className='w-8 brightness-0 invert opacity-50' alt="" />
                    </div>

                    <div className='flex flex-col p-8 gap-10'>
                        <NavLink onClick={() => setVisible(false)} className='text-3xl font-serif tracking-widest text-[#B8860B]' to='/'>HOME</NavLink>
                        
                        {/* MOBILE REWARD PREVIEW - Linked to Referral */}
                        <div onClick={() => { if(token) { navigate('/referral'); setVisible(false); }}} className='bg-[#111111] p-6 border border-[#B8860B]/20 rounded-sm cursor-pointer'>
                            <div className='flex items-center gap-4 mb-3'>
                                <img src={token ? assets.coin : assets.quality_icon} className='w-8 h-8' alt="" />
                                <h4 className='text-sm tracking-widest text-[#B8860B] uppercase font-bold'>{token ? 'Your Valuation' : 'Join Membership'}</h4>
                            </div>
                            <p className='text-[10px] text-gray-500 leading-relaxed uppercase tracking-wider mb-4'>
                                {token ? `Your ${userPoints} PTS are worth ₹${(userPoints * 0.1).toFixed(0)}. Expand your legacy.` : 'Acquire 10% PTS on every historical specimen.'}
                            </p>
                            {token && <p className='text-[10px] text-[#B8860B] font-bold tracking-widest uppercase'>Invite a Collector & Earn →</p>}
                        </div>

                        <div className='flex flex-col gap-6'>
                            <p className='text-[10px] tracking-[0.5em] text-gray-500 uppercase mb-2'>Explore Classifications</p>
                            {Object.entries(CATEGORY_GROUPS).map(([key, group]) => (
                                <div key={key} className='flex flex-col gap-4'>
                                    <h3 className='text-sm font-serif tracking-[0.2em] text-white border-l-2 border-[#B8860B] pl-4'>{group.title}</h3>
                                    <div className='flex flex-wrap gap-x-4 gap-y-2 pl-4'>
                                        {Object.values(group.items).flat().slice(0, 5).map((item) => (
                                            <Link key={item} to={`/collection?category=${encodeURIComponent(item)}`} onClick={() => setVisible(false)} className='text-[11px] tracking-widest text-gray-400 uppercase'>{item}</Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;