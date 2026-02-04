import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { User, MapPin, Save, ShieldCheck, Loader2, Edit3, X } from 'lucide-react';

const Profile = () => {
    const { token, backendUrl, userData, fetchUserData } = useContext(ShopContext);
    
    // Identity and Address states
    const [name, setName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [address, setAddress] = useState({ 
        street: '', 
        city: '', 
        state: '', 
        zipCode: '', 
        phone: '' 
    });
    
    const [isVerifying, setIsVerifying] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userData) {
            setName(userData.name || '');
            if (userData.defaultAddress) {
                setAddress(userData.defaultAddress);
            }
        }
    }, [userData]);

    const handlePincodeChange = async (e) => {
        const pin = e.target.value;
        setAddress(prev => ({ ...prev, zipCode: pin }));
        
        if (pin.length === 6) {
            setIsVerifying(true);
            try {
                const response = await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
                if (response.data[0].Status === "Success") {
                    const data = response.data[0].PostOffice[0];
                    setAddress(prev => ({ 
                        ...prev, 
                        city: data.District, 
                        state: data.State 
                    }));
                    toast.success(`Registry Verified: ${data.District}`);
                } else {
                    toast.error("Invalid Registry Pincode.");
                }
            } catch (error) {
                toast.error("Pincode service offline.");
            } finally {
                setIsVerifying(false);
            }
        }
    };

    const updateProfile = async () => {
        if (!name.trim()) return toast.error("Identity name cannot be empty.");
        
        setLoading(true);
        try {
            const res = await axios.post(
                backendUrl + '/api/user/update-address', 
                { name, address }, 
                { headers: { token } }
            );
            if (res.data.success) {
                toast.success("Registry synchronized successfully.");
                setIsEditingName(false);
                fetchUserData();
            }
        } catch (error) {
            toast.error("Registry synchronization failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='px-6 md:px-16 lg:px-24 py-16 bg-[#FCF9F4] min-h-screen font-sans'>
            <div className='mb-12'>
                <h2 className='text-4xl font-black uppercase tracking-tighter text-black'>Account Archive</h2>
                <p className='text-[10px] text-gray-400 tracking-[0.3em] uppercase mt-2 font-black'>Collector Identity & Logistics</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>
                
                {/* --- Identity & Vault Stats --- */}
                <div className='lg:col-span-1 space-y-6'>
                    <div className='bg-black p-8 rounded-sm text-white shadow-2xl relative overflow-hidden'>
                        <div className='absolute top-0 right-0 w-32 h-32 bg-[#BC002D] blur-[80px] opacity-20'></div>
                        
                        <div className='relative z-10 flex flex-col items-center gap-5 mb-8'>
                            <div className='w-20 h-20 bg-[#BC002D] rounded-full flex items-center justify-center text-3xl font-black shadow-lg shadow-[#BC002D]/20'>
                                {name?.charAt(0)}
                            </div>
                            <div className='text-center w-full group'>
                                <p className='text-[10px] font-black uppercase tracking-[0.2em] text-[#BC002D] mb-1'>Verified Collector</p>
                                
                                {isEditingName ? (
                                    <div className='flex items-center gap-2 justify-center'>
                                        <input 
                                            value={name} 
                                            onChange={(e) => setName(e.target.value)}
                                            className='bg-transparent border-b border-[#BC002D] text-center text-xl font-bold tracking-tight outline-none w-full transition-all'
                                            autoFocus
                                        />
                                        <X size={16} className='cursor-pointer text-gray-500 hover:text-white' onClick={() => {setIsEditingName(false); setName(userData.name)}} />
                                    </div>
                                ) : (
                                    <div className='flex items-center gap-2 justify-center cursor-pointer' onClick={() => setIsEditingName(true)}>
                                        <h3 className='text-xl font-bold tracking-tight border-b border-transparent group-hover:border-white/20 transition-all'>{name}</h3>
                                        <Edit3 size={14} className='text-gray-500 opacity-0 group-hover:opacity-100 transition-all' />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='relative z-10 space-y-5 pt-6 border-t border-white/10'>
                            <div className='flex justify-between items-center'>
                                <span className='text-[9px] font-black uppercase tracking-widest text-gray-500'>Vault Balance</span>
                                <span className='font-mono text-[#BC002D] text-sm'>{userData?.totalRewardPoints} PTS</span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='text-[9px] font-black uppercase tracking-widest text-gray-500'>Referral ID</span>
                                <span className='font-mono text-[10px] bg-white/5 px-2 py-1 rounded'>{userData?.referralCode || 'NOT_GEN'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Verified Shipping Credentials --- */}
                <div className='lg:col-span-2'>
                    <div className='bg-white p-8 border border-black/5 rounded-sm shadow-sm'>
                        <div className='flex items-center gap-3 mb-8'>
                            <MapPin size={18} className='text-[#BC002D]' />
                            <h4 className='text-[10px] font-black uppercase tracking-[0.3em] text-black'>
                                {userData?.defaultAddress?.street ? "Registered Shipping Address" : "Deploy Shipping Credentials"}
                            </h4>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='md:col-span-2'>
                                <p className='text-[9px] uppercase font-bold text-gray-400 mb-2 ml-1'>Street & Landmark</p>
                                <input value={address.street} onChange={(e)=>setAddress({...address, street: e.target.value})} className='w-full p-4 bg-gray-50 border border-black/5 rounded-sm text-sm outline-none focus:border-[#BC002D]/30 transition-all' placeholder="Add street address to registry..." />
                            </div>

                            <div className='relative'>
                                <p className='text-[9px] uppercase font-bold text-gray-400 mb-2 ml-1'>Postal Pincode</p>
                                <input value={address.zipCode} onChange={handlePincodeChange} className='w-full p-4 bg-white border border-[#BC002D]/20 rounded-sm text-sm font-mono outline-none focus:border-[#BC002D] transition-all' placeholder="Enter 6-digit code" type="number" />
                                {isVerifying && <Loader2 size={16} className='absolute right-4 bottom-4 animate-spin text-[#BC002D]' />}
                            </div>

                            <div>
                                <p className='text-[9px] uppercase font-bold text-gray-400 mb-2 ml-1'>Contact Number</p>
                                <input value={address.phone} onChange={(e)=>setAddress({...address, phone: e.target.value})} className='w-full p-4 bg-gray-50 border border-black/5 rounded-sm text-sm outline-none focus:border-[#BC002D]/30 transition-all' placeholder="Primary phone number" type="number" />
                            </div>

                            <div>
                                <p className='text-[9px] uppercase font-bold text-gray-400 mb-2 ml-1'>City (Verified)</p>
                                <input readOnly value={address.city} className='w-full p-4 bg-gray-100 border border-black/5 rounded-sm text-sm text-gray-400 outline-none cursor-not-allowed' placeholder="Verified via Pincode" />
                            </div>

                            <div>
                                <p className='text-[9px] uppercase font-bold text-gray-400 mb-2 ml-1'>State (Verified)</p>
                                <input readOnly value={address.state} className='w-full p-4 bg-gray-100 border border-black/5 rounded-sm text-sm text-gray-400 outline-none cursor-not-allowed' placeholder="Verified via Pincode" />
                            </div>
                        </div>

                        <button 
                            onClick={updateProfile} 
                            disabled={loading || isVerifying}
                            className={`mt-10 w-full md:w-fit px-10 py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-3 ${
                                loading ? 'bg-gray-400' : 'bg-black text-white hover:bg-[#BC002D]'
                            }`}
                        >
                            {loading ? <Loader2 size={14} className='animate-spin' /> : <ShieldCheck size={14} />}
                            {loading ? 'Synchronizing...' : (userData?.defaultAddress?.street || isEditingName) ? 'Update Registry' : 'Save Credentials'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;