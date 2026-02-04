import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { 
  Search, 
  User, 
  Heart, 
  ShoppingBag, 
  Menu, 
  X, Package,
  ChevronRight, 
  LogOut, 
  Trophy,
  ArrowLeft
} from 'lucide-react';

const Navbar = () => {
    const [visible, setVisible] = useState(false);
    const { 
        currency, toggleCurrency, setShowSearch, getCartCount, 
        navigate, token, wishlist, setToken, setCartItems, 
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
        philatelic: { id: "01", title: "MINT VARIETY", items: { "MINT & SHEETS": ["SheetLet", "Miniature Sheets", "Full Sheet","Year Pack","Block of Four","Block of Four with Traffic light","Joint Issue"], "SPECIALS": ["First Day Cover", "My Stamp", "Definitive"] }},
        thematic: { id: "02", title: "THEMES", items: { "NATURE": ["WildLife", "Bird Stamps", "Yoga"], "CULTURE": ["Cinema", "Gandhi", "Space"] }},
        regions: { id: "03", title: "REGIONS", items: { "DOMESTIC": ["India"], "INTERNATIONAL": ["Asia", "Europe", "Americas"] }},
        gifting: { id: "04", title: "GIFTING", items: { "POSTAL STATIONARY": ["Postcard","Greeting Card","Presentation Pack","BOPP","Ancillaries"] }},
        Foreign_Stamps: { id: "04", title: "FOREIGN STAMPS", items: { "SPECIAL": ["Foreign Stamps","Joint Issue","Classic Items","Foreign First Day Covers","Foreign Miniature Sheets"] }},


    };

    const MegaMenu = ({ menuData }) => (
        <div className='group relative flex flex-col items-center gap-1 cursor-pointer '>
            <div className='flex items-center gap-1.5 px-2 transition-all duration-500'>
                {/* <span className='text-[7px] font-black text-[#BC002D] mb-1'>{menuData.id}</span> */}
                <p className='text-[10px] font-black tracking-[0.4em] uppercase text-gray-900/60 group-hover:text-black transition-colors'>{menuData.title}</p>
            </div>
            <div className='absolute top-full left-1/2 -translate-x-1/2 pt-8 hidden group-hover:block z-[110]'>
                <div className='bg-white border-t-2 border-[#BC002D] p-10 flex gap-16 w-max shadow-2xl'>
                    {Object.entries(menuData.items).map(([groupName, items], idx) => (
                        <div key={idx} className='flex flex-col min-w-[160px]'>
                            <h3 className='text-[9px] font-black text-[#D4AF37] mb-6 tracking-[0.3em] uppercase border-b border-gray-100 pb-3'>{groupName}</h3>
                            <div className='flex flex-col gap-4'>
                                {items.map((item, i) => (
                                    <Link key={i} onClick={() => { window.scrollTo(0,0); setVisible(false); }} to={`/collection?category=${encodeURIComponent(item)}`} className='text-[10px] text-gray-400 hover:text-[#BC002D] font-bold uppercase tracking-[0.2em] transition-all hover:translate-x-1'>{item}</Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className='flex items-center justify-between py-5 px-[6%] sticky top-0 z-[100] bg-white border-b border-black/[0.05] lg:p-[34px]'>
            
            {/* LOGO */}
            <Link to='/' className='flex-shrink-0 group'>
                <div className='flex items-center gap-4 mr-5'>
                    <img src={assets.logo} className='w-10 lg:w-12 group-hover:rotate-[360deg] transition-transform duration-1000' alt="PhilaBasket" />
                    <div className='hidden lg:flex flex-col'>
                        <h1 className='text-xl font-bold text-gray-900 tracking-tighter leading-none'>PHILA<span className='text-[#BC002D] italic'>BASKET</span></h1>
                        <p className='text-[7px] text-[#BC002D] font-black uppercase tracking-[0.6em]'>The Archive</p>
                    </div>
                </div>
            </Link>

            {/* DESKTOP NAV */}
            <nav className='hidden xl:flex items-center gap-10 mr-5'>
                {/* <NavLink to='/' className='group flex items-center gap-1.5'><p className='text-[10px] font-black tracking-[0.4em] text-gray-900 uppercase'>Home</p></NavLink> */}
                <MegaMenu menuData={CATEGORY_GROUPS.philatelic} />
                <MegaMenu menuData={CATEGORY_GROUPS.thematic} />
                <MegaMenu menuData={CATEGORY_GROUPS.regions} />
                <MegaMenu menuData={CATEGORY_GROUPS.gifting} />
                <MegaMenu menuData={CATEGORY_GROUPS.Foreign_Stamps} />
                <NavLink to='/blogs' className='group flex items-center gap-1.5'><p className='text-[10px] font-black tracking-[0.4em] text-gray-900 uppercase'>Blogs</p></NavLink>



            </nav>

            {/* UTILITIES */}
            <div className='flex items-center gap-4 lg:gap-7'>
                
                {/* REWARDS (Desktop) */}
                {/* REWARDS (Desktop) */}
                <div className='relative group hidden md:block'>
    {/* Added min-w-max to prevent shrinking and items-center to keep things balanced */}
    <div className='flex items-center gap-3 bg-[#BC002D] text-white px-4 py-2 min-w-max h-12 rounded-sm cursor-pointer shadow-lg shadow-[#BC002D]/10 active:scale-95 transition-all'>
        
        {/* Added flex-shrink-0 so the image never squashes */}
        <img 
            src={assets.mem} 
            alt="Rewards" 
            className='w-8 h-8 object-contain flex-shrink-0' 
        />
        
        {/* Container for text to ensure it stays on one line */}
        <div className='flex flex-col items-start leading-none'>
            <span className='text-[8px] font-black tracking-[0.2em] uppercase opacity-80'>
                Archive Vault
            </span>
            <span className='text-[11px] font-black tracking-widest uppercase mt-0.5'>
                {token ? `${userPoints} PTS` : 'Join Rewards'}
            </span>
        </div>
    </div>
</div>

                <div className='flex items-center gap-4 lg:gap-6'>
                    <Search onClick={() => { setShowSearch(true); navigate('/collection') }} size={18} className='cursor-pointer text-gray-400 hover:text-[#BC002D] transition-colors' />
                    
                    {/* WISHLIST (Desktop Direct Access) */}
                    <Link to='/wishlist' className='relative hidden md:block group'>
                        <Heart size={18} className={`transition-colors ${wishlist.length > 0 ? 'fill-[#BC002D] text-[#BC002D]' : 'text-gray-400 group-hover:text-[#BC002D]'}`} />
                        {wishlist.length > 0 && <span className='absolute -top-2 -right-2 bg-black text-white text-[7px] w-4 h-4 rounded-full flex items-center justify-center font-black'>{wishlist.length}</span>}
                    </Link>

                    <div className='group relative hidden md:block'>
                        <User onClick={() => token ? null : navigate('/login')} size={18} className='cursor-pointer text-gray-400 hover:text-black transition-colors' />
                        {token && (
                           <div className='group-hover:block hidden absolute right-0 pt-5 w-48'>
                           <div className='bg-white border-t-2 border-[#BC002D] p-5 shadow-2xl'>
                               {/* Added flex, items-center, and the Package icon to match the Sign Out style */}
                               <p 
    onClick={() => navigate('/profile')} 
    className='text-[9px] font-black text-gray-400 cursor-pointer hover:text-[#BC002D] mb-4 uppercase tracking-[0.2em] flex items-center gap-2'
>
    <User size={12} /> Account Profile
</p>
                               
                               
                               <p 
                                   onClick={() => navigate('/orders')} 
                                   className='text-[9px] font-black text-gray-400 cursor-pointer hover:text-[#BC002D] mb-4 uppercase tracking-[0.2em] flex items-center gap-2'
                               >
                                   <Package size={12} /> MY ORDERS
                               </p>
                               
                               <p 
                                   onClick={logout} 
                                   className='text-[9px] text-[#BC002D] cursor-pointer font-black uppercase tracking-[0.2em] flex items-center gap-2'
                               >
                                   <LogOut size={12} /> Sign Out
                               </p>
                           </div>
                       </div>
                        )}
                    </div>

                    <select value={currency} onChange={(e) => toggleCurrency(e.target.value)} className='bg-transparent text-black text-[10px] font-bold border-none focus:ring-0 uppercase tracking-[0.1em] cursor-pointer hidden sm:block'>
                        <option value="INR">INR ₹</option>
                        <option value="USD">USD $</option>
                    </select>

                    <Link to='/cart' className='relative active:scale-90 transition-transform'>
                        <div className='bg-black p-2 rounded-sm hover:bg-[#BC002D] transition-all'>
                            <ShoppingBag size={16} className='text-white' />
                        </div>
                        <p className='absolute -right-1.5 -top-1.5 w-4 h-4 text-[8px] flex items-center justify-center bg-[#BC002D] text-white rounded-full font-black'>{getCartCount()}</p>
                    </Link> 

                    <Menu onClick={() => setVisible(true)} size={22} className='cursor-pointer xl:hidden text-gray-900' /> 
                </div>
            </div>

            {/* --- MOBILE ARCHIVE DRAWER --- */}
            <div className={`fixed inset-0 z-[5000] transition-all duration-500 ${visible ? 'visible' : 'invisible'}`}>
                <div onClick={() => setVisible(false)} className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}></div>
                <div className={`absolute top-0 right-0 h-full w-[85%] bg-white transition-transform duration-500 ease-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
                    
                    <div className='flex flex-col h-full'>
                        {/* MOBILE DRAWER HEADER: QUICK ACTIONS ON TOP */}
                        <div className='p-6 bg-gray-50 border-b border-black/5'>
                            <div className='flex items-center justify-between mb-8'>
                                <button onClick={() => setVisible(false)} className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400'>
                                    <ArrowLeft size={14} /> Back
                                </button>
                                <img src={assets.logo} className='w-9' alt="" />
                            </div>

                            {/* MOBILE QUICK ACTION HUB */}
                            

{/* ... inside your component */}
{/* MOBILE QUICK ACTION HUB - Fixed for Zoom/Overflow */}
{/* MOBILE QUICK ACTION HUB - Zoom-Safe Implementation */}
<div className='flex items-center bg-white p-3 rounded-xl shadow-sm border border-black/5 overflow-x-auto hide-scrollbar w-full'>
    {/* 1. Search */}
    <div onClick={() => {setShowSearch(true); navigate('/collection'); setVisible(false);}} 
         className='flex flex-col items-center gap-1 min-w-[64px] flex-1 border-r border-black/5 cursor-pointer'>
        <Search size={18} className='text-[#BC002D]' />
        <span className='text-[8px] font-black uppercase tracking-tighter text-gray-400'>Search</span>
    </div>
    
    {/* 2. Wishlist */}
    <div onClick={() => {navigate('/wishlist'); setVisible(false);}} 
         className='flex flex-col items-center gap-1 min-w-[64px] flex-1 border-r border-black/5 cursor-pointer'>
        <div className='relative'>
            <Heart size={18} className={wishlist.length > 0 ? 'fill-[#BC002D] text-[#BC002D]' : 'text-gray-400'} />
            {wishlist.length > 0 && <span className='absolute -top-1 -right-1 bg-black text-white text-[6px] w-3 h-3 rounded-full flex items-center justify-center font-black'>{wishlist.length}</span>}
        </div>
        <span className='text-[8px] font-black uppercase tracking-tighter text-gray-400'>Wishlist</span>
    </div>

    {/* 3. Cart - Now protected by min-width */}
    <div onClick={() => {navigate('/cart'); setVisible(false);}} 
         className='flex flex-col items-center gap-1 min-w-[64px] flex-1 border-r border-black/5 cursor-pointer'>
        <div className='relative'>
            <ShoppingBag size={18} className='text-black' />
            <span className='absolute -top-1 -right-1 bg-[#BC002D] text-white text-[6px] w-3 h-3 rounded-full flex items-center justify-center font-black'>{getCartCount()}</span>
        </div>
        <span className='text-[8px] font-black uppercase tracking-tighter text-gray-400'>Cart</span>
    </div>

    {/* 4. Profile/Login */}
    <div onClick={() => {
        if (token) navigate('/profile'); 
        else { navigate('/login'); }
        setVisible(false);
    }} 
    className='flex flex-col items-center gap-1 min-w-[64px] flex-1 cursor-pointer group'>
        <User size={18} className='text-gray-400 group-hover:text-[#BC002D] transition-colors' />
        <span className='text-[8px] font-black uppercase tracking-tighter text-gray-400'>
            {token ? 'Profile' : 'Login'}
        </span>
    </div>
</div>
                        </div>

                        {/* Navigation Body */}
                        <div className='flex-1 overflow-y-auto p-10 space-y-10'>
                            <div className='flex flex-col gap-6'>
                                <p className='text-[8px] font-black text-[#BC002D] uppercase tracking-[0.6em]'>Registry Map</p>
                                {['Home', 'Collection', 'Orders','Blogs'].map((item, idx) => (
                                    <NavLink key={idx} onClick={() => setVisible(false)} to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className='text-4xl font-bold tracking-tighter text-gray-900 flex items-center justify-between group'>
                                        {item} <ChevronRight size={20} className='text-gray-200 group-active:text-[#BC002D]' />
                                    </NavLink>
                                ))}
                            </div>

                            {/* CURRENCY SWITCHER (MOBILE) */}
                            <div className='p-5 bg-gray-50 rounded-xl border border-black/5'>
                                <p className='text-[8px] font-black text-gray-400 uppercase tracking-widest mb-4'>Display Currency</p>
                                <div className='flex gap-2'>
                                    {['INR', 'USD'].map((c) => (
                                        <button key={c} onClick={() => toggleCurrency(c)} className={`flex-1 py-3 text-[10px] font-black rounded-lg transition-all ${currency === c ? 'bg-black text-white' : 'bg-white text-gray-400 border border-black/5'}`}>
                                            {c} {c === 'INR' ? '₹' : '$'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Identity Chip */}
                            <div className='p-6 bg-[#BC002D] text-white rounded-xl shadow-xl'>
                                <p className='text-[8px] font-black uppercase tracking-[0.3em] mb-2 opacity-60'>Vault Portfolio</p>
                                <div className='flex justify-between items-end'>
                                    <p className='text-2xl font-black tracking-tighter'>
                                        {token ? (currency === 'INR' ? `₹${(userPoints * 0.1).toFixed(2)}` : `$${(userPoints * 0.0012).toFixed(2)}`) : "GUEST"}
                                    </p>
                                    <div className='flex items-center gap-1 bg-white/20 px-2 py-1 rounded-sm'>
                                        <img src={assets.co} alt=""  />
                                        <span className='text-[8px] font-black uppercase'>{token ? `${userPoints} PTS` : "0 PTS"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Action */}
                        <div className='p-8'>
                            {token ? (
                                <button onClick={()=>{logout(); setVisible(false)}} className='w-full py-5 bg-gray-900 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-xl flex items-center justify-center gap-2'><LogOut size={14}/> Logout</button>
                            ) : (
                                <button onClick={()=>{navigate('/login'); setVisible(false)}} className='w-full py-5 bg-[#BC002D] text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-xl shadow-lg'>Login</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;