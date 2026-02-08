import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from './ProductItem';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShoppingCart, Zap } from 'lucide-react';

const LatestCollection = () => {
    // Destructured addToCart from context
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
            console.error(error);
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
        toast.success("Added to Registry");
        
    };

    const onBuyNow = async (e, productId) => {
        e.stopPropagation();
        await addToCart(productId, 1);
        navigate('/cart');
    window.scrollTo(0,0);

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
                    {/* CATEGORY NAV (Hidden for brevity, keep your original) */}
                    <div className='w-full lg:w-1/4'>
                        {/* ... Your original Category Sidebar ... */}
                    </div>

                    {/* MAIN PRODUCT GRID */}
                    <div className='w-full lg:w-3/4'>
                        <div className='flex overflow-x-auto lg:grid lg:grid-cols-3 gap-6 md:gap-x-8 gap-y-12 pb-10 lg:pb-0 snap-x snap-mandatory mobile-scrollbar px-2'>
                            {latestProducts.map((item, index) => (
                                <div 
                                    key={index} 
                                    className="min-w-[85%] sm:min-w-[45vw] lg:min-w-0 snap-center flex flex-col group bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-br-[40px] md:rounded-br-[60px] overflow-hidden"
                                >
                                    {/* Main Product Area (Image & Name) */}
                                    <div className="relative p-1 md:p-3 flex-grow cursor-pointer" onClick={() => handleProductClick(item._id)}>
                                        <div className="absolute top-0 right-0 z-20 overflow-hidden w-20 h-20 pointer-events-none">
                                            <div className="absolute top-[20%] -right-[30%] bg-[#bd002d] text-white text-[7px] font-black py-1 w-[140%] text-center transform rotate-45 shadow-sm uppercase tracking-tighter">
                                                New
                                            </div>
                                        </div>
                                        
                                        <div className="w-full bg-[#f8f8f8] rounded-br-[35px] md:rounded-br-[45px] p-2">
                                            <ProductItem 
                                                id={item._id} 
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
            {/* ... Your original Styles ... */}
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

//             <style dangerouslySetInnerHTML={{ __html: `
//                 .hide-scrollbar::-webkit-scrollbar { display: none; }
//                 .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

//                 @media (max-width: 1023px) {
//                     .mobile-scrollbar::-webkit-scrollbar {
//                         display: block;
//                         height: 3px;
//                     }
//                     .mobile-scrollbar::-webkit-scrollbar-track {
//                         background: #f1f1f1;
//                         margin: 0 10vw;
//                         border-radius: 10px;
//                     }
//                     .mobile-scrollbar::-webkit-scrollbar-thumb {
//                         background: #bd002d;
//                         border-radius: 10px;
//                     }
//                 }
                
//                 @media (min-width: 1024px) {
//                     .mobile-scrollbar::-webkit-scrollbar { display: none; }
//                 }
//             `}} />
//         </div>
//     );
// };

// export default LatestCollection;