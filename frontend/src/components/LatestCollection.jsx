import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from './ProductItem';
import { Link, useNavigate } from 'react-router-dom';

const ALL_CATEGORIES = [
    "AgriCulture Stamp", "Airmail", "Americas", "Ancillaries", "Animal & WildLife", 
    "Army", "Army Postal Cover APC", "Asia", "Autograph Cover", "Aviation Stamps", 
    "Bank", "Bird Stamps", "Block of Four", "Block of Four with Traffic light", 
    "Booklet", "BOPP", "Bridge Stamps", "Brochure Blank", "Brochure with MS", 
    "Brochure with stamp", "Buddha / Buddhism", "Building Stamps", "Butterfly & Insects", 
    "Carried Cover", "Cars", "Catalogue", "Children's Day Series", "Christianity", 
    "Christmas", "Cinema on Stamps", "Classic Items", "Coffee", "Color Cancellation", 
    "Commemorative", "Commemorative Coin", "Commemorative Year", "Country", "Covid 19", 
    "Cricket", "Cultural Theme", "Currency Stamps", "Dance Stamps", "Definitive", 
    "Definitive Block", "Definitive Number Strip", "Definitive Sheet", "Definitive Stamp", 
    "Educational Institute", "Environment", "Error", "Europe", "Exhibition Special", 
    "Face Value", "Fauna and Flora", "Festival", "First Day Cover", "First Day Cover Blank", 
    "First Day Cover Commercial Used", "First Day Cover with Miniature Sheet", 
    "First Flight/ AirMail", "Flag", "Food on Stamps", "FootBall", "Foreign First Day Covers", 
    "Foreign Miniature Sheets", "Foreign Stamps", "Fort / Castle/ Palace", "Fragrance Stamps", 
    "Freedom", "Freedom Fighter", "Full Sheet", "Gandhi Stamps", "GI Tag", "Greeting Card", 
    "Greetings", "Hinduism", "Historical", "Historical Place", "Indian Theme", "Jainism", 
    "Joint Issue", "Judiciary System", "Kumbh", "Light House", "Literature", 
    "Locomotive / Trains", "Marine / Fish", "Medical / Health", "Meghdoot", 
    "Miniature Sheets", "Musical Instrument", "My Stamp", "News Paper", 
    "Odd Shape / Unusual", "Olympic", "Organizations", "Personality", 
    "Place Cancellation", "Post Office", "Postal Stationery", "Postcard / Maxim Card", 
    "PPC", "Presentation Pack", "Ramayana", "Rare", "Red Cross", "River / Canal", 
    "RSS Rashtriya Swayamsevak Sangh", "Scout", "SheetLet", "Ships", "Sikhism", 
    "Single Stamp", "Single Stamp with Traffic light", "Social Message", "Space", 
    "Special Cancellation", "Special Cover", "Sports Stamps", "Stamp on Stamp", 
    "Technology", "Temple", "Tiger", "Transport", "United Nations UN", "Women Power", 
    "WWF", "Year", "Year Pack", "Yoga"
];

