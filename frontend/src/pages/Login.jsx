import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { assets } from '../assets/assets'; // Assuming your image is in assets

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const endpoint = currentState === 'Sign Up' ? '/api/user/register' : '/api/user/login';
      const payload = currentState === 'Sign Up' ? { name, email, password } : { email, password };
      
      const response = await axios.post(backendUrl + endpoint, payload);
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const googleSuccess = async (res) => {
    try {
      const response = await axios.post(backendUrl + '/api/user/google-login', { 
        idToken: res.credential 
      });
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Google Authentication Failed");
    }
  };

  useEffect(() => {
    if (token) navigate('/');
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      {/* Container holding both Image and Form */}
      <div className="flex w-full max-w-7xl bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
        
        {/* Left Side: Big Image */}
        <div className="hidden md:block w-1/2">
          <img 
            src={assets.loginimf} // Replace with your image variable name
            alt="Login Visual" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side: Main Login Block */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
              {currentState === 'Login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-500 mt-3">
              {currentState === 'Login' ? 'Please enter your credentials to access your account.' : 'Join us today to get the best shopping experience.'}
            </p>
          </div>

          <form onSubmit={onSubmitHandler} className="flex flex-col gap-5">
            {currentState === 'Sign Up' && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
                <input 
                  onChange={(e) => setName(e.target.value)} 
                  value={name} 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" 
                  placeholder="Enter your name" 
                  required 
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
              <input 
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
                type="email" 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" 
                placeholder="name@example.com" 
                required 
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-medium text-gray-700">Password</label>
                {currentState === 'Login' && (
                  <span className="text-sm text-gray-500 hover:text-black cursor-pointer transition-colors">Forgot Password?</span>
                )}
              </div>
              <input 
                onChange={(e) => setPassword(e.target.value)} 
                value={password} 
                type="password" 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" 
                placeholder="••••••••" 
                required 
              />
            </div>

            <button className="bg-black text-white w-full py-4 rounded-xl font-semibold mt-4 hover:bg-gray-800 active:scale-[0.99] transition-all shadow-lg">
              {currentState === 'Login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-400 font-medium">Or Login with Google</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin 
              onSuccess={googleSuccess} 
              onError={() => toast.error("Login Failed")} 
              useOneTap
              theme="outline"
              shape="circle"
            />
          </div>

          <div className="mt-10 text-center">
            {currentState === 'Login' ? (
              <p className="text-gray-500">
                New here?{' '}
                <span 
                  onClick={() => setCurrentState('Sign Up')} 
                  className="text-black font-bold cursor-pointer hover:underline decoration-2 underline-offset-4"
                >
                  Create an account
                </span>
              </p>
            ) : (
              <p className="text-gray-500">
                Already have an account?{' '}
                <span 
                  onClick={() => setCurrentState('Login')} 
                  className="text-black font-bold cursor-pointer hover:underline decoration-2 underline-offset-4"
                >
                  Sign in here
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