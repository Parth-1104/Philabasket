import React, { useContext, useEffect, useState, useMemo } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

    const [method, setMethod] = useState('cod');
    const { 
        navigate, backendUrl, token, cartItems, setCartItems, 
        getCartAmount, delivery_fee, products, currency, 
        userData, fetchUserData, formatPrice 
    } = useContext(ShopContext);
    
    const [userPoints, setUserPoints] = useState(0); 
    const [usePoints, setUsePoints] = useState(false); 
    const [isVerifying, setIsVerifying] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false); 
    
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', street: '',
        city: '', state: '', zipcode: '', country: 'India', phone: ''
    })

    const handlePincodeChange = async (e) => {
        const pin = e.target.value;
        setFormData(prev => ({ ...prev, zipcode: pin }));
        if (pin.length === 6) {
            setIsVerifying(true);
            try {
                const response = await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
                if (response.data[0].Status === "Success") {
                    const data = response.data[0].PostOffice[0];
                    setFormData(prev => ({ ...prev, city: data.District, state: data.State }));
                    toast.success(`Registry verified: ${data.District}`);
                } else {
                    toast.error("Invalid Registry Pincode.");
                }
            } catch (error) { console.error(error); } finally { setIsVerifying(false); }
        }
    };

    useEffect(() => {
        if (!token) navigate('/login');
        else if (userData) setUserPoints(userData.totalRewardPoints || 0);
        else fetchUserData();
    }, [token, userData]);

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setFormData(data => ({ ...data, [name]: value }))
    }

    // --- CURRENCY SYNCED CALCULATIONS ---
    const { displayDiscount, displayFinal, pointsToDeduct, rawFinalAmount } = useMemo(() => {
        const cartAmount = getCartAmount();
        const totalOrderCost = cartAmount + delivery_fee;
        
        // Reward Points Logic (10 pts = 1 INR)
        const maxPotentialDiscount = usePoints ? Math.floor(userPoints / 10) : 0;
        const actualDiscount = Math.min(maxPotentialDiscount, totalOrderCost);
        const payableINR = totalOrderCost - actualDiscount;

        return { 
            displayDiscount: formatPrice(actualDiscount),
            displayFinal: formatPrice(payableINR),
            pointsToDeduct: actualDiscount * 10,
            rawFinalAmount: payableINR
        };
    }, [cartItems, userPoints, usePoints, delivery_fee, getCartAmount, currency, formatPrice]);

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        if (!formData.city) return toast.error("Please verify Pincode first.");

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
                amount: rawFinalAmount, // Send raw INR to backend
                currency: currency,
                usePoints: usePoints,
                pointsUsed: Math.round(pointsToDeduct)
            }

            const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } })

            if (response.data.success) {
                setCartItems({});
                setShowSuccess(true);
                setTimeout(() => { navigate('/orders'); }, 4000);
            } else {
                toast.error(response.data.message)
            }
        } catch (error) { toast.error("Registry connection failed."); }
    }

    const currencySymbol = currency === 'USD' ? '$' : '₹';

    return (
        <div className='relative'>
            {/* --- LUXURY SUCCESS OVERLAY --- */}
            {showSuccess && (
                <div className='fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center animate-fade-in'>
                    <div className='relative'>
                        <div className='absolute inset-0 bg-[#BC002D] blur-[120px] opacity-10 animate-pulse'></div>
                        <div className='relative z-10 flex flex-col items-center text-center px-6'>
                            <div className='w-24 h-24 mb-8 border-2 border-[#BC002D] flex items-center justify-center rounded-full animate-bounce shadow-xl shadow-[#BC002D]/10'>
                                <img src={assets.logo} className='w-12 brightness-0' alt="Success" />
                            </div>
                            <h2 className='text-[10px] tracking-[0.6em] uppercase text-[#BC002D] font-black mb-4'>Acquisition Confirmed</h2>
                            <h1 className='text-4xl md:text-6xl font-serif text-black mb-6 italic'>Congratulations, Collector</h1>
                            <div className='h-[1px] w-24 bg-[#BC002D] mb-8'></div>
                            <p className='text-gray-400 text-xs tracking-widest uppercase max-w-xs leading-relaxed'>
                                Your historical specimens have been registered in the permanent archive. Prepare for white-glove transit.
                            </p>
                            <p className='mt-12 text-[8px] text-[#BC002D]/50 tracking-[0.4em] uppercase animate-pulse'>
                                Redirecting to Consignment Ledger...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={onSubmitHandler} className={`bg-[#FCF9F4] min-h-screen text-black flex flex-col lg:flex-row justify-between gap-12 pt-24 pb-20 px-6 md:px-16 lg:px-24 select-none transition-all duration-1000 ${showSuccess ? 'blur-2xl opacity-0 scale-95' : 'opacity-100'}`}>
                
                {/* --- Left Side: Delivery Information --- */}
                <div className='flex flex-col gap-6 w-full lg:max-w-[550px]'>
                    <div className='mb-8'>
                        <Title text1={'SHIPPING'} text2={'REGISTRY'} />
                        <p className='text-[10px] text-gray-400 tracking-[0.3em] uppercase mt-2 font-black'>Verified Transit Protocol</p>
                    </div>
                    
                    <div className='flex gap-4'>
                        <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='bg-white border border-black/5 rounded-sm py-4 px-5 w-full text-sm outline-none focus:border-[#BC002D]/30 transition-all shadow-sm' type="text" placeholder='First name' />
                        <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='bg-white border border-black/5 rounded-sm py-4 px-5 w-full text-sm outline-none focus:border-[#BC002D]/30 transition-all shadow-sm' type="text" placeholder='Last name' />
                    </div>
                    <input required onChange={onChangeHandler} name='email' value={formData.email} className='bg-white border border-black/5 rounded-sm py-4 px-5 w-full text-sm outline-none focus:border-[#BC002D]/30 transition-all shadow-sm' type="email" placeholder='Registry Email' />
                    <input required onChange={onChangeHandler} name='street' value={formData.street} className='bg-white border border-black/5 rounded-sm py-4 px-5 w-full text-sm outline-none focus:border-[#BC002D]/30 transition-all shadow-sm' type="text" placeholder='Street and House No.' />
                    
                    <div className='flex gap-4 relative'>
                        <input required onChange={handlePincodeChange} name='zipcode' value={formData.zipcode} className='bg-white border border-[#BC002D]/20 rounded-sm py-4 px-5 w-full text-sm outline-none focus:border-[#BC002D] transition-all font-mono shadow-sm' type="number" placeholder='Pincode (Verification Required)' />
                        {isVerifying && <div className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#BC002D] border-t-transparent rounded-full animate-spin'></div>}
                    </div>

                    <div className='flex gap-4'>
                        <input readOnly value={formData.city} className='bg-[#F9F9F9] border border-black/5 rounded-sm py-4 px-5 w-full text-sm text-gray-400 outline-none' type="text" placeholder='City' />
                        <input readOnly value={formData.state} className='bg-[#F9F9F9] border border-black/5 rounded-sm py-4 px-5 w-full text-sm text-gray-400 outline-none' type="text" placeholder='State' />
                    </div>
                    
                    <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='bg-white border border-black/5 rounded-sm py-4 px-5 w-full text-sm outline-none focus:border-[#BC002D]/30 transition-all shadow-sm' type="number" placeholder='Contact Number' />
                </div>

                {/* --- Right Side: Summary & Points --- */}
                <div className='lg:w-[450px]'>
                    <div className='bg-white border border-black/5 p-8 rounded-sm shadow-xl'>
                        <CartTotal />
                        
                        <div className='mt-8 p-5 border border-[#BC002D]/20 bg-[#BC002D]/5 rounded-sm'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-3'>
                                    <input type="checkbox" id="pts" checked={usePoints} onChange={() => setUsePoints(!usePoints)} className='w-4 h-4 accent-[#BC002D]' disabled={userPoints < 10} />
                                    <div className='flex flex-col'>
                                        <label htmlFor="pts" className='text-[10px] tracking-[0.2em] font-black text-[#BC002D] uppercase cursor-pointer'>Apply Archive Credit</label>
                                        <p className='text-[9px] text-gray-400 uppercase tracking-widest mt-1'>Vault Balance: {userPoints} pts</p>
                                    </div>
                                </div>
                                <p className='text-sm font-black text-[#BC002D]'>
                                    -{currencySymbol}{displayDiscount}
                                </p>
                            </div>
                        </div>

                        <div className='flex justify-between mt-8 pt-4 border-t border-black/5'>
                            <p className='text-[10px] tracking-[0.3em] uppercase text-gray-400 font-bold'>Final Asset Valuation:</p>
                            <p className={`text-xl font-serif text-[#BC002D] font-black`}>
                                {rawFinalAmount <= 0 ? "COMPLIMENTARY" : `${currencySymbol} ${displayFinal}`}
                            </p>
                        </div>
                    </div>

                    <div className='mt-12'>
                        <Title text1={'PAYMENT'} text2={'PROTOCOL'} />
                        <div className='flex gap-4 flex-col mt-6'>
                            {['stripe', 'razorpay', 'cod'].map((m) => (
                                <div key={m} onClick={() => setMethod(m)} className={`flex items-center gap-4 border p-5 cursor-pointer transition-all rounded-sm ${method === m ? 'border-[#BC002D] bg-[#BC002D]/5' : 'border-black/5 bg-white'}`}>
                                    <div className={`w-3 h-3 border rounded-full ${method === m ? 'bg-[#BC002D] border-[#BC002D]' : 'border-black/10'}`}></div>
                                    <p className='text-black/60 text-[10px] tracking-[0.3em] uppercase font-black'>{m === 'cod' ? 'Cash on Delivery' : m.toUpperCase()}</p>
                                </div>
                            ))}
                        </div>
                        <button type='submit' className='w-full bg-black text-white py-5 text-[11px] font-black tracking-[0.5em] uppercase mt-12 hover:bg-[#BC002D] transition-all shadow-xl shadow-black/10 active:scale-95'>
                            Complete Acquisition
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default PlaceOrder;