import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';

const CartTotal = () => {

    // Destructure formatPrice to handle the USD/INR conversion logic
    const { currency, delivery_fee, getCartAmount, formatPrice } = useContext(ShopContext);

    const subtotal = getCartAmount();
    const currencySymbol = currency === 'USD' ? '$' : '₹';

    return (
        <div className='w-full'>
            <div className='text-2xl'>
                <Title text1={'TOTAL'} text2={'VALUATION'} />
            </div>

            <div className='flex flex-col gap-3 mt-4 text-sm'>
                {/* --- Subtotal Section --- */}
                <div className='flex justify-between'>
                    <p className='text-gray-400 font-black uppercase tracking-widest text-[9px]'> Subtotal</p>
                    <p className='font-black text-black'>
                        {currencySymbol} {formatPrice(subtotal)}
                    </p>
                </div>
                
                <hr className='border-black/5' />

                {/* --- Shipping Section --- */}
                <div className='flex justify-between'>
                    <p className='text-gray-400 font-black uppercase tracking-widest text-[9px]'>Delivery Fee</p>
                    <p className='font-black text-black'>
                        {currencySymbol} {formatPrice(delivery_fee)}
                    </p>
                </div>

                <hr className='border-black/5' />

                {/* --- Total Section --- */}
                <div className='flex justify-between mt-2'>
                    <p className='text-black font-black uppercase tracking-[0.2em] text-[10px]'>Total Acquisition</p>
                    <b className='font-black text-[#BC002D] text-lg tracking-tighter'>
                        {currencySymbol} {subtotal === 0 ? "0.00" : formatPrice(subtotal + delivery_fee)}
                    </b>
                </div>
            </div>
        </div>
    )
}

export default CartTotal