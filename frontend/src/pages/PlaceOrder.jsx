import React, { useContext, useEffect, useState, useMemo } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Ticket, CheckCircle, Loader2, X, ShieldCheck, Globe, Info } from 'lucide-react';

const PlaceOrder = () => {
    const [method, setMethod] = useState('cod');
    const { 
        navigate, backendUrl, token, cartItems, setCartItems, 
        getCartAmount, delivery_fee, products, currency, 
        userData, fetchUserData, formatPrice 
    } = useContext(ShopContext);
    
    const [loading, setLoading] = useState(false);
    const [userPoints, setUserPoints] = useState(0); 
    const [usePoints, setUsePoints] = useState(false); 
    const [isVerifying, setIsVerifying] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false); 

    // --- NEW FUNCTIONAL STATES ---
    const [countries, setCountries] = useState([]);
    const [showTerms, setShowTerms] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isApplying, setIsApplying] = useState(false);

    const [sameAsShipping, setSameAsShipping] = useState(true);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', street: '',
        city: '', state: '', zipcode: '', country: 'India', countryCode: '+91', phone: ''
    });

    const [billingData, setBillingData] = useState({
        firstName: '', lastName: '', street: '', city: '', state: '', zipcode: '', country: 'India'
    });

    // --- FETCH COUNTRIES & DIAL CODES ---
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await axios.get('https://restcountries.com/v3.1/all?fields=name,idd,cca2');
                const sorted = res.data.map(c => ({
                    name: c.name.common,
                    code: c.cca2,
                    dial: (c.idd.root || '') + (c.idd.suffixes?.[0] || '')
                })).sort((a, b) => a.name.localeCompare(b.name));
                setCountries(sorted);
            } catch (err) { toast.error("Geographic Registry Offline"); }
        };
        fetchCountries();
    }, []);

    // Sync Dial Code when country changes
    const handleCountryChange = (e) => {
        const countryName = e.target.value;
        const selected = countries.find(c => c.name === countryName);
        setFormData(prev => ({ 
            ...prev, 
            country: countryName, 
            countryCode: selected ? selected.dial : prev.countryCode 
        }));
    };

    useEffect(() => {
        if (!token) navigate('/login');
        else if (userData) {
            setUserPoints(userData.totalRewardPoints || 0);
            if (userData.defaultAddress?.street) {
                const adr = userData.defaultAddress;
                const [fName, ...lNameParts] = (userData.name || "").split(' ');
                setFormData(prev => ({
                    ...prev,
                    firstName: fName || '',
                    lastName: lNameParts.join(' ') || '',
                    email: userData.email || '',
                    street: adr.street || '',
                    city: adr.city || '',
                    state: adr.state || '',
                    zipcode: adr.zipCode || '',
                    phone: adr.phone || ''
                }));
            }
        } else { fetchUserData(); }
    }, [token, userData]);

    const handlePincodeChange = async (e) => {
        const pin = e.target.value;
        setFormData(prev => ({ ...prev, zipcode: pin }));
        if (pin.length === 6 && formData.country === 'India') {
            setIsVerifying(true);
            try {
                const response = await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
                if (response.data[0].Status === "Success") {
                    const data = response.data[0].PostOffice[0];
                    setFormData(prev => ({ ...prev, city: data.District, state: data.State }));
                    toast.success(`Registry verified: ${data.District}`);
                }
            } catch (error) { toast.error("Pincode verification failed"); } 
            finally { setIsVerifying(false); }
        }
    };

    const applyCoupon = async () => {
        if (!couponCode) return;
        setIsApplying(true);
        try {
            const res = await axios.post(
                backendUrl + '/api/coupon/validate', 
                { code: couponCode, amount: getCartAmount() },
                { headers: { token } } // THIS WAS MISSING
            );
            if (res.data.success) {
                setAppliedCoupon(res.data.coupon);
                toast.success(`Coupon Applied: ${res.data.coupon.code}`);
            } else { 
                toast.error(res.data.message); 
            }
        } catch (error) { 
            toast.error("Coupon registry offline"); 
        } finally { 
            setIsApplying(false); 
        }
    };

    const calculation = useMemo(() => {
        const cartAmount = getCartAmount();
        const subtotal = cartAmount + delivery_fee;
        let couponVal = 0;
        if (appliedCoupon) {
            couponVal = appliedCoupon.discountType === 'percentage' 
                ? (cartAmount * appliedCoupon.value) / 100 
                : appliedCoupon.value;
        }
        const rewardDiscount = usePoints ? Math.min(Math.floor(userPoints / 10), subtotal - couponVal) : 0;
        const finalPayable = subtotal - couponVal - rewardDiscount;
        return {
            pointsDeducted: rewardDiscount * 10,
            couponDeducted: couponVal,
            rewardDeducted: rewardDiscount,
            totalPayable: finalPayable
        };
    }, [cartItems, userPoints, usePoints, appliedCoupon, delivery_fee, getCartAmount]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!agreedToTerms) return toast.error("Please acknowledge the Acquisition Terms.");
        if (loading) return;

        try {
            setLoading(true);
            const orderItems = products.filter(p => cartItems[p._id] > 0).map(p => ({...p, quantity: cartItems[p._id]}));

            const orderData = {
                address: formData,
                billingAddress: sameAsShipping ? formData : billingData,
                items: orderItems,
                amount: calculation.totalPayable,
                pointsUsed: Math.round(calculation.pointsDeducted),
                couponUsed: appliedCoupon ? appliedCoupon.code : null,
                discountAmount: calculation.couponDeducted,
                phone: `${formData.countryCode}${formData.phone}`
            };

            const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } });

            if (response.data.success) {
                setCartItems({});
                setShowSuccess(true);
                fetchUserData();
                setTimeout(() => { navigate('/orders'); }, 4000);
            } else {
                toast.error(response.data.message);
                setLoading(false);
            }
        } catch (error) {
            toast.error("Registry synchronization failed.");
            setLoading(false);
        }
    };

    return (
        <div className='relative'>
            {/* --- TERMS & CONDITIONS MODAL --- */}
            {showTerms && (
                <div className='fixed inset-0 z-[300] flex items-center justify-center p-6'>
                    <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={() => setShowTerms(false)}></div>
                    <div className='bg-white w-full max-w-2xl relative z-10 p-10 rounded-sm shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto'>
                        <div className='flex justify-between items-center mb-8 border-b border-black/5 pb-4'>
                            <h3 className='font-black uppercase tracking-widest text-sm'>Acquisition Protocol Terms</h3>
                            <X className='cursor-pointer' onClick={() => setShowTerms(false)} />
                        </div>
                        <div className='space-y-6 text-[11px] leading-relaxed text-gray-600 uppercase tracking-tight'>
                            <p className='font-bold text-black'>1. Authenticity & Finality</p>
                            <p>Every specimen acquired through the PhilaBasket Registry is guaranteed as described. Once the acquisition is confirmed, the white-glove transit protocol begins and cancellations are restricted.</p>
                            <p className='font-bold text-black'>2. Registry Logistics</p>
                            <p>Collectors are responsible for precise shipping coordinates. PhilaArt is not liable for misdirected consignments due to inaccurate data entry in the Shipping Registry.</p>
                            <p className='font-bold text-black'>3. Archive Credits</p>
                            <p>Reward points (Archive Credits) have no external cash value and are exclusively for use within the PhilaBasket ecosystem.</p>
                        </div>
                        <button onClick={() => { setAgreedToTerms(true); setShowTerms(false); }} className='w-full mt-10 bg-black text-white py-5 text-[10px] font-black uppercase tracking-widest hover:bg-[#BC002D] transition-all'>
                            Acknowledge & Accept
                        </button>
                    </div>
                </div>
            )}

            {/* --- SUCCESS OVERLAY --- */}
            {showSuccess && (
                <div className='fixed inset-0 z-[400] bg-white flex flex-col items-center justify-center animate-fade-in'>
                    <div className='flex flex-col items-center text-center px-6'>
                        <div className='w-24 h-24 mb-8 border-2 border-[#BC002D] flex items-center justify-center rounded-full animate-bounce'>
                            <img src={assets.logo} className='w-12 brightness-0' alt="Success" />
                        </div>
                        <h2 className='text-[10px] tracking-[0.4em] uppercase text-[#BC002D] font-black'>Acquisition Secured</h2>
                        <h1 className='text-4xl font-serif mt-4 italic'>Welcome to the Archive.</h1>
                    </div>
                </div>
            )}

            <form onSubmit={onSubmitHandler} className="bg-[#FCF9F4] min-h-screen text-black flex flex-col lg:flex-row justify-between gap-12 pt-24 pb-20 px-6 md:px-16 lg:px-24 select-none">
                
                {/* LEFT: ADDRESS REGISTRY */}
                <div className='flex flex-col gap-6 w-full lg:max-w-[550px]'>
                    <Title text1={'SHIPPING'} text2={'REGISTRY'} />
                    
                    <div className='flex flex-col gap-2'>
                        <p className='text-[9px] font-black uppercase text-gray-400 ml-1'>Acquisition Region</p>
                        <select 
                            required 
                            value={formData.country} 
                            onChange={handleCountryChange}
                            className='w-full bg-white border border-black/5 rounded-sm py-4 px-5 text-sm outline-none focus:border-[#BC002D]/30'
                        >
                            {countries.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className='flex gap-4'>
                        <input required value={formData.firstName} onChange={(e)=>setFormData({...formData, firstName: e.target.value})} className='bg-white border border-black/5 rounded-sm py-4 px-5 w-full text-sm placeholder-black' placeholder='First Name' />
                        <input required value={formData.lastName} onChange={(e)=>setFormData({...formData, lastName: e.target.value})} className='bg-white border border-black/5 rounded-sm py-4 px-5 w-full text-sm placeholder-black' placeholder='Last Name' />
                    </div>

                    <div className='flex gap-2'>
                        <div className='w-24 bg-gray-100 border border-black/5 py-4 flex items-center justify-center text-xs font-bold text-gray-500 rounded-sm'>
                            {formData.countryCode}
                        </div>
                        <input required value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} className='flex-1 bg-white border border-black/5 py-4 px-5 text-sm placeholder-black' placeholder='Phone Number' type="number" />
                    </div>

                    <input required value={formData.street} onChange={(e)=>setFormData({...formData, street: e.target.value})} className='bg-white border border-black/5 py-4 px-5 text-sm placeholder-black' placeholder='Shipping Street' />
                    
                    <div className='flex gap-4 relative'>
                        <input required value={formData.zipcode} onChange={handlePincodeChange} className='bg-white border border-[#BC002D]/20 py-4 px-5 w-full text-sm font-mono placeholder-black' placeholder='Pincode' />
                        {isVerifying && <Loader2 className='absolute right-4 top-4 animate-spin text-[#BC002D]' size={16} />}
                    </div>

                    {/* --- BILLING SECTION --- */}
                    <div className='mt-8 pt-8 border-t border-black/5'>
                        <div className='flex items-center justify-between mb-4'>
                            <h4 className='text-[10px] font-black uppercase tracking-[0.2em]'>Billing Protocol</h4>
                            <div onClick={() => setSameAsShipping(!sameAsShipping)} className='flex items-center gap-2 cursor-pointer'>
                                <div className={`w-4 h-4 border flex items-center justify-center ${sameAsShipping ? 'bg-black border-black' : 'border-gray-300'}`}>
                                    {sameAsShipping && <CheckCircle size={12} className='text-white' />}
                                </div>
                                <span className='text-[9px] font-black uppercase text-gray-400'>Same as Shipping</span>
                            </div>
                        </div>

                        {!sameAsShipping && (
                            <div className='flex flex-col gap-4 animate-fade-in'>
                                <input required onChange={(e)=>setBillingData({...billingData, street: e.target.value})} className='bg-white border border-black/5 py-4 px-5 text-sm placeholder-black' placeholder='Billing Street Address' />
                                <div className='flex gap-4'>
                                    <input required onChange={(e)=>setBillingData({...billingData, city: e.target.value})} className='bg-white border border-black/5 py-4 px-5 w-full text-sm placeholder-black' placeholder='City' />
                                    <input required onChange={(e)=>setBillingData({...billingData, zipcode: e.target.value})} className='bg-white border border-black/5 py-4 px-5 w-full text-sm placeholder-black' placeholder='Zipcode' />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* TERMS CHECKBOX */}
                    <div className='mt-8 flex items-start gap-3 p-5 bg-white border border-black/5 rounded-sm'>
                        <input required type="checkbox" checked={agreedToTerms} onChange={() => setAgreedToTerms(!agreedToTerms)} className='mt-1 w-4 h-4 accent-black' />
                        <p className='text-[10px] text-gray-500 font-bold uppercase tracking-tight leading-relaxed cursor-pointer'>
                            I acknowledge the <span onClick={() => setShowTerms(true)} className='text-[#BC002D] underline underline-offset-4 decoration-1'>Acquisition Terms</span> and verify that all shipping credentials are accurate.
                        </p>
                    </div>
                </div>

                <div className='flex flex-col gap-6 w-full lg:max-w-[400px]'>
    <div className='mb-4'>
        <Title text1={'SPECIMEN'} text2={'OVERVIEW'} />
        <p className='text-[10px] text-gray-400 tracking-[0.3em] uppercase mt-2 font-black'>Inventory Verification</p>
    </div>
    
    <div className='space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar'>
        {products.filter(p => cartItems[p._id] > 0).map((item, index) => (
            <div key={index} className='flex items-center gap-4 bg-white p-4 border border-black/5 rounded-sm group'>
                <div className='w-16 h-16 bg-gray-50 rounded-sm flex-shrink-0 overflow-hidden'>
                    <img src={item.image[0]} className='w-full h-full object-contain p-1 group-hover:scale-110 transition-transform' alt="" />
                </div>
                <div className='flex-1'>
                    <p className='text-[10px] font-black uppercase text-black truncate max-w-[150px]'>{item.name}</p>
                    <p className='text-[9px] text-gray-400 font-bold uppercase'>Qty: {cartItems[item._id]}</p>
                </div>
                <p className='text-xs font-black text-black'>{currency === 'INR' ? '₹' : '$'}{item.price}</p>
            </div>
        ))}
    </div>
</div>

                {/* RIGHT: LEDGER SUMMARY */}
                <div className='lg:w-[450px]'>
                    <div className='bg-white border border-black/5 p-8 rounded-sm shadow-xl'>
                        <CartTotal />
                        
                        {/* COUPON INPUT */}
                        <div className='mt-8 flex gap-2'>
                            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="ENTER COUPON" className='flex-1 border border-black/5 bg-[#F9F9F9] p-4 text-[10px] font-black outline-none focus:border-black placeholder-black' />
                            <button type="button" onClick={applyCoupon} className='bg-black text-white px-6 py-4 text-[9px] font-black uppercase tracking-widest hover:bg-[#BC002D] transition-all'>
                                {isApplying ? '...' : 'Apply'}
                            </button>
                        </div>

                        {/* REWARD POINTS */}
                        <div className='mt-6 p-4 border border-[#BC002D]/10 bg-[#BC002D]/5 rounded-sm flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                <input type="checkbox" checked={usePoints} onChange={() => setUsePoints(!usePoints)} className='w-4 h-4 accent-[#BC002D]' />
                                <label className='text-[10px] font-black text-[#BC002D] uppercase cursor-pointer'>Apply Archive Credits ({userPoints} PTS)</label>
                            </div>
                        </div>

                        <div className='mt-8 pt-4 border-t border-black/5 space-y-3'>
                            {appliedCoupon && (
                                <div className='flex justify-between text-[10px] font-black text-green-600 uppercase tracking-widest'>
                                    <span>Coupon ({appliedCoupon.code})</span>
                                    <span>-{currency === 'INR' ? '₹' : '$'}{calculation.couponDeducted.toFixed(2)}</span>
                                </div>
                            )}
                            <div className='flex justify-between text-[10px] font-black text-[#BC002D] uppercase tracking-widest'>
                                <span>Archive Credit</span>
                                <span>-{currency === 'INR' ? '₹' : '$'}{calculation.rewardDeducted.toFixed(2)}</span>
                            </div>
                            <div className='flex justify-between pt-4 border-t border-dashed border-gray-100'>
                                <p className='text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]'>Final Asset Valuation</p>
                                <p className='text-xl font-serif font-black text-[#BC002D]'>{currency === 'INR' ? '₹' : '$'}{calculation.totalPayable.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className='mt-12'>
                        <Title text1={'PAYMENT'} text2={'PROTOCOL'} />
                        <div className='flex flex-col gap-4 mt-6'>
                            {['stripe', 'razorpay', 'cod'].map((m) => (
                                <div key={m} onClick={() => setMethod(m)} className={`flex items-center gap-4 border p-5 cursor-pointer rounded-sm ${method === m ? 'border-[#BC002D] bg-[#BC002D]/5 shadow-sm' : 'border-black/5 bg-white opacity-60'}`}>
                                    <div className={`w-3 h-3 border rounded-full ${method === m ? 'bg-[#BC002D] border-[#BC002D]' : 'border-black/10'}`}></div>
                                    <p className='text-[10px] tracking-[0.3em] uppercase font-black'>{m === 'cod' ? 'Cash on Delivery' : m.toUpperCase()}</p>
                                </div>
                            ))}
                        </div>
                        <button type='submit' disabled={loading} className='bg-black text-white w-full py-5 rounded-sm font-black text-[11px] uppercase tracking-[0.4em] mt-8 hover:bg-[#BC002D] shadow-xl transition-all active:scale-[0.98]'>
                            {loading ? 'Synchronizing Registry...' : 'Confirm Acquisition'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PlaceOrder;