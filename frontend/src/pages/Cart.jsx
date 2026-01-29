import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';

const Cart = () => {

  const { products, cartItems, updateQuantity, navigate, formatPrice, toggleWishlist } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const itemId in cartItems) {
        if (cartItems[itemId] > 0) {
          tempData.push({
            _id: itemId,
            quantity: cartItems[itemId]
          })
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products])

  return (
    <div className='bg-[#FCF9F4] min-h-screen pt-24 pb-20 px-6 md:px-16 lg:px-24 text-black select-none animate-fade-in'>

      <div className='text-3xl mb-12 flex items-center gap-4'>
        <Title text1={'THE'} text2={'VAULT'} />
        <div className='h-[1px] flex-1 bg-gradient-to-r from-[#BC002D]/20 to-transparent hidden sm:block'></div>
      </div>

      <div className='max-w-5xl mx-auto space-y-4'>
        {
          cartData.map((item, index) => {
            const productData = products.find((product) => product._id === item._id);
            if (!productData) return null;

            return (
              <div key={index} className='py-6 border border-black/5 bg-white grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_1.5fr_1fr] items-center gap-4 px-6 rounded-sm shadow-sm transition-all duration-500 hover:border-[#BC002D]/30 group'>
                <div className='flex items-center gap-6'>
                  <div className='border border-black/5 p-2 bg-[#F9F9F9] shadow-sm group-hover:shadow-md transition-all'>
                    <img className='w-16 sm:w-24 aspect-[3/4] object-contain select-none' src={productData.image[0]} alt={productData.name} />
                  </div>
                  
                  <div className='space-y-2'>
                    <p className='text-sm sm:text-xl font-serif text-black tracking-tight leading-tight'>{productData.name}</p>
                    <div className='flex flex-wrap items-center gap-3 mt-2'>
                      <p className='text-[#BC002D] font-black text-base sm:text-lg tracking-tighter'>
                        {formatPrice(productData.price)}
                      </p>
                      
                      <span className='px-3 py-1 text-[9px] tracking-[0.3em] border border-[#BC002D]/10 bg-[#BC002D]/5 rounded-sm text-[#BC002D] uppercase font-black'>
                        {productData.country} • {productData.year}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* --- CUSTOM UNIT CONTROLS --- */}
                <div className='flex justify-center'>
                  <div className='flex flex-col items-center gap-2'>
                    <p className='text-[8px] tracking-[0.2em] text-gray-400 uppercase font-black'>Units</p>
                    
                    <div className='flex items-center border border-black/10 rounded-sm overflow-hidden bg-white shadow-sm'>
                        <button 
                          onClick={() => item.quantity > 1 && updateQuantity(item._id, item.quantity - 1)}
                          className='px-3 py-1 hover:bg-[#BC002D] hover:text-white transition-colors font-bold border-r border-black/10'
                        >
                          −
                        </button>
                        
                        <input 
                          readOnly
                          className='bg-white text-black w-10 sm:w-12 py-2 text-center outline-none font-mono text-sm' 
                          type="number" 
                          value={item.quantity} 
                        />

                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className='px-3 py-1 hover:bg-[#BC002D] hover:text-white transition-colors font-bold border-l border-black/10'
                        >
                          +
                        </button>
                    </div>
                  </div>
                </div>
                
                {/* --- ACTION BUTTONS --- */}
                <div className='flex items-center justify-end gap-6'>
                  <button 
                    onClick={() => {
                      toggleWishlist(item._id);
                      updateQuantity(item._id, 0);
                    }}
                    className='group/wish flex flex-col items-center gap-1 transition-all'
                    title="Move to Wishlist"
                  >
                    <img className='w-4 sm:w-5 opacity-20 group-hover/wish:opacity-100 group-hover/wish:scale-110 transition-all duration-300 brightness-0' src={assets.star_icon} alt="Wishlist" />
                    <span className='hidden lg:block text-[8px] font-black uppercase text-gray-300 group-hover/wish:text-[#BC002D] tracking-widest'>Move to Wishlist</span>
                  </button>

                  <button 
                    onClick={() => updateQuantity(item._id, 0)}
                    className='group/bin flex flex-col items-center gap-1 transition-all'
                    title="Remove Specimen"
                  >
                    <img className='w-4 sm:w-5 opacity-20 group-hover/bin:opacity-100 group-hover/bin:rotate-12 transition-all duration-300 brightness-0' src={assets.bin_icon} alt="Remove" />
                    <span className='hidden lg:block text-[8px] font-black uppercase text-gray-300 group-hover/bin:text-[#BC002D] tracking-widest'>Purge</span>
                  </button>
                </div>
              </div>
            )
          })
        }
      </div>

      <div className='flex justify-end mt-24 mb-20 max-w-5xl mx-auto'>
        <div className='w-full sm:w-[450px] p-10 bg-white border border-black/5 rounded-sm shadow-xl relative overflow-hidden'>
          <CartTotal />
          
          <div className='w-full mt-10'>
            <button 
              onClick={() => navigate('/place-order')} 
              className='w-full bg-black text-white text-[10px] px-12 py-5 uppercase tracking-[0.5em] font-black hover:bg-[#BC002D] transition-all duration-500 rounded-sm shadow-lg active:scale-95'
            >
              Secure Acquisition
            </button>
            <p className='text-center mt-8 text-[9px] text-gray-400 tracking-[0.3em] uppercase font-bold'>
              Insured Worldwide Transit Guaranteed
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}} />
    </div>
  )
}

export default Cart