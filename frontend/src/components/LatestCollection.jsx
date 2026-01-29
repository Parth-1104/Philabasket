import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from './ProductItem';
import { Link, useNavigate } from 'react-router-dom';

const LatestCollection = () => {
    const { products } = useContext(ShopContext);
    const [latestProducts, setLatestProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setLatestProducts(products.slice(0, 8));
    }, [products]);

    return (
        <div className='bg-white py-24 md:py-32 px-6 md:px-16 lg:px-24 transition-colors duration-700 select-none'>
            
            {/* --- Editorial Header --- */}
            <div className='flex flex-col md:flex-row justify-between items-end mb-16 md:mb-24 gap-8 border-b border-black/5 pb-12 md:pb-16'>
                <div className="max-w-2xl">
                    <div className="flex items-center gap-4 mb-4 md:mb-6">
                        <span className="h-[1px] w-8 md:w-12 bg-[#BC002D]"></span>
                        <span className="text-[9px] md:text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-bold">
                            Featured Specimens
                        </span>
                    </div>
                    <h2 className="text-5xl md:text-9xl font-serif text-black leading-[0.9] mb-4 tracking-tighter">
                        New <br />
                        <span className="italic font-light text-black/20 pl-8 md:pl-24">Arrivals.</span>
                    </h2>
                </div>
                
                <div className="hidden md:block md:w-1/3 text-right">
                    <p className='text-base text-gray-400 font-light leading-relaxed mb-8 tracking-wide max-w-sm ml-auto'>
                        A meticulously curated selection of the world's rarest philatelic specimens, 
                        unveiled for the first time in the <span className='text-black font-medium italic'>Archives.</span>
                    </p>
                    <button 
                        onClick={() => navigate('/collection')}
                        className="group relative text-[10px] text-black font-black tracking-[0.4em] uppercase pb-2"
                    >
                        View Full Gallery
                        <div className='absolute bottom-0 left-0 w-full h-[1px] bg-black group-hover:bg-[#BC002D] transition-colors'></div>
                    </button>
                </div>
            </div>

            {/* --- Desktop: Asymmetric Grid | Mobile: Horizontal Snap Slider --- */}
            {/* - flex overflow-x-auto: Enables horizontal scrolling on mobile
                - snap-x snap-mandatory: Ensures items 'lock' into place when swiping
                - md:grid: Reverts back to your asymmetric editorial grid on desktop
            */}
            <div className='flex overflow-x-auto pb-10 gap-6 snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-4 md:gap-x-12 md:gap-y-32 md:overflow-visible md:pb-0'>
                {latestProducts.map((item, index) => (
                    <div 
                        key={index} 
                        className={`min-w-[80vw] sm:min-w-[50vw] md:min-w-0 snap-center transition-all duration-[1.2s] ease-out transform 
                            ${index % 2 !== 0 ? 'md:translate-y-24' : ''} 
                            hover:-translate-y-6 group`}
                    >
                        {/* Frame */}
                        <div className="relative overflow-hidden bg-[#F9F9F9] aspect-[3/4] flex items-center justify-center p-8 md:p-10 mb-6 md:mb-8 border border-black/5 group-hover:border-[#D4AF37]/40 transition-all duration-700 shadow-[0_10px_30px_rgba(0,0,0,0.02)] md:group-hover:shadow-[0_30px_70px_rgba(0,0,0,0.08)]">
                            <ProductItem 
                                id={item._id} 
                                image={item.image} 
                                name={item.name} 
                                price={item.price} 
                                category={item.category[0]}
                                linkToFilter={true}
                            />
                            
                            {/* Hinge Details */}
                            <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-[#BC002D]/0 group-hover:border-[#BC002D]/60 transition-all duration-500"></div>
                            <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-[#BC002D]/0 group-hover:border-[#BC002D]/60 transition-all duration-500"></div>
                        </div>

                        {/* Mobile Visibility: Metadata is always visible on mobile, hover-only on desktop */}
                        <div className='flex justify-between items-start opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-700 md:transform md:translate-y-4 md:group-hover:translate-y-0'>
                            <p className='text-[8px] md:text-[9px] font-bold tracking-[0.3em] text-[#BC002D] uppercase'>Certified</p>
                            <p className='text-[8px] md:text-[9px] font-bold tracking-[0.3em] text-black/20 uppercase'>{item.year || '2026'}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile "Swipe" Hint */}
            <div className='md:hidden flex items-center justify-center gap-2 mt-4 opacity-30'>
                <div className='w-8 h-[1px] bg-black'></div>
                <p className='text-[8px] uppercase tracking-[0.4em] font-bold'>Swipe to inspect</p>
                <div className='w-8 h-[1px] bg-black'></div>
            </div>
            
            {/* --- Invitation Footer --- */}
            <div className='mt-32 md:mt-64 text-center relative py-24 md:py-40 overflow-hidden bg-[#FBFBFB] border border-black/5'>
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] md:text-[18vw] font-serif pointer-events-none uppercase tracking-tighter whitespace-nowrap opacity-[0.02] text-black italic">
                    Archives
                </span>
                
                <div className="relative z-10 flex flex-col items-center">
                    <p className="text-black/30 text-[8px] md:text-[9px] tracking-[0.6em] uppercase font-bold mb-6">Maison Philatelic</p>
                    <h3 className="text-black text-4xl md:text-6xl font-serif mb-12 tracking-tight leading-none">
                        Private <br className='md:hidden'/> <span className="italic text-[#BC002D]">Acquisitions.</span>
                    </h3>
                    <Link 
    to='/collection' 

    onClick={() => window.scrollTo(0, 0)}
    className='group relative inline-block px-10 md:px-14 py-4 md:py-5 overflow-hidden border border-black transition-all duration-700 rounded-sm'
>
    <span className="absolute inset-0 w-0 bg-black transition-all duration-500 group-hover:w-full"></span>
    <span className="relative z-10 text-black group-hover:text-white text-[9px] md:text-[10px] tracking-[0.5em] font-black uppercase transition-colors duration-500">
        Enter the Collection
    </span>
</Link>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
};

export default LatestCollection;