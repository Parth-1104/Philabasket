import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { assets } from '../assets/assets'; 
import { useSearchParams } from 'react-router-dom';

const Login = () => {
  // States: 'Login', 'Sign Up', 'Reset Password'
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const [searchParams] = useSearchParams();
  const referrerCode = searchParams.get('ref');

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      let endpoint = '';
      let payload = {};

      if (currentState === 'Sign Up') {
        endpoint = '/api/user/register';
        payload = { name, email, password, referrerCode };
      } else if (currentState === 'Login') {
        endpoint = '/api/user/login';
        payload = { email, password };
      } else {
        // --- RECOVERY LOGIC ---
        endpoint = '/api/user/forgot-password';
        payload = { email };
      }
      
      const response = await axios.post(backendUrl + endpoint, payload);
      
      if (response.data.success) {
        if (currentState === 'Reset Password') {
          toast.success("Recovery instructions sent to registry email.");
          setCurrentState('Login');
        } else {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Google Login preserved...
  const googleSuccess = async (res) => {
    try {
      const response = await axios.post(backendUrl + '/api/user/google-login', { 
        idToken: res.credential,
        referrerCode 
      });
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Authentication Failed");
    }
  };

  useEffect(() => {
    if (token) navigate('/');
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#FCF9F4] select-none animate-fade-in">
      
      <div className="flex w-full max-w-6xl bg-white shadow-xl rounded-sm overflow-hidden border border-black/5">
        
        {/* Left Side: Historical Visual */}
        <div className="hidden md:block w-[45%] relative overflow-hidden">
          <img 
            src={assets.loginimf} 
            alt="Collector" 
            className="w-full h-full object-cover grayscale-[0.2] hover:scale-110 transition-transform duration-[3s]"
          />
          <div className="absolute inset-0 bg-[#BC002D]/10 mix-blend-multiply"></div>
          {/* <div className="absolute bottom-10 left-10 text-white z-10">
            <p className="text-[10px] tracking-[0.6em] uppercase font-black mb-2">Established MMXXVI</p>
            <h3 className="text-3xl font-serif italic">Accessing the Sovereign Archive.</h3>
          </div> */}
        </div>

        {/* Right Side: Registry Form */}
        <div className="w-full md:w-[55%] p-10 sm:p-16 flex flex-col justify-center bg-white">
          
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[1px] bg-[#BC002D]"></div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-[#BC002D] font-black">
                {currentState === 'Login' ? 'Authentication' : currentState === 'Sign Up' ? 'Registry Entry' : 'Security Protocol'}
              </p>
            </div>
            <h2 className="text-5xl font-serif text-black tracking-tighter">
              {currentState === 'Login' ? 'Sign In' : currentState === 'Sign Up' ? 'Create Account' : 'Recover Access'}
            </h2>
            <p className='text-gray-400 text-[10px] uppercase tracking-widest mt-4 font-bold'>
              {currentState === 'Reset Password' ? 'Enter your email to rescind lost credentials.' : 'Official Collector Registry Portal.'}
            </p>
          </div>

          <form onSubmit={onSubmitHandler} className="flex flex-col gap-6">
            {currentState === 'Sign Up' && (
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  onChange={(e) => setName(e.target.value)} 
                  value={name} 
                  type="text" 
                  className="w-full px-5 py-4 rounded-sm bg-[#F9F9F9] border border-black/5 focus:bg-white focus:border-[#BC002D]/30 outline-none transition-all text-sm" 
                  placeholder="Collector Name" 
                  required 
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Registry Email</label>
              <input 
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
                type="email" 
                className="w-full px-5 py-4 rounded-sm bg-[#F9F9F9] border border-black/5 focus:bg-white focus:border-[#BC002D]/30 outline-none transition-all text-sm" 
                placeholder="collector@archive.com" 
                required 
              />
            </div>

            {currentState !== 'Reset Password' && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Access Key</label>
                  {currentState === 'Login' && (
                    <span 
                      onClick={() => setCurrentState('Reset Password')}
                      className="text-[9px] text-[#BC002D] hover:underline cursor-pointer transition-colors uppercase font-bold tracking-widest"
                    >
                      Forgot password?
                    </span>
                  )}
                </div>
                <input 
                  onChange={(e) => setPassword(e.target.value)} 
                  value={password} 
                  type="password" 
                  className="w-full px-5 py-4 rounded-sm bg-[#F9F9F9] border border-black/5 focus:bg-white focus:border-[#BC002D]/30 outline-none transition-all text-sm" 
                  placeholder="••••••••" 
                  required 
                />
              </div>
            )}

            <button className="bg-black text-white w-full py-5 rounded-sm font-black text-[11px] uppercase tracking-[0.4em] mt-4 hover:bg-[#BC002D] transition-all shadow-xl active:scale-[0.98]">
              {currentState === 'Login' ? 'Initialize Access' : currentState === 'Sign Up' ? 'Register Specimen' : 'Request Link'}
            </button>
          </form>

          {/* Form Footer / State Toggles */}
          <div className="mt-12 text-center flex flex-col gap-4">
            {currentState === 'Reset Password' ? (
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                Remembered your key?{' '}
                <span 
                  onClick={() => setCurrentState('Login')} 
                  className="text-black font-black cursor-pointer hover:text-[#BC002D] transition-all"
                >
                  Return to Sign In
                </span>
              </p>
            ) : currentState === 'Login' ? (
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                New Collector?{' '}
                <span 
                  onClick={() => setCurrentState('Sign Up')} 
                  className="text-black font-black cursor-pointer hover:text-[#BC002D] transition-all"
                >
                  Create Registry Entry
                </span>
              </p>
            ) : (
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                Existing Member?{' '}
                <span 
                  onClick={() => setCurrentState('Login')} 
                  className="text-black font-black cursor-pointer hover:text-[#BC002D] transition-all"
                >
                  Return to Archive
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;