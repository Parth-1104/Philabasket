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
        /* Main Container: Switched to Deep Black to blend with Hero */
        <div className='bg-[#0a0a0a] py-32 px-6 md:px-16 lg:px-24 transition-colors duration-700'>
            
            {/* --- Editorial Header Section --- */}
            <div className='flex flex-col md:flex-row justify-between items-end mb-24 gap-8 border-b border-[#B8860B]/20 pb-16'>
                <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="h-[1px] w-12 bg-[#B8860B]"></span>
                        <span className="text-xs tracking-[0.5em] text-[#B8860B] uppercase font-light">
                            The Curated Archive
                        </span>
                    </div>
                    <h2 className="text-5xl md:text-8xl font-serif text-white leading-[1.1] mb-6">
                        Latest <br />
                        <span className="italic font-light text-[#B8860B]/80 pl-12 md:pl-24">Collections</span>
                    </h2>
                </div>
                
                <div className="md:w-1/3 text-right">
                    <p className='text-sm md:text-base text-gray-400 font-light leading-relaxed mb-8 tracking-wide'>
                        A meticulously curated selection of the world's rarest philatelic specimens, 
                        each telling a story of a bygone era.
                    </p>
                    <button 
                        onClick={() => navigate('/collection')}
                        className="text-[10px] text-[#B8860B] font-bold tracking-[0.3em] uppercase border-b border-[#B8860B]/40 pb-2 hover:text-white hover:border-white transition-all duration-500"
                    >
                        Explore Full Collection
                    </button>
                </div>
            </div>

            {/* --- Asymmetric Editorial Grid --- */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24'>
                {latestProducts.map((item, index) => (
                    <div 
                        key={index} 
                        className={`transition-all duration-[1.5s] ease-out transform 
                            ${index % 2 !== 0 ? 'md:translate-y-20' : ''} 
                            hover:-translate-y-4`}
                    >
                        {/* Luxury Frame: Darker inner background to make stamp "glow" */}
                        <div className="relative group overflow-hidden bg-[#111111] aspect-[4/5] flex items-center justify-center p-8 mb-6 border border-white/5 hover:border-[#B8860B]/30 transition-colors duration-700 shadow-2xl">
                            <ProductItem 
                                id={item._id} 
                                image={item.image} 
                                name={item.name} 
                                price={item.price} 
                                category={item.category[0]}
                                linkToFilter={true}
                            />
                            
                            {/* Gold Corner Accents on Hover */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#B8860B] opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#B8860B] opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* --- Exclusive Vault Footer --- */}
            <div className='mt-48 text-center relative py-32 overflow-hidden rounded-[4rem] border border-[#B8860B]/10 shadow-[0_0_50px_rgba(184,134,11,0.05)]'>
                
                {/* Gold Radial Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(184,134,11,0.12)_0%,_transparent_70%)] pointer-events-none"></div>

                {/* Background decorative text with Gold Outline */}
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[14vw] font-serif pointer-events-none uppercase tracking-tighter whitespace-nowrap opacity-[0.03] text-transparent" 
                      style={{ WebkitTextStroke: '1px #B8860B' }}>
                    PhilaBasket
                </span>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#B8860B]"></div>
                        <p className="text-[#B8860B] text-[10px] tracking-[0.5em] uppercase font-medium">MMXXVI Archive</p>
                        <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#B8860B]"></div>
                    </div>

                    <h3 className="text-white text-3xl md:text-5xl font-serif mb-12 tracking-wide">
                        Enter The <span className="italic text-[#B8860B]">Private Vault</span>
                    </h3>

                    <Link 
                        to='/collection' 
                        onClick={() => window.scrollTo(0,0)}
                        className='group relative inline-block px-16 py-6 overflow-hidden border border-[#B8860B]/50 rounded-full transition-all duration-700 shadow-[0_0_20px_rgba(184,134,11,0.1)]'
                    >
                        <span className="absolute inset-0 w-0 bg-gradient-to-r from-[#B8860B] via-[#FFD700] to-[#B8860B] transition-all duration-700 ease-in-out group-hover:w-full"></span>
                        <span className="relative z-10 text-[#B8860B] group-hover:text-black text-[11px] tracking-[0.6em] font-bold uppercase transition-colors duration-500">
                            View All Specimens
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LatestCollection;