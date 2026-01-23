import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';

const Cart = () => {

  // 1. Destructure formatPrice from ShopContext
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
    <div className='border-t pt-14 mr-5 px-5 ml-5 sm:px-0 '>

      <div className=' text-2xl mb-6'>
        <Title text1={'YOUR'} text2={'COLLECTION'} />
      </div>

      <div>
        {
          cartData.map((item, index) => {

            const productData = products.find((product) => product._id === item._id);

            if (!productData) return null;

            return (
              <div key={index} className='py-6 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4 bg-white px-2 mb-1'>
                <div className=' flex items-start gap-6'>
                  {/* Stamp visual styling */}
                  <div className='border p-1 bg-white shadow-sm'>
                    <img className='w-16 sm:w-24 aspect-[3/4] object-contain' src={productData.image[0]} alt={productData.name} />
                  </div>
                  
                  <div>
                    <p className='text-sm sm:text-xl font-bold text-gray-900'>{productData.name}</p>
                    <div className='flex items-center gap-3 mt-2'>
                      {/* 2. FIXED: Using formatPrice for mathematical conversion */}
                      <p className='text-[#E63946] font-bold text-base sm:text-lg'>
                        {formatPrice(productData.price)}
                      </p>
                      
                      <p className='px-2 py-0.5 text-[10px] sm:text-xs border border-gray-300 bg-gray-50 rounded text-gray-500'>
                        {productData.country} | {productData.year}
                      </p>
                    </div>
                  </div>
                </div>
                
                <input 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || val === '0') return;
                    updateQuantity(item._id, Number(val));
                  }} 
                  className='border border-gray-300 max-w-10 sm:max-w-20 px-1 sm:px-3 py-1 text-center rounded' 
                  type="number" 
                  min={1} 
                  value={item.quantity} 
                />
                
                <img 
                  onClick={() => updateQuantity(item._id, 0)} 
                  className='w-4 mr-4 sm:w-5 cursor-pointer opacity-50 hover:opacity-100 hover:scale-110 transition-all' 
                  src={assets.bin_icon} 
                  alt="Remove" 
                />
              </div>
            )
          })
        }
      </div>

      {/* Cart Summary Section */}
      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          <CartTotal />
          <div className=' w-full text-end'>
            <button 
              onClick={() => navigate('/place-order')} 
              className='bg-black text-white text-sm my-8 px-12 py-4 uppercase tracking-[0.2em] font-semibold hover:bg-[#E63946] transition-colors duration-300 shadow-lg'
            >
              Proceed to Secure Checkout
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Cart