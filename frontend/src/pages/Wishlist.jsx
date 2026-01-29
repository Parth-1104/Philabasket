import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { assets } from '../assets/assets';

const Wishlist = () => {
    const { products, wishlist, toggleWishlist } = useContext(ShopContext);
    
    // Filter products to show only saved specimens
    const wishlistProducts = products.filter(item => wishlist.includes(item._id));

    return (
        <div className='pt-24 px-6 md:px-16 lg:px-24 min-h-screen bg-[#FCF9F4] select-none animate-fade-in'>
            
            <div className='text-2xl mb-10'>
                <Title text1={'PRIVATE'} text2={'ARCHIVE'} />
                <p className='text-[10px] tracking-[0.5em] text-gray-400 uppercase mt-2'>Curated specimens for future acquisition</p>
            </div>

            {/* --- WISHLIST GRID --- */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 mt-10'>
                {wishlistProducts.map((item, index) => (
                    <div key={index} className='relative group'>
                        
                        {/* --- REMOVE BUTTON (Top Right Overlap) --- */}
                        <button 
                            onClick={() => toggleWishlist(item._id)}
                            className='absolute -top-3 -right-3 z-30 w-8 h-8 bg-white border border-black/5 rounded-full flex items-center justify-center shadow-lg hover:bg-[#BC002D] transition-all duration-500 group/btn'
                            title="Remove from Archive"
                        >
                            <span className='text-lg font-light text-black group-hover/btn:text-white group-hover/btn:rotate-90 transition-all'>×</span>
                        </button>

                        {/* Standard Product Item Component */}
                        <ProductItem 
                            id={item._id} 
                            image={item.image} 
                            name={item.name} 
                            price={item.price} 
                        />

                        {/* Additional Action for Wishlist Items */}
                        <button 
                            onClick={() => toggleWishlist(item._id)}
                            className='w-full mt-4 py-2 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 border border-black/5 hover:text-[#BC002D] hover:border-[#BC002D]/20 transition-all'
                        >
                            Remove Specimen
                        </button>
                    </div>
                ))}
            </div>

            {/* --- EMPTY STATE --- */}
            {wishlistProducts.length === 0 && (
                <div className='flex flex-col items-center justify-center py-32 text-center'>
                    <img src={assets.parcel_icon} className='w-16 opacity-10 mb-6 grayscale' alt="" />
                    <p className='text-[11px] tracking-[0.6em] text-gray-400 uppercase font-black'>
                        Your private vault is currently empty
                    </p>
                    <button 
                        onClick={() => window.history.back()}
                        className='mt-8 text-[10px] text-[#BC002D] font-bold uppercase tracking-widest border-b border-[#BC002D]/20 pb-1 hover:border-[#BC002D] transition-all'
                    >
                        Return to Gallery
                    </button>
                </div>
            )}
        </div>
    );
};

export default Wishlist;