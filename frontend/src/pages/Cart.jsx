import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';

const Cart = () => {

  const { products, cartItems, updateQuantity, navigate, formatPrice } = useContext(ShopContext);
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
    <div className='bg-[#0a0a0a] min-h-screen pt-20 px-6 md:px-16 lg:px-24 text-white select-none animate-fade-in'>

      <div className='text-3xl mb-12 flex items-center gap-4'>
        <Title text1={'THE'} text2={'VAULT'} />
        <div className='h-[1px] flex-1 bg-gradient-to-r from-[#B8860B]/50 to-transparent hidden sm:block'></div>
      </div>

      <div className='space-y-4'>
        {
          cartData.map((item, index) => {
            const productData = products.find((product) => product._id === item._id);
            if (!productData) return null;

            return (
              <div key={index} className='py-6 border border-white/5 bg-[#111111] grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4 px-6 rounded-sm shadow-2xl transition-all duration-500 hover:border-[#B8860B]/30'>
                <div className='flex items-center gap-6'>
                  {/* Specimen Presentation */}
                  <div className='border border-[#B8860B]/20 p-2 bg-black shadow-[0_0_15px_rgba(184,134,11,0.1)]'>
                    <img className='w-16 sm:w-24 aspect-[3/4] object-contain brightness-90 group-hover:brightness-110 transition-all' src={productData.image[0]} alt={productData.name} />
                  </div>
                  
                  <div className='space-y-2'>
                    <p className='text-sm sm:text-xl font-serif text-white tracking-wide'>{productData.name}</p>
                    <div className='flex flex-wrap items-center gap-3 mt-2'>
                      <p className='text-[#B8860B] font-bold text-base sm:text-lg tracking-tighter'>
                        {formatPrice(productData.price)}
                      </p>
                      
                      <span className='px-3 py-1 text-[9px] tracking-[0.2em] border border-[#B8860B]/10 bg-[#B8860B]/5 rounded-sm text-[#B8860B] uppercase font-bold'>
                        {productData.country} • {productData.year}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className='flex justify-center'>
                  <div className='relative flex items-center'>
                    <input 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || val === '0') return;
                        updateQuantity(item._id, Number(val));
                      }} 
                      className='bg-[#0d0d0d] border border-white/10 text-[#B8860B] w-12 sm:w-20 px-2 py-2 text-center rounded-sm focus:border-[#B8860B]/50 outline-none transition-all font-mono text-sm' 
                      type="number" 
                      min={1} 
                      value={item.quantity} 
                    />
                    <p className='hidden sm:block absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] tracking-widest text-gray-600 uppercase font-bold'>Units</p>
                  </div>
                </div>
                
                <div className='flex justify-end'>
                  <button 
                    onClick={() => updateQuantity(item._id, 0)}
                    className='group p-2'
                  >
                    <img 
                      className='w-4 sm:w-5 brightness-0 invert opacity-40 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-300' 
                      src={assets.bin_icon} 
                      alt="Remove" 
                    />
                  </button>
                </div>
              </div>
            )
          })
        }
      </div>

      {/* Cart Summary Section */}
      <div className='flex justify-end mt-24 mb-20'>
        <div className='w-full sm:w-[450px] p-8 bg-[#111111] border border-[#B8860B]/10 rounded-sm shadow-2xl relative overflow-hidden'>
          {/* Subtle gold flare background */}
          <div className='absolute top-0 right-0 w-32 h-32 bg-[#B8860B]/5 blur-3xl pointer-events-none'></div>
          
          <CartTotal />
          
          <div className='w-full mt-10'>
            <button 
              onClick={() => navigate('/place-order')} 
              className='w-full bg-[#B8860B] text-black text-[11px] px-12 py-5 uppercase tracking-[0.4em] font-black hover:bg-white transition-all duration-500 rounded-sm shadow-[0_0_30px_rgba(184,134,11,0.2)] active:scale-95'
            >
              Secure Acquisition
            </button>
            <p className='text-center mt-6 text-[9px] text-gray-600 tracking-[0.2em] uppercase font-light'>
              Fully Insured Worldwide Transit Guaranteed
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