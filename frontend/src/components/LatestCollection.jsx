import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from './ProductItem';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShoppingCart, Zap } from 'lucide-react';

const LatestCollection = () => {
    // Destructured everything needed from context
    const { products, backendUrl, addToCart } = useContext(ShopContext);
    const [latestProducts, setLatestProducts] = useState([]);
    const [ALL_CATEGORIES, setCategoryOptions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setLatestProducts(products.slice(0, 9)); 
    }, [products]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/category/list');
            if (response.data.success) {
                const names = response.data.categories.map(cat => cat.name);
                setCategoryOptions(names);
            }
        } catch (error) {
            console.error("Category Fetch Error:", error);
        }
    };

    useEffect(() => {
        if(backendUrl) fetchCategories();
    }, [backendUrl]);

    const handleProductClick = (productId) => {
        navigate('/collection', { state: { priorityId: productId } });
        window.scrollTo(0, 0);
    };

    const onAddToCart = (e, productId) => {
        e.stopPropagation(); 
        addToCart(productId, 1);
        toast.success("Added to Registry", { position: "bottom-right", autoClose: 1000 });
    };

    const onBuyNow = async (e, productId) => {
        e.stopPropagation();
        await addToCart(productId, 1);
        navigate('/cart');
        window.scrollTo(0, 0);
    };

    return (
        <div className='bg-white py-12 md:py-32 overflow-hidden select-none relative'>
            <div className="absolute -left-[10vw] top-[10%] h-[80%] w-[35%] bg-[#bd002d]/5 rounded-r-[600px] pointer-events-none"></div>

            <div className='px-6 md:px-16 lg:px-24 relative z-10'>
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
                    
                    {/* --- CATEGORY SIDEBAR RESTORED --- */}
                    <div className='w-full lg:w-1/4'>
                        <div className='lg:sticky lg:top-32'>
                            <div className='bg-[#bd002d] p-6 lg:p-8 rounded-[30px] lg:rounded-[40px] shadow-2xl shadow-[#bd002d]/20 relative overflow-hidden'>
                                <div className='flex items-center justify-between mb-4 lg:mb-6 relative z-10'>
                                    <h3 className='text-white font-black text-[9px] lg:text-xs tracking-[0.3em] uppercase'>Categories</h3>
                                    <Link to='/collection' className='text-amber-400 text-[8px] lg:hidden font-black uppercase'>View All</Link>
                                </div>

                                <div className='flex flex-row lg:flex-col gap-3 lg:gap-4 overflow-x-auto lg:overflow-visible hide-scrollbar relative z-10 pb-2 lg:pb-0'>
                                    {ALL_CATEGORIES.slice(0, 15).map((cat) => (
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
                                    
                                    <Link to='/collection' onClick={() => window.scrollTo(0, 0)} className='hidden lg:flex mt-6 py-4 border-t border-white/10 items-center justify-between group/more'>
                                        <span className='text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]'>Full Index</span>
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

                    {/* --- MAIN PRODUCT GRID --- */}
                    <div className='w-full lg:w-3/4'>
                        <div className='flex overflow-x-auto lg:grid lg:grid-cols-3 gap-6 md:gap-x-8 gap-y-12 pb-10 lg:pb-0 snap-x snap-mandatory mobile-scrollbar px-2'>
                            {latestProducts.map((item, index) => (
                                <div 
                                    key={index} 
                                    className="min-w-[85%] sm:min-w-[45vw] lg:min-w-0 snap-center flex flex-col group bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-br-[40px] md:rounded-br-[60px] overflow-hidden"
                                >
                                    <div className="relative p-1 md:p-3 flex-grow cursor-pointer" onClick={() => handleProductClick(item._id)}>
                                        <div className="absolute top-0 right-0 z-20 overflow-hidden w-20 h-20 pointer-events-none">
                                            <div className="absolute top-[20%] -right-[30%] bg-[#bd002d] text-white text-[7px] font-black py-1 w-[140%] text-center transform rotate-45 shadow-sm uppercase tracking-tighter">
                                                New
                                            </div>
                                        </div>
                                        
                                        <div className="w-full bg-[#f8f8f8] rounded-br-[35px] md:rounded-br-[45px] p-2">
                                            <ProductItem 
                                                id={item._id} 
                                                _id={item._id}
                                                image={item.image} 
                                                name={item.name} 
                                                price={item.price} 
                                                marketPrice={item.marketPrice}
                                                category={item.category[0]}
                                                linkToFilter={true} 
                                            />
                                        </div>
                                    </div>

                                    {/* FIXED BUTTON SECTION */}
                                    <div className="flex flex-col gap-2 p-4 pt-0">
                                        <div className="grid grid-cols-2 gap-2">
                                            <button 
                                                onClick={(e) => onAddToCart(e, item._id)}
                                                className="bg-gray-100 text-gray-900 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all duration-300"
                                            >
                                                <ShoppingCart size={14} />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Add</span>
                                            </button>
                                            
                                            <button 
                                                onClick={(e) => onBuyNow(e, item._id)}
                                                className="bg-black text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#bd002d] transition-all duration-300 shadow-lg shadow-black/10"
                                            >
                                                <Zap size={14} className="fill-amber-400 text-amber-400" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Buy Now</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* STYLES SECTION */}
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