import React, { useContext, useEffect, useState, useMemo } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

    const [method, setMethod] = useState('cod');
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products, currency } = useContext(ShopContext);
    
    const [userPoints, setUserPoints] = useState(0); 
    const [usePoints, setUsePoints] = useState(false); 
    
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', street: '',
        city: '', state: '', zipcode: '', country: '', phone: ''
    })

    const fetchUserPoints = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/user/profile', { headers: { token } });
            if (response.data.success) {
                setUserPoints(response.data.user.totalRewardPoints || 0);
            }
        } catch (error) {
            console.error("Error fetching points:", error);
        }
    }

    useEffect(() => {
        if (!token) {
            toast.info("Your items are saved. Please login to complete your order.");
            navigate('/login');
        } else {
            fetchUserPoints();
        }
    }, [token]);

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setFormData(data => ({ ...data, [name]: value }))
    }

    // --- FIX: Optimized Dynamic Point Calculation using useMemo ---
    // This ensures calculations are always synced with the latest cart total and points
    const { discountAmount, finalAmount, pointsToDeduct } = useMemo(() => {
        const cartAmount = getCartAmount();
        const totalOrderCost = cartAmount + delivery_fee;
        
        // Calculate max discount available (₹1 for every 10 points)
        const maxPotentialDiscount = usePoints ? Math.floor(userPoints / 10) : 0;
        
        // Cap the discount: It cannot exceed the total order cost
        const actualDiscount = Math.min(maxPotentialDiscount, totalOrderCost);
        const payable = totalOrderCost - actualDiscount;

        return {
            discountAmount: actualDiscount,
            finalAmount: payable,
            pointsToDeduct: actualDiscount * 10 // Only deduct points used to reach ₹0
        };
    }, [cartItems, userPoints, usePoints, delivery_fee, getCartAmount]);

    // --- Razorpay Initialization (Commented) ---
    /*
    const initPay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
            amount: order.amount,
            currency: order.currency,
            name: 'Stamp Collection Order',
            description: 'Payment for Philatelic Items',
            order_id: order.id,
            handler: async (response) => {
                try {
                    const { data } = await axios.post(backendUrl + '/api/order/verifyRazorpay', response, { headers: { token } })
                    if (data.success) {
                        setCartItems({})
                        navigate('/orders')
                    }
                } catch (error) {
                    toast.error(error.message)
                }
            }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
    }
    */

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        
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
                amount: finalAmount, 
                currency: currency,
                usePoints: usePoints,
                pointsUsed: Math.round(pointsToDeduct) // Sending accurate points used to backend
            }

            if (method === 'cod') {
                const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } })
                if (response.data.success) {
                    setCartItems({})
                    navigate('/orders')
                } else {
                    toast.error(response.data.message)
                }
            } else if (method === 'stripe') {
                const responseStripe = await axios.post(backendUrl + '/api/order/stripe', orderData, { headers: { token } })
                if (responseStripe.data.success) {
                    const { session_url } = responseStripe.data
                    window.location.replace(session_url)
                } else {
                    toast.error(responseStripe.data.message)
                }
            } else if (method === 'razorpay') {
                const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData, { headers: { token } })
                if (responseRazorpay.data.success) {
                    // initPay(responseRazorpay.data.order) 
                    toast.info("Razorpay logic triggered. Connect API key to open popup.")
                }
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    if (!token) return null;

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t px-3'>
            
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
                <div className='text-xl sm:text-2xl my-3 flex justify-between items-center'>
                    <Title text1={'SHIPPING'} text2={'DETAILS'} />
                    <button type='button' onClick={() => navigate('/cart')} className='text-xs text-blue-600 hover:underline'>
                        Review Collection
                    </button>
                </div>
                
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
                <div className='min-w-80'>
                    <CartTotal />
                    
                    <div className='mt-6 p-4 border border-orange-200 bg-orange-50 rounded-sm'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <input 
                                    type="checkbox" 
                                    id="points" 
                                    checked={usePoints} 
                                    onChange={() => setUsePoints(!usePoints)}
                                    className='w-4 h-4 accent-orange-600'
                                    disabled={userPoints < 10}
                                />
                                <label htmlFor="points" className='text-sm font-medium text-gray-700 cursor-pointer'>
                                    Use Reward Points ({userPoints} pts)
                                </label>
                            </div>
                            <p className='text-sm font-bold text-orange-600'>-₹{discountAmount}</p>
                        </div>
                    </div>

                    <div className='flex justify-between mt-4 py-2 border-t border-b'>
                        <p className='font-bold'>Final Payable:</p>
                        <p className={`font-bold text-lg ${finalAmount <= 0 ? 'text-green-700' : ''}`}>
                            {finalAmount <= 0 ? "FREE" : `${currency} ${finalAmount.toFixed(2)}`}
                        </p>
                    </div>
                </div>

                <div className='mt-12'>
                    <Title text1={'PAYMENT'} text2={'METHOD'} />
                    <div className='flex gap-3 flex-col lg:flex-row'>
                        <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.stripe_logo} alt="Stripe" />
                        </div>
                        <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.razorpay_logo} alt="Razorpay" />
                        </div>
                        <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                            <p className='text-gray-500 text-sm font-medium mx-4 uppercase'>Cash on delivery</p>
                        </div>
                    </div>
                    <div className='w-full text-end mt-8'>
                        <button type='submit' className='bg-black text-white px-16 py-3 text-sm hover:bg-gray-800 transition-all uppercase tracking-widest font-bold'>
                            Place Order
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default PlaceOrder;