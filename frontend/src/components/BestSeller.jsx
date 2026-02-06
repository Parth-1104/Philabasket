import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import ProductItem from './ProductItem';
import { useNavigate } from 'react-router-dom';

const BestSeller = () => {
    const { products } = useContext(ShopContext);
    const [bestSeller, setBestSeller] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Taking top 4 best sellers
        const sortedProducts = [...products]
            .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
            .slice(0, 4);
        
        setBestSeller(sortedProducts);
    }, [products]);

    return (
        <div className='bg-white py-22 md:py-32 lg:mt-[-14vh] overflow-hidden select-none relative border-t border-black/[0.03]'>
            
            {/* --- Decorative Hero-Curve Accent --- */}
            <div className="absolute -right-[15vw] top-[20%] h-[70%] w-[45%] bg-[#bd002d]/5 rounded-l-[600px] pointer-events-none"></div>

            <div className='px-6 md:px-16 lg:px-24 relative z-10'>
                
                {/* --- Curatorial Header --- */}
                <div className='flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8'>
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="h-[1px] w-12 bg-[#BC002D]"></span>
                            <span className="text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-black">
                                Acquisition Rank
                            </span>
                        </div>
                        <h2 className="text-5xl md:text-8xl font-bold text-gray-900 tracking-tighter leading-none">
                            TOP <br />
                            <span className="text-[#bd002d]">SELLING.</span>
                        </h2>
                    </div>
                    
                    <div className="hidden md:block text-right max-w-xs">
                        <p className='text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed'>
                            The top specimens defining the <span className='text-black'>PhilaBasket Legacy</span>, ranked by historical acquisition volume.
                        </p>
                    </div>
                </div>

                {/* --- Ranked Grid: SYNCED SIZING WITH LATEST --- */}
                {/* Fixed gap and min-w to allow 2-column feel on mobile */}
                <div className='flex overflow-x-auto gap-6 md:gap-x-12 snap-x snap-mandatory mobile-scrollbar lg:grid lg:grid-cols-4 lg:gap-y-20 lg:overflow-visible pb-10 lg:pb-0 px-2'>
    {
        bestSeller.map((item, index) => (
            <div 
                key={index} 
                onClick={() => {
                    navigate(`/product/${item._id}`);
                    window.scrollTo(0, 0);
                }} 
                /* MOBILE SCALE: Increased min-w to 85% to match LatestCollection */
                className="min-w-[85%] sm:min-w-[45vw] lg:min-w-0 snap-center group relative transition-all duration-700 cursor-pointer"
            >
                {/* Visual Rank Badge - Adjusted positioning for larger cards */}
                <div className="absolute -top-2 -left-2 z-20 pointer-events-none">
                    <div className="bg-[#bd002d] text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex flex-col items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500 border-2 border-white">
                        <span className="text-[6px] md:text-[8px] font-black leading-none opacity-60">RANK</span>
                        <span className="text-sm md:text-xl font-black leading-none">0{index + 1}</span>
                    </div>
                </div>
                
                {/* Card Content */}
                <div className='pt-4 md:pt-6'>
                    {/* MOBILE CONTAINER: aspect-[3/4.5] for that tall, premium archival look */}
                    <div className="relative aspect-[3/4.5] lg:aspect-[3/4] bg-white border border-gray-100 p-1 md:p-3 shadow-lg transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-2xl group-hover:border-[#bd002d]/20 overflow-hidden rounded-br-[40px] md:rounded-br-[60px]">
                        
                        <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                            <div className="w-1 h-1 bg-[#D4AF37] rounded-full animate-pulse shadow-[0_0_5px_#D4AF37]"></div>
                            <span className="text-[7px] font-black text-gray-400 uppercase tracking-tighter">High Demand</span>
                        </div>
    
                        {/* INNER SPECIMEN AREA: Reduced padding to p-1 to let the image grow */}
                        <div className="w-full h-full bg-[#f8f8f8] flex items-center justify-center p-1 md:p-4 rounded-br-[35px] md:rounded-br-[40px]">
                            <div className="w-full h-full" onClick={(e) => e.stopPropagation()}>
                                <ProductItem 
                                    id={item._id} 
                                    name={item.name} 
                                    image={item.image} 
                                    price={item.price} 
                                    marketPrice={item.marketPrice}
                                    category={item.category[0]}
                                    linkToFilter={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ))
    }
</div>

                {/* --- Bottom Hallmark --- */}
                <div className="mt-16 md:mt-32 flex flex-col items-center gap-6">
                    <div className='h-12 md:h-16 w-[1px] bg-gradient-to-b from-[#bd002d] to-transparent'></div>
                    <p className='text-[8px] tracking-[0.8em] text-black/20 uppercase font-black'>
                        Verified Philatelic Provenance
                    </p>
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
    )
}

export default BestSeller;