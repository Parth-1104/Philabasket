import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';

const Cart = () => {

  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      // UPDATED: Simplified loop for flat cartItems object {itemId: quantity}
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
    <div className='border-t pt-14'>

      <div className=' text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'COLLECTION'} />
      </div>

      <div>
        {
          cartData.map((item, index) => {

            const productData = products.find((product) => product._id === item._id);

            // Safety check if product exists
            if (!productData) return null;

            return (
              <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                <div className=' flex items-start gap-6'>
                  <img className='w-16 sm:w-20 border' src={productData.image[0]} alt="" />
                  <div>
                    <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
                    <div className='flex items-center gap-3 mt-2'>
                      <p className='text-orange-600 font-semibold'>{currency}{productData.price}</p>
                      {/* UPDATED: Show Country/Year instead of Size */}
                      <p className='px-2 py-0.5 text-[10px] sm:text-xs border bg-slate-50 rounded'>
                        {productData.country} | {productData.year}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* UPDATED: Removed size argument from updateQuantity */}
                <input 
                  onChange={(e) => e.target.value === '' || e.target.value === '0' ? null : updateQuantity(item._id, Number(e.target.value))} 
                  className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1' 
                  type="number" 
                  min={1} 
                  defaultValue={item.quantity} 
                />
                
                {/* UPDATED: Removed size argument from delete logic */}
                <img 
                  onClick={() => updateQuantity(item._id, 0)} 
                  className='w-4 mr-4 sm:w-5 cursor-pointer opacity-70 hover:opacity-100' 
                  src={assets.bin_icon} 
                  alt="Remove" 
                />
              </div>
            )
          })
        }
      </div>

      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          <CartTotal />
          <div className=' w-full text-end'>
            <button onClick={() => navigate('/place-order')} className='bg-black text-white text-sm my-8 px-8 py-3 uppercase tracking-widest hover:bg-gray-800 transition-all'>
              Proceed to Secure Checkout
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Cart