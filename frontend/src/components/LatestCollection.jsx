import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from './ProductItem';
import { Link, useNavigate } from 'react-router-dom';

const ALL_CATEGORIES = [
  "AgriCulture Stamp", "Airmail", "Americas", "Ancillaries", "Animal & WildLife", 
  "Army", "Army Postal Cover APC", "Asia", "Autograph Cover", "Aviation Stamps", 
  "Bank", "Bird Stamps", "Block of Four", "Ramayana", "Rare", "Yoga"
  // ... rest of categories
];

const LatestCollection = () => {
    const { products } = useContext(ShopContext);
    const [latestProducts, setLatestProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setLatestProducts(products.slice(0, 6)); // Adjusted to 6 for bento layout balance
    }, [products]);

    return (
        <div className='bg-white py-24 md:py-32 overflow-hidden select-none relative'>
            
            {/* --- Hero-style Curve Accent --- */}
            <div className="absolute -left-[10vw] top-[10%] h-[80%] w-[35%] bg-[#bd002d]/5 rounded-r-[600px] pointer-events-none"></div>

            <div className='px-6 md:px-16 lg:px-24 relative z-10'>
                
                {/* --- Header Section --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 border border-[#BC002D] rounded-full flex items-center justify-center">
                                <span className="text-[10px] font-serif italic text-[#BC002D] font-bold">PB</span>
                            </div>
                            <span className="text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-black">Featured Specimens</span>
                        </div>
                        <h2 className="text-6xl md:text-8xl font-bold text-gray-900 tracking-tighter leading-none">
                            NEW <span className="text-[#bd002d]">Arrivals.</span>
                        </h2>
                    </div>
                </div>

                <div className='flex flex-col lg:flex-row gap-12'>
                    
                    {/* --- CATEGORY SIDEBAR --- */}
                    <div className='w-full lg:w-1/4'>
                        <div className='sticky top-32 space-y-8'>
                            <div className='bg-[#bd002d] p-8 rounded-[40px] shadow-2xl shadow-[#bd002d]/20 relative overflow-hidden group transition-all hover:scale-[1.02]'>
                                <h3 className='text-white font-black text-xs tracking-[0.3em] uppercase mb-6 relative z-10'>Registry Categories</h3>
                                
                                <div className='flex flex-col gap-4 relative z-10'>
                                    {ALL_CATEGORIES.slice(0, 10).map((cat) => (
                                        <button 
                                            key={cat}
                                            onClick={() => navigate('/collection')}
                                            className='text-white/70 hover:text-white text-xs font-bold tracking-widest uppercase text-left transition-colors flex items-center gap-3 group/item'
                                        >
                                            <span className='w-0 h-[1px] bg-amber-400 group-hover/item:w-4 transition-all'></span>
                                            {cat}
                                        </button>
                                    ))}
                                    
                                    {/* View All Categories Trigger */}
                                    <Link 
                                        to='/collection'
                                        className='mt-6 py-4 border-t border-white/10 flex items-center justify-between group/more'
                                    >
                                        <span className='text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]'>Explore All Categories</span>
                                        <span className='text-white group-hover/more:translate-x-2 transition-transform'>→</span>
                                    </Link>
                                </div>
                                
                                {/* Background Ghost Text */}

                            </div>
                            
                            {/* Analytics Mini-Card */}
                            <div className='p-8 border border-gray-100 rounded-[40px] bg-gray-50/50 hidden lg:block'>
                                <p className='text-[10px] font-black text-[#bd002d] uppercase tracking-widest mb-2'>Total Inventory</p>
                                <p className='text-3xl font-bold text-gray-900 tracking-tighter'>12,480+ <span className='text-sm text-gray-400 font-normal tracking-normal'>Items</span></p>
                            </div>
                        </div>
                    </div>

                    {/* --- MAIN PRODUCT GRID --- */}
                    <div className='w-full lg:w-3/4'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16'>
                            {latestProducts.map((item, index) => (
                                <div key={index} className="flex flex-col group cursor-pointer">
                                    <div className="relative aspect-[3/4] bg-white border border-gray-100 p-3 shadow-sm transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-2xl overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-[#bd002d] text-white text-[8px] font-black px-4 py-1.5 transform rotate-45 translate-x-4 -translate-y-1 z-20">CERTIFIED</div>
                                        <div className="w-full h-full bg-[#f8f8f8] flex items-center justify-center p-4 relative">
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
                                    <div className="mt-6 space-y-1">
                                        <p className="text-[10px] font-black tracking-widest uppercase text-[#bd002d]/60">{item.year || '2026'} Specimen</p>
                                        <h3 className="text-gray-900 font-bold text-base truncate group-hover:text-[#bd002d] transition-colors">{item.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mobile View All Button */}
                        <div className='mt-12 lg:hidden text-center'>
                             <button onClick={() => navigate('/collection')} className='w-full py-5 bg-[#bd002d] text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full'>Initialize Full Collection</button>
                        </div>
                    </div>
                </div>

                {/* --- Footer Invitation --- */}
                <div className='mt-32 rounded-[100px] overflow-hidden bg-[#bd002d] py-24 px-10 relative flex flex-col items-center shadow-2xl'>
                    <span className="absolute inset-0 flex items-center justify-center text-white/5 text-[20vw] font-bold pointer-events-none select-none italic">ARCHIVES</span>
                    <div className="relative z-10 text-center">
                        <h3 className="text-white text-4xl md:text-6xl font-bold mb-8 tracking-tighter leading-none">
                            Secure Rare <br className='hidden md:block'/> <span className="italic text-amber-400">Acquisitions.</span>
                        </h3>
                        <Link to='/collection' onClick={() => window.scrollTo(0, 0)} className='inline-block px-12 py-5 bg-white text-gray-900 text-[10px] font-black uppercase tracking-[0.5em] rounded-full hover:bg-amber-400 transition-all duration-500 hover:scale-110 shadow-xl'>Enter the Collection</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LatestCollection;