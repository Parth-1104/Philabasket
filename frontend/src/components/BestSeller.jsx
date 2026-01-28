import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import ProductItem from './ProductItem';

const BestSeller = () => {

    const { products } = useContext(ShopContext);
    const [bestSeller, setBestSeller] = useState([]);

    useEffect(() => {
        // Filter products based on the bestseller boolean
        const bestProduct = products.filter((item) => (item.bestseller));
        setBestSeller(bestProduct.slice(0, 5));
    }, [products]);

    return (
        <div className='bg-[#0a0a0a] py-32 px-6 md:px-16 lg:px-24 border-t border-[#B8860B]/10'>
            
            {/* --- Royal Header Section --- */}
            <div className='flex flex-col items-center text-center mb-24'>
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#B8860B]"></div>
                    <span className="text-[10px] md:text-xs tracking-[0.5em] text-[#B8860B] uppercase font-light">
                        The Masterpiece Gallery
                    </span>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#B8860B]"></div>
                </div>

                <h2 className="text-5xl md:text-7xl font-serif text-white tracking-tight leading-tight">
                    Most <span className="italic font-light text-[#B8860B]/80">Coveted</span>
                </h2>

                <div className="mt-8 max-w-2xl relative">
                    <p className='text-sm md:text-base text-gray-400 font-light leading-relaxed tracking-wide'>
                        A curated selection of our most sought-after philatelic treasures. 
                        Rare classic issues and popular thematic releases that define the PhilaBasket legacy.
                    </p>
                    <div className="h-[1px] w-24 bg-[#B8860B] mx-auto mt-8 opacity-30"></div>
                </div>
            </div>

            {/* --- High-Contrast Product Grid --- */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-16'>
                {
                    bestSeller.map((item, index) => (
                        <div 
                            key={index} 
                            className="group relative transition-all duration-700 hover:scale-[1.03]"
                        >
                            {/* Decorative Rank Number (Luxury Detail) */}
                            <span className="absolute -top-6 -left-2 text-4xl font-serif text-white/5 group-hover:text-[#B8860B]/10 transition-colors duration-500 pointer-events-none">
                                0{index + 1}
                            </span>
                            
                            <ProductItem 
                                id={item._id} 
                                name={item.name} 
                                image={item.image} 
                                price={item.price} 
                                category={item.category[0]}
                            />
                        </div>
                    ))
                }
            </div>

            {/* --- Bottom Accent --- */}
            <div className="mt-32 flex justify-center">
                <div className="flex items-center gap-6 opacity-40">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B8860B]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B8860B]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B8860B]"></div>
                </div>
            </div>
        </div>
    )
}

export default BestSeller;