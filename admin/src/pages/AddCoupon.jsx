import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Ticket, Calendar, ShieldCheck } from 'lucide-react';
import { backendUrl } from '../App'
const AddCoupon = ({ token }) => {
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        value: '',
        minAmount: '',
        expiryDate: ''
    });

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(backendUrl + '/api/coupon/create', formData, { headers: { token } });
            if (res.data.success) {
                toast.success("Coupon Registry Updated");
                setFormData({ code: '', discountType: 'percentage', value: '', minAmount: '', expiryDate: '' });
            }
        } catch (error) { toast.error(error.message); }
    };

    return (
        <div className='p-8 bg-white border border-black/5 rounded-sm shadow-sm max-w-2xl'>
            <div className='flex items-center gap-3 mb-8'>
                <Ticket className='text-[#BC002D]' size={20} />
                <h2 className='text-sm font-black uppercase tracking-[0.3em]'>Coupon Registry</h2>
            </div>

            <form onSubmit={onSubmitHandler} className='flex flex-col gap-6'>
                <div>
                    <p className='text-[10px] font-black uppercase text-gray-400 mb-2'>Coupon Code</p>
                    <input required onChange={(e)=>setFormData({...formData, code: e.target.value.toUpperCase()})} value={formData.code} className='w-full p-4 bg-gray-50 border border-black/5 rounded-sm outline-none focus:border-[#BC002D]' placeholder="e.g. WELCOME10" />
                </div>

                <div className='grid grid-cols-2 gap-6'>
                    <div>
                        <p className='text-[10px] font-black uppercase text-gray-400 mb-2'>Discount Type</p>
                        <select onChange={(e)=>setFormData({...formData, discountType: e.target.value})} className='w-full p-4 bg-gray-50 border border-black/5 rounded-sm outline-none'>
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (Flat)</option>
                        </select>
                    </div>
                    <div>
                        <p className='text-[10px] font-black uppercase text-gray-400 mb-2'>Value</p>
                        <input required type="number" onChange={(e)=>setFormData({...formData, value: e.target.value})} value={formData.value} className='w-full p-4 bg-gray-50 border border-black/5 rounded-sm outline-none' placeholder="10" />
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-6'>
                    <div>
                        <p className='text-[10px] font-black uppercase text-gray-400 mb-2'>Min. Order Amount</p>
                        <input type="number" onChange={(e)=>setFormData({...formData, minAmount: e.target.value})} value={formData.minAmount} className='w-full p-4 bg-gray-50 border border-black/5 rounded-sm outline-none' placeholder="500" />
                    </div>
                    <div>
                        <p className='text-[10px] font-black uppercase text-gray-400 mb-2'>Expiry Date</p>
                        <input required type="date" onChange={(e)=>setFormData({...formData, expiryDate: e.target.value})} value={formData.expiryDate} className='w-full p-4 bg-gray-50 border border-black/5 rounded-sm outline-none' />
                    </div>
                </div>

                <button type="submit" className='mt-4 bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#BC002D] transition-all flex items-center justify-center gap-3 shadow-xl'>
                    <ShieldCheck size={14} /> Deploy Coupon
                </button>
            </form>
        </div>
    );
};

export default AddCoupon;