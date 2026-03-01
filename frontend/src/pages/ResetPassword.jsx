// frontend/src/pages/ResetPassword.jsx
import React, { useState, useContext } from 'react'; // Added useContext
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext'; // Import context
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const { backendUrl, navigate } = useContext(ShopContext); // Now this works

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(backendUrl + '/api/user/reset-password', { token, newPassword });
            if (response.data.success) {
                toast.success("Credentials updated. You may now enter the archive.");
                navigate('/login');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) { 
            toast.error("Archive connection failed."); 
        }
    };

    return (
        <div className="min-h-screen bg-[#FCF9F4] flex items-center justify-center p-6">
            <form onSubmit={handleReset} className="bg-white p-12 border border-black/5 shadow-xl max-w-md w-full">
                <h2 className="text-3xl font-serif mb-2 text-black">Update Credentials</h2>
                <p className='text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-8'>Security Protocol MMXXVI</p>
                
                <input 
                    type="password" 
                    placeholder="New Password" 
                    className="w-full p-4 bg-[#F9F9F9] border border-black/5 mb-6 outline-none focus:border-[#BC002D] transition-all"
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                
                <button className="w-full bg-black text-white py-4 font-black uppercase tracking-[0.4em] text-[11px] hover:bg-[#BC002D] transition-all shadow-lg active:scale-95">
                    Save New Password
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;