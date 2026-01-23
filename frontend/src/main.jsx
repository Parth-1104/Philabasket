import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import ShopContextProvider from './context/ShopContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    {/* Step 1: Wrap everything with the Provider */}
    {/* Step 2: Use your actual Client ID from the Google Cloud Console */}
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ShopContextProvider>
        <App />
      </ShopContextProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>,
)