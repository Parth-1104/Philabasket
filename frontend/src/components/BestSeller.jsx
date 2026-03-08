import React, { useContext, useEffect, useState, useRef } from 'react'
import { ShopContext } from '../context/ShopContext'
import ProductItem from './ProductItem';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const BestSeller = () => {
    const { products } = useContext(ShopContext);
    const [bestSeller, setBestSeller] = useState([]);
    const [scrollProgress, setScrollProgress] = useState(0);
    const scrollRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Remove .slice(0, 5) to show ALL bestsellers in the scroll
        const curatedBestsellers = products
            .filter(item => item.bestseller === true || item.bestseller === "true")
            .sort((a, b) => b.date - a.date);
        
        setBestSeller(curatedBestsellers);
    }, [products]);

    // 2. Scroll Tracking Logic
    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
            setScrollProgress(progress);
        }
    };

    return (
        <div className='bg-white py-22 md:py-32 lg:mt-[-14vh] overflow-hidden select-none relative border-t border-black/[0.03]'>
            
            {/* Background Decorative Accent */}
            <div className="absolute -right-[15vw] top-[20%] h-[70%] w-[45%] bg-[#bd002d]/5 rounded-l-[600px] pointer-events-none"></div>

            <div className='px-6 md:px-16 lg:px-24 relative z-10'>
                
                {/* Section Header */}
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
                            A comprehensive scroll of specimens defining the <span className='text-black'>PhilaBasket Legacy</span>.
                        </p>
                    </div>
                </div>

                {/* --- HORIZONTAL SCROLLABLE REGISTRY --- */}
                <div className='relative'>
                    <div 
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className='flex overflow-x-auto gap-6 md:gap-x-12 pb-5 pt-8 hide-scrollbar snap-x snap-mandatory'
                    >
                        {
                            bestSeller.length > 0 ? bestSeller.map((item, index) => (
                                <div 
                                    key={index} 
                                    className="min-w-[65%] sm:min-w-[45vw] lg:min-w-[220px] snap-center group relative transition-all duration-700"
                                >
                                    {/* Sovereign Rank Badge */}
                                    <div className="absolute -top-2 -left-2 z-20 pointer-events-none">
                                        <div className="bg-[#bd002d] text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex flex-col items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500 border-2 border-white">
                                            <span className="text-[6px] md:text-[8px] font-black leading-none opacity-60">RANK</span>
                                            <span className="text-sm md:text-xl font-black leading-none">0{index + 1}</span>
                                        </div>
                                    </div>
                                    
                                    <div className='pt-4 md:pt-6 h-full'>
                                        <div 
                                            onClick={() => {
                                                const seed = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                                                navigate(`/product/${item._id}/${seed}`); 
                                                window.scrollTo(0, 0); 
                                            }}
                                            className="flex flex-col h-full relative bg-white border border-gray-100 shadow-lg cursor-pointer transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-2xl group-hover:border-[#bd002d]/20 overflow-hidden rounded-br-[40px] md:rounded-br-[60px]"
                                        > 
                                            <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                                                <div className="w-1 h-1 bg-[#D4AF37] rounded-full animate-pulse shadow-[0_0_5px_#D4AF37]"></div>
                                                <span className="text-[7px] font-black text-gray-400 uppercase tracking-tighter">High Demand</span>
                                            </div>
                        
                                            <div className="flex-grow p-1 md:p-3">
                                                <div className="w-full h-full bg-[#f8f8f8] flex items-center justify-center p-0 md:p-0 rounded-br-[35px] md:rounded-br-[40px]">
                                                    <ProductItem 
                                                        id={item._id} 
                                                        _id={item._id}
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
                            )) : null
                        }
                    </div>

                    {/* Gradient Fade for Desktop hinting more items */}
                    {/* <div className='absolute right-0 top-0 bottom-12 w-32 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none hidden lg:block'></div> */}
                </div>

                {/* --- CUSTOM SCROLL PROGRESS BAR --- */}
                <div className='mt-8 flex items-center gap-6 max-w-sm'>
                    <span className='text-[8px] font-black text-gray-300 uppercase tracking-widest'>Rank 01</span>
                    <div className='relative h-[2px] flex-1 bg-gray-100 rounded-full overflow-hidden'>
                        <div 
                            className='absolute left-0 top-0 h-full bg-[#BC002D] transition-all duration-300 ease-out'
                            style={{ width: `${scrollProgress}%` }}
                        />
                    </div>
                    <span className='text-[8px] font-black text-gray-300 uppercase tracking-widest'>End Archive</span>
                </div>

                {/* Footer Hallmark */}
                <div className="mt-16 md:mt-32 flex flex-col items-center gap-6">
                    <div className='h-12 md:h-16 w-[1px] bg-gradient-to-b from-[#bd002d] to-transparent'></div>
                    <p className='text-[8px] tracking-[0.8em] text-black/20 uppercase font-black text-center'>
                        Verified Philatelic Provenance
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                @media (max-width: 1023px) {
                    .hide-scrollbar::-webkit-scrollbar { display: block; height: 3px; }
                    .hide-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; margin: 0 10vw; border-radius: 10px; }
                    .hide-scrollbar::-webkit-scrollbar-thumb { background: #bd002d; border-radius: 10px; }
                }
            `}} />
        </div>
    )
}

export default BestSeller;