const LatestCollection = () => {
    const { products } = useContext(ShopContext);
    const [latestProducts, setLatestProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setLatestProducts(products.slice(0, 6)); 
    }, [products]);

    return (
        <div className='bg-white py-12 md:py-32 overflow-hidden select-none relative'>
            
            {/* --- Hero-style Curve Accent --- */}
            <div className="absolute -left-[10vw] top-[10%] h-[80%] w-[35%] bg-[#bd002d]/5 rounded-r-[600px] pointer-events-none"></div>

            <div className='px-6 md:px-16 lg:px-24 relative z-10'>
                
                {/* --- Header Section --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 border border-[#BC002D] rounded-full flex items-center justify-center">
                                <span className="text-[10px] font-serif italic text-[#BC002D] font-bold">PB</span>
                            </div>
                            <span className="text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-black">Featured Specimens</span>
                        </div>
                        <h2 className="text-5xl md:text-8xl font-bold text-gray-900 tracking-tighter leading-none">
                            NEW <span className="text-[#bd002d]">Arrivals.</span>
                        </h2>
                    </div>
                </div>

                <div className='flex flex-col lg:flex-row gap-12'>
                    
                    {/* --- CATEGORY NAVIGATION --- */}
                    <div className='w-full lg:w-1/4'>
                        <div className='lg:sticky lg:top-32'>
                            <div className='bg-[#bd002d] p-6 lg:p-8 rounded-[30px] lg:rounded-[40px] shadow-2xl shadow-[#bd002d]/20 relative overflow-hidden'>
                                <div className='flex items-center justify-between mb-4 lg:mb-6 relative z-10'>
                                    <h3 className='text-white font-black text-[9px] lg:text-xs tracking-[0.3em] uppercase'>Categories</h3>
                                    <Link to='/collection' className='text-amber-400 text-[8px] lg:hidden font-black uppercase'>View All</Link>
                                </div>

                                <div className='flex flex-row lg:flex-col gap-3 lg:gap-4 overflow-x-auto lg:overflow-visible hide-scrollbar relative z-10 pb-2 lg:pb-0'>
                                    {ALL_CATEGORIES.slice(0, 30).map((cat) => (
                                        <button 
                                            key={cat}
                                            onClick={() => {
                                                navigate(`/collection?category=${encodeURIComponent(cat)}`);
                                                window.scrollTo(0, 0);
                                            }}
                                            className='whitespace-nowrap lg:whitespace-normal bg-white/10 lg:bg-transparent border border-white/10 lg:border-none px-4 py-2 lg:p-0 rounded-full lg:rounded-none text-white/70 hover:text-white text-[10px] lg:text-xs font-bold tracking-widest uppercase text-left transition-all flex items-center gap-3 group/item'
                                        >
                                            <span className='hidden lg:block w-0 h-[1px] bg-amber-400 group-hover/item:w-4 transition-all'></span>
                                            {cat}
                                        </button>
                                    ))}
                                    
                                    <Link to='/collection' onClick={() => {
        window.scrollTo(0, 0);}}  className='hidden lg:flex mt-6 py-4 border-t border-white/10 items-center justify-between group/more'>
                                        <span className='text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]'>Explore All Categories</span>
                                        <span className='text-white group-hover/more:translate-x-2 transition-transform'>→</span>
                                    </Link>
                                </div>
                            </div>
                            
                            <div className='hidden lg:block p-8 border border-gray-100 rounded-[40px] bg-gray-50/50 mt-8'>
                                <p className='text-[10px] font-black text-[#bd002d] uppercase tracking-widest mb-2'>Total Inventory</p>
                                <p className='text-3xl font-bold text-gray-900 tracking-tighter'>1,00,480+ <span className='text-sm text-gray-400 font-normal tracking-normal'>Items</span></p>
                            </div>
                        </div>
                    </div>

                    {/* --- MAIN PRODUCT GRID: SYNCED SIZING WITH BESTSELLER --- */}
                    <div className='w-full lg:w-3/4'>
                        {/* Changed gap-x-8 to gap-x-12 for desktop grid sync */}
                        <div className='flex overflow-x-auto lg:grid lg:grid-cols-3 gap-x-6 md:gap-x-12 gap-y-16 pb-10 lg:pb-0 snap-x snap-mandatory mobile-scrollbar'>
                            {latestProducts.map((item, index) => (
                                <div key={index} className="min-w-[85vw] sm:min-w-[45vw] lg:min-w-0 snap-center flex flex-col group cursor-pointer">
                                    {/* Card Container matched to BestSeller curve and hover translation */}
                                    <div className="relative aspect-[3/4] bg-white border border-gray-100 p-3 shadow-sm transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-2xl group-hover:border-[#bd002d]/20 overflow-hidden rounded-br-[40px] md:rounded-br-[60px]">
                                    <div className="absolute top-0 right-0 z-20 overflow-hidden w-24 h-24 pointer-events-none">
    <div className="absolute top-[18%] -right-[32%] bg-[#bd002d] text-white text-[7px] md:text-[8px] font-black py-1.5 w-[140%] text-center transform rotate-45 shadow-sm">
        Latest
    </div>
</div>
                                        {/* Inner Frame matched to BestSeller rounding and padding */}
                                        <div className="w-full h-full bg-[#f8f8f8] flex items-center justify-center p-4 relative rounded-br-[30px] md:rounded-br-[40px]">
                                            <ProductItem 
                                                id={item._id} 
                                                image={item.image} 
                                                name={item.name} 
                                                price={item.price} 
                                                category={item.category[0]}
                                                linkToFilter={true}
                                            />
                                        </div>
                                    </div>
                                    {/* Synced Info Section with BestSeller typography and underline effect */}
                                    {/* <div className="mt-6 space-y-2 px-2">
                                        <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase text-[#bd002d]/60">
                                            <span>{item.country || 'Registry'}</span>
                                            <span>{item.year || '2026'}</span>
                                        </div>
                                        <h3 className="text-gray-900 font-bold text-base md:text-lg truncate group-hover:text-[#bd002d] transition-colors">
                                            {item.name}
                                        </h3>
                                        <div className="h-[1.5px] w-0 group-hover:w-full bg-[#bd002d] transition-all duration-700"></div>
                                    </div> */}
                                </div>
                            ))}
                        </div>
                        <p className='lg:hidden text-[8px] font-black uppercase tracking-[0.4em] text-gray-300 text-center mt-4 animate-pulse'>
                            Scroll for more specimens
                        </p>
                    </div>
                </div>

                {/* --- Footer Invitation --- */}
                <div className='rounded-[40px] md:rounded-[100px] overflow-hidden mt-16 lg:mt-[10vh] bg-[#bd002d] py-8 lg:mt-[10vh] px-10 relative flex flex-col items-center shadow-2xl'>
                    <span className="absolute inset-0 flex items-center justify-center text-white/5 text-[30vw] md:text-[20vw] font-bold pointer-events-none select-none italic">ARCHIVES</span>
                    <div className="relative z-10 text-center">
                        <h3 className="text-white text-3xl md:text-6xl font-bold mb-8 tracking-tighter leading-none">
                            Secure Rare <br className='hidden md:block'/> <span className="italic text-amber-400">Acquisitions.</span>
                        </h3>
                        <Link to='/collection' onClick={() => window.scrollTo(0, 0)} className='inline-block px-12 py-5 bg-white text-gray-900 text-[10px] font-black uppercase tracking-[0.5em] rounded-full hover:bg-amber-400 transition-all duration-500 hover:scale-110 shadow-xl'>Enter the Collection</Link>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                @media (max-width: 1023px) {
                    .mobile-scrollbar::-webkit-scrollbar {
                        display: block;
                        height: 3px;
                    }
                    .mobile-scrollbar::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        margin: 0 10vw;
                        border-radius: 10px;
                    }
                    .mobile-scrollbar::-webkit-scrollbar-thumb {
                        background: #bd002d;
                        border-radius: 10px;
                    }
                }
                
                @media (min-width: 1024px) {
                    .mobile-scrollbar::-webkit-scrollbar { display: none; }
                }
            `}} />
        </div>
    );
};

export default LatestCollection;