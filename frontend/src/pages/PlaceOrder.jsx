import React, { useContext, useEffect, useState, useMemo } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

    const [method, setMethod] = useState('cod');
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products, currency, userData, fetchUserData } = useContext(ShopContext);
    
    const [userPoints, setUserPoints] = useState(0); 
    const [usePoints, setUsePoints] = useState(false); 
    const [isVerifying, setIsVerifying] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false); // Success Popup State
    
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

    const { discountAmount, finalAmount, pointsToDeduct } = useMemo(() => {
        const cartAmount = getCartAmount();
        const totalOrderCost = cartAmount + delivery_fee;
        const maxPotentialDiscount = usePoints ? Math.floor(userPoints / 10) : 0;
        const actualDiscount = Math.min(maxPotentialDiscount, totalOrderCost);
        const payable = totalOrderCost - actualDiscount;
        return { discountAmount: actualDiscount, finalAmount: payable, pointsToDeduct: actualDiscount * 10 };
    }, [cartItems, userPoints, usePoints, delivery_fee, getCartAmount]);

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
                amount: finalAmount, 
                currency: currency,
                usePoints: usePoints,
                pointsUsed: Math.round(pointsToDeduct)
            }

            const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } })

            if (response.data.success) {
                setCartItems({});
                setShowSuccess(true); // Trigger the Luxury Illustration
                
                // Delay navigation to let user enjoy the success state
                setTimeout(() => {
                    navigate('/orders');
                }, 4000);
            } else {
                toast.error(response.data.message)
            }
        } catch (error) { toast.error("Registry connection failed."); }
    }

    return (
        <div className='relative'>
            {/* --- LUXURY SUCCESS OVERLAY --- */}
            {showSuccess && (
                <div className='fixed inset-0 z-[200] bg-[#0a0a0a] flex flex-col items-center justify-center animate-fade-in'>
                    <div className='relative'>
                        {/* Gold dust/Glow effect */}
                        <div className='absolute inset-0 bg-[#B8860B] blur-[100px] opacity-20 animate-pulse'></div>
                        
                        <div className='relative z-10 flex flex-col items-center text-center px-6'>
                            <div className='w-24 h-24 mb-8 border-2 border-[#B8860B] flex items-center justify-center rounded-full animate-bounce'>
                                <img src={assets.logo} className='w-12 brightness-0 invert' alt="Success" />
                            </div>
                            
                            <h2 className='text-[10px] tracking-[0.6em] uppercase text-[#B8860B] font-black mb-4'>Acquisition Confirmed</h2>
                            <h1 className='text-4xl md:text-6xl font-serif text-white mb-6 italic'>Congratulations, Collector</h1>
                            
                            <div className='h-[1px] w-24 bg-[#B8860B] mb-8'></div>
                            
                            <p className='text-gray-500 text-xs tracking-widest uppercase max-w-xs leading-relaxed'>
                                Your historical specimens have been registered in the permanent archive. Prepare for white-glove transit.
                            </p>
                            
                            <p className='mt-12 text-[8px] text-[#B8860B]/50 tracking-[0.4em] uppercase animate-pulse'>
                                Redirecting to Consignment Ledger...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={onSubmitHandler} className={`bg-[#0a0a0a] min-h-screen text-white flex flex-col lg:flex-row justify-between gap-12 pt-10 pb-20 px-6 md:px-16 lg:px-24 select-none transition-all duration-1000 ${showSuccess ? 'blur-2xl opacity-0 scale-95' : 'opacity-100'}`}>
                
                {/* --- Left Side: Delivery Information --- */}
                <div className='flex flex-col gap-6 w-full lg:max-w-[550px]'>
                    <div className='mb-8'>
                        <Title text1={'SHIPPING'} text2={'REGISTRY'} />
                        <p className='text-[10px] text-gray-500 tracking-[0.3em] uppercase mt-2 font-bold'>Verified Transit Protocol</p>
                    </div>
                    
                    <div className='flex gap-4'>
                        <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='bg-[#111111] border border-white/5 rounded-sm py-4 px-5 w-full text-sm outline-none focus:border-[#B8860B]/50 transition-all' type="text" placeholder='First name' />
                        <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='bg-[#111111] border border-white/5 rounded-sm py-4 px-5 w-full text-sm outline-none focus:border-[#B8860B]/50 transition-all' type="text" placeholder='Last name' />
                    </div>
                    <input required onChange={onChangeHandler} name='email' value={formData.email} className='bg-[#111111] border border-white/5 rounded-sm py-4 px-5 w-full text-sm outline-none focus:border-[#B8860B]/50 transition-all' type="email" placeholder='Registry Email' />
                    <input required onChange={onChangeHandler} name='street' value={formData.street} className='bg-[#111111] border border-white/5 rounded-sm py-4 px-5 w-full text-sm outline-none focus:border-[#B8860B]/50 transition-all' type="text" placeholder='Street and House No.' />
                    
                    <div className='flex gap-4 relative'>
                        <input required onChange={handlePincodeChange} name='zipcode' value={formData.zipcode} className='bg-[#111111] border border-[#B8860B]/20 rounded-sm py-4 px-5 w-full text-sm outline-none focus:border-[#B8860B] transition-all font-mono' type="number" placeholder='Pincode (Verification Required)' />
                        {isVerifying && <div className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin'></div>}
                    </div>

                    <div className='flex gap-4'>
                        <input readOnly value={formData.city} className='bg-[#0d0d0d] border border-white/5 rounded-sm py-4 px-5 w-full text-sm text-gray-500 outline-none' type="text" placeholder='City' />
                        <input readOnly value={formData.state} className='bg-[#0d0d0d] border border-white/5 rounded-sm py-4 px-5 w-full text-sm text-gray-500 outline-none' type="text" placeholder='State' />
                    </div>
                    
                    <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='bg-[#111111] border border-white/5 rounded-sm py-4 px-5 w-full text-sm outline-none focus:border-[#B8860B]/50 transition-all' type="number" placeholder='Contact Number' />
                </div>

                {/* --- Right Side: Summary & Points --- */}
                <div className='lg:w-[450px]'>
                    <div className='bg-[#111111] border border-[#B8860B]/10 p-8 rounded-sm shadow-2xl'>
                        <CartTotal />
                        
                        <div className='mt-8 p-5 border border-[#B8860B]/30 bg-[#B8860B]/5 rounded-sm'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-3'>
                                    <input type="checkbox" id="pts" checked={usePoints} onChange={() => setUsePoints(!usePoints)} className='w-4 h-4 accent-[#B8860B]' disabled={userPoints < 10} />
                                    <div className='flex flex-col'>
                                        <label htmlFor="pts" className='text-[10px] tracking-[0.2em] font-black text-[#B8860B] uppercase cursor-pointer'>Apply Archive Credit</label>
                                        <p className='text-[9px] text-gray-500 uppercase tracking-widest mt-1'>Vault Balance: {userPoints} pts</p>
                                    </div>
                                </div>
                                <p className='text-sm font-bold text-[#B8860B]'>-₹{discountAmount}</p>
                            </div>
                        </div>

                        <div className='flex justify-between mt-8 pt-4 border-t border-white/5'>
                            <p className='text-[10px] tracking-[0.3em] uppercase text-gray-500'>Final Asset Valuation:</p>
                            <p className={`text-xl font-serif text-[#B8860B]`}>
                                {finalAmount <= 0 ? "COMPLIMENTARY" : `${currency} ${finalAmount.toFixed(2)}`}
                            </p>
                        </div>
                    </div>

                    <div className='mt-12'>
                        <Title text1={'PAYMENT'} text2={'PROTOCOL'} />
                        <div className='flex gap-4 flex-col mt-6'>
                            {['stripe', 'razorpay', 'cod'].map((m) => (
                                <div key={m} onClick={() => setMethod(m)} className={`flex items-center gap-4 border p-4 cursor-pointer transition-all ${method === m ? 'border-[#B8860B] bg-[#B8860B]/5' : 'border-white/5 bg-[#111111]'}`}>
                                    <div className={`w-3 h-3 border rounded-full ${method === m ? 'bg-[#B8860B] border-[#B8860B]' : 'border-white/20'}`}></div>
                                    <p className='text-gray-400 text-[10px] tracking-[0.3em] uppercase font-bold'>{m === 'cod' ? 'Cash on Delivery' : m.toUpperCase()}</p>
                                </div>
                            ))}
                        </div>
                        <button type='submit' className='w-full bg-[#B8860B] text-black py-5 text-[11px] font-black tracking-[0.4em] uppercase mt-12 hover:bg-white transition-all shadow-[0_0_50px_rgba(184,134,11,0.2)]'>
                            Complete Acquisition
                        </button>
                    </div>
                </div>
            </form>

            <style dangerouslySetInnerHTML={{ __html: `
                .animate-fade-in { animation: fadeIn 0.8s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}} />
        </div>
    )
}

export default PlaceOrder;