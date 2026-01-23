import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  // Traditional Login/Signup
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
  }

  // Google Login Handler
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
  }, [token])

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
        <div className='inline-flex items-center gap-2 mb-2 mt-10'>
            <p className='prata-regular text-3xl'>{currentState}</p>
            <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
        </div>

        {currentState === 'Sign Up' && (
          <input onChange={(e)=>setName(e.target.value)} value={name} type="text" className='w-full px-3 py-2 border border-gray-800' placeholder='Name' required/>
        )}
        <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" className='w-full px-3 py-2 border border-gray-800' placeholder='Email' required/>
        <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" className='w-full px-3 py-2 border border-gray-800' placeholder='Password' required/>
        
        <button className='bg-black text-white w-full py-2 mt-2'>
          {currentState === 'Login' ? 'Sign In' : 'Sign Up'}
        </button>

        <div className='flex items-center gap-2 w-full my-2'>
            <hr className='flex-1 border-gray-300' />
            <span className='text-gray-400 text-xs uppercase'>or login with</span>
            <hr className='flex-1 border-gray-300' />
        </div>

        <GoogleLogin onSuccess={googleSuccess} onError={() => toast.error("Login Failed")} />

        <div className='w-full flex justify-between text-sm mt-4'>
            <p className='cursor-pointer'>Forgot password?</p>
            {currentState === 'Login' 
              ? <p onClick={()=>setCurrentState('Sign Up')} className='cursor-pointer underline'>Create account</p>
              : <p onClick={()=>setCurrentState('Login')} className='cursor-pointer underline'>Login Here</p>
            }
        </div>
    </form>
  )
}

export default Login