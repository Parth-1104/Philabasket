import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import ProductItem from './ProductItem';
import { Link, useNavigate } from 'react-router-dom';


const BestSeller = () => {

    const { products } = useContext(ShopContext);
    const [bestSeller, setBestSeller] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Sort by soldCount (highest first) and take top 5
        const sortedProducts = [...products]
            .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
            .slice(0, 5);
        
        setBestSeller(sortedProducts);
    }, [products]);

    return (
        <div className='bg-white  md:py-32 lg:mt-[-18vh] overflow-hidden select-none relative border-t border-black/[0.03]'>
            
            {/* <div className='mt-32 rounded-[100px] overflow-hidden bg-[#bd002d] py-24 px-10 relative flex flex-col items-center shadow-2xl'>
                    <span className="absolute inset-0 flex items-center justify-center text-white/5 text-[20vw] font-bold pointer-events-none select-none italic">ARCHIVES</span>
                    <div className="relative z-10 text-center">
                        <h3 className="text-white text-4xl md:text-6xl font-bold mb-8 tracking-tighter leading-none">
                            Secure Rare <br className='hidden md:block'/> <span className="italic text-amber-400">Acquisitions.</span>
                        </h3>
                        <Link to='/collection' onClick={() => window.scrollTo(0, 0)} className='inline-block px-12 py-5 bg-white text-gray-900 text-[10px] font-black uppercase tracking-[0.5em] rounded-full hover:bg-amber-400 transition-all duration-500 hover:scale-110 shadow-xl'>Enter the Collection</Link>
                    </div>
                </div> */}

            {/* --- Decorative Hero-Curve Accent --- */}
            <div className="absolute -right-[15vw] top-[20%] h-[70%] w-[45%] bg-[#bd002d]/5 rounded-l-[600px] pointer-events-none"></div>

            <div className='px-6 md:px-16 lg:px-24 relative z-10'>
                
                {/* --- Curatorial Header --- */}
                <div className='flex flex-col md:flex-row justify-between items-end mb-20 gap-8'>
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="h-[1px] w-12 bg-[#BC002D]"></span>
                            <span className="text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-black">
                                Acquisition Rank
                            </span>
                        </div>
                        <h2 className="text-6xl md:text-8xl font-bold text-gray-900 tracking-tighter leading-none">
                            TOP <br />
                            <span className="text-[#bd002d]">SELLING.</span>
                        </h2>
                    </div>
                    
                    <div className="hidden md:block text-right max-w-xs">
                        <p className='text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed'>
                            The top 5 specimens defining the <span className='text-black'>PhilaBasket Legacy</span>, ranked by historical acquisition volume.
                        </p>
                    </div>
                </div>

                {/* --- Ranked Grid --- */}
                <div className='flex overflow-x-auto pb-10 p-12 gap-8 snap-x snap-mandatory mobile-scrollbar lg:grid lg:grid-cols-5 lg:gap-x-10 lg:overflow-visible lg:pb-0'>
                    {
                        bestSeller.map((item, index) => (
                            <div 
                                key={index} 
                                className="min-w-[75vw] sm:min-w-[40vw] lg:min-w-0 snap-center group relative transition-all duration-700"
                            >
                                {/* Visual Rank Badge (Matches Hero Palette) */}
                                <div className="absolute -top-6 -left-2 z-20">
                                    <div className="bg-[#bd002d] text-white w-12 h-12 rounded-full flex flex-col items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                                        <span className="text-[7px] font-black leading-none opacity-60">RANK</span>
                                        <span className="text-lg font-black leading-none">0{index + 1}</span>
                                    </div>
                                </div>
                                
                                {/* Card: Styled as a physical Stamp Mount */}
                                <div className='pt-4'>
                                    <div className="relative aspect-[3/4] bg-white border border-gray-100 p-3 shadow-sm transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-2xl group-hover:border-[#bd002d]/20 overflow-hidden">
                                        
                                        {/* Status Detail */}
                                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse"></div>
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">High Demand</span>
                                        </div>

                                        <div className="w-full h-full bg-[#f8f8f8] flex items-center justify-center p-4">
                                            <ProductItem 
                                                id={item._id} 
                                                name={item.name} 
                                                image={item.image} 
                                                price={item.price} 
                                                category={item.category[0]}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Info Section */}
                                <div className="mt-6 space-y-1">
                                    <div className="flex justify-between items-center text-[9px] font-black tracking-widest uppercase text-[#bd002d]/60">
                                        <span>{item.country}</span>
                                        <span>{item.year}</span>
                                    </div>
                                    <h3 className="text-gray-900 font-bold text-sm truncate group-hover:text-[#bd002d] transition-colors">
                                        {item.name}
                                    </h3>
                                    <div className="h-[1px] w-0 group-hover:w-full bg-[#bd002d] transition-all duration-700"></div>
                                </div>
                            </div>
                        ))
                    }
                </div>

                    


                {/* --- Bottom Hallmark --- */}
                <div className="mt-20 md:mt-32 flex flex-col items-center gap-6">
                    <div className='h-16 w-[1px] bg-gradient-to-b from-[#bd002d] to-transparent'></div>
                    <p className='text-[8px] tracking-[0.8em] text-black/20 uppercase font-black'>
                        Verified Philatelic Provenance
                    </p>
                </div>
            </div>

            

            <style dangerouslySetInnerHTML={{ __html: `
    /* Hide default scrollbar for category list */
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    /* Custom thin red scrollbar for mobile product grid */
    @media (max-width: 1023px) {
        .mobile-scrollbar::-webkit-scrollbar {
            display: block;
            height: 3px; /* Very thin line */
        }
        .mobile-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            margin: 0 10vw; /* Inset the line from screen edges */
            border-radius: 10px;
        }
        .mobile-scrollbar::-webkit-scrollbar-thumb {
            background: #bd002d; /* PhilaBasket Red */
            border-radius: 10px;
        }
    }
    
    /* Keep desktop grid clean */
    @media (min-width: 1024px) {
        .mobile-scrollbar::-webkit-scrollbar { display: none; }
    }
`}} />
        </div>
    )
}

export default BestSeller;