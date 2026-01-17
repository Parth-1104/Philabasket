import React, { useContext, useEffect, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

    const [method, setMethod] = useState('cod');
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
    
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', street: '',
        city: '', state: '', zipcode: '', country: '', phone: ''
    })

    // --- Auth Guard (Modified to keep cart safe) ---
    useEffect(() => {
        if (!token) {
            // We do NOT clear cartItems here. 
            // We just notify and move the user to login.
            toast.info("Your items are saved. Please login to complete your order.");
            navigate('/login');
        }
    }, [token]); // removed navigate from dependency to prevent unnecessary triggers

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setFormData(data => ({ ...data, [name]: value }))
    }

    // --- Order Logic ---
    const onSubmitHandler = async (event) => {
        event.preventDefault()
        
        // Prevent submission if not logged in (double safety)
        if (!token) {
            toast.error("Authentication required");
            return navigate('/login');
        }

        try {
            let orderItems = []
            for (const itemId in cartItems) {
                if (cartItems[itemId] > 0) {
                    const itemInfo = structuredClone(products.find(product => product._id === itemId))
                    if (itemInfo) {
                        itemInfo.quantity = cartItems[itemId]
                        orderItems.push(itemInfo)
                    }
                }
            }

            let orderData = {
                address: formData,
                items: orderItems,
                amount: getCartAmount() + delivery_fee
            }

            // Logic for COD/Stripe/Razorpay stays same as your provided code
            // Only setCartItems({}) happens AFTER a successful database response
            if (method === 'cod') {
                const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } })
                if (response.data.success) {
                    setCartItems({}) // Only clear now
                    navigate('/orders')
                } else {
                    toast.error(response.data.message)
                }
            }
            // ... (rest of your payment switch logic)

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // If no token, return null to avoid layout shift before redirect
    if (!token) return null;

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
            
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
                <div className='text-xl sm:text-2xl my-3 flex justify-between items-center'>
                    <Title text1={'SHIPPING'} text2={'DETAILS'} />
                    <button 
                        type='button' 
                        onClick={() => navigate('/cart')} 
                        className='text-xs text-blue-600 hover:underline'
                    >
                        Review Collection
                    </button>
                </div>
                
                {/* Form Inputs (same as before) */}
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='First name' />
                    <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Last name' />
                </div>
                <input required onChange={onChangeHandler} name='email' value={formData.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email address' />
                <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Street' />
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='city' value={formData.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='City' />
                    <input onChange={onChangeHandler} name='state' value={formData.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='State' />
                </div>
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Zipcode' />
                    <input required onChange={onChangeHandler} name='country' value={formData.country} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Country' />
                </div>
                <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Phone' />
            </div>

            <div className='mt-8'>
                <div className='mt-8 min-w-80'>
                    <CartTotal />
                </div>
                <div className='mt-12'>
                    <Title text1={'PAYMENT'} text2={'METHOD'} />
                    <div className='flex gap-3 flex-col lg:flex-row'>
                        <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.stripe_logo} alt="Stripe" />
                        </div>
                        <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                            <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                        </div>
                    </div>
                    <div className='w-full text-end mt-8'>
                        <button type='submit' className='bg-black text-white px-16 py-3 text-sm hover:bg-gray-800 transition-all'>PLACE ORDER</button>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default PlaceOrder