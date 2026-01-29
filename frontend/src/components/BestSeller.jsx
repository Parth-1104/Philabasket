import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import ProductItem from './ProductItem';

const BestSeller = () => {

    const { products } = useContext(ShopContext);
    const [bestSeller, setBestSeller] = useState([]);

    useEffect(() => {
        const bestProduct = products.filter((item) => (item.bestseller));
        setBestSeller(bestProduct.slice(0, 5));
    }, [products]);

    return (
        <div className='bg-[#FDFDFD] py-24 md:py-32 px-6 md:px-16 lg:px-24 border-t border-black/[0.03] select-none'>
            
            {/* --- Curatorial Header --- */}
            <div className='flex flex-col items-center text-center mb-20 md:mb-24'>
                <div className="flex items-center gap-6 mb-6">
                    <div className="h-[1px] w-8 md:w-12 bg-black/10"></div>
                    <span className="text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-bold">
                        The Masterpiece Gallery
                    </span>
                    <div className="h-[1px] w-8 md:w-12 bg-black/10"></div>
                </div>

                <h2 className="text-5xl md:text-8xl font-serif text-black tracking-tighter leading-none mb-8">
                    Most <span className="italic font-light text-black/20">Coveted.</span>
                </h2>

                <div className="max-w-xl mx-auto">
                    <p className='text-xs md:text-sm text-gray-400 font-light leading-relaxed tracking-widest uppercase'>
                        A curated selection of the most sought-after philatelic treasures defining the <span className='text-black font-medium'>PhilaBasket Legacy</span>.
                    </p>
                </div>
            </div>

            {/* --- Mobile: Horizontal Scroll | Desktop: 5-Column Grid --- */}
            <div className='flex overflow-x-auto pb-10 gap-8 snap-x snap-mandatory hide-scrollbar lg:grid lg:grid-cols-5 lg:gap-x-10 lg:overflow-visible lg:pb-0'>
                {
                    bestSeller.map((item, index) => (
                        <div 
                            key={index} 
                            className="min-w-[75vw] sm:min-w-[40vw] lg:min-w-0 snap-center group relative transition-all duration-700"
                        >
                            {/* Archival Rank Indicator (Elegantly subtle) */}
                            <div className="absolute -top-4 left-0 z-20 flex items-center gap-2">
                                <span className="text-[10px] font-black text-[#D4AF37] tracking-widest uppercase">
                                    N° 0{index + 1}
                                 Marquis
                                </span>
                            </div>
                            
                            {/* Product Item Wrapper */}
                            <div className='pt-4'>
                                <ProductItem 
                                    id={item._id} 
                                    name={item.name} 
                                    image={item.image} 
                                    price={item.price} 
                                    category={item.category[0]}
                                />
                            </div>

                            {/* Red Status Accent - Appears on Hover */}
                            <div className='absolute top-1/2 -right-2 transform -translate-y-1/2 w-[1px] h-0 bg-[#BC002D] group-hover:h-24 transition-all duration-700 hidden lg:block'></div>
                        </div>
                    ))
                }
            </div>

            {/* --- Bottom Hallmark --- */}
            <div className="mt-20 md:mt-32 flex flex-col items-center gap-6">
                <div className='h-12 w-[1px] bg-gradient-to-b from-black/20 to-transparent'></div>
                <p className='text-[8px] tracking-[0.8em] text-black/20 uppercase font-black'>
                    Verified Philatelic Provenance
                </p>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    )
}

export default BestSeller;