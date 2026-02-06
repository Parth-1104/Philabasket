import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    const [currency, setCurrency] = useState('INR'); 
    const exchangeRate = 83; 
    const delivery_fee = 10;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('');
    const [userData, setUserData] = useState(null);
    const [userPoints, setUserPoints] = useState(0);
    const [cartItems, setCartItems] = useState({});
    const [wishlist, setWishlist] = useState([]);

    // --- WISHLIST LOGIC ---
    const toggleWishlist = async (itemId) => {
        if (!token) {
            toast.error("Please login to save specimens");
            return;
        }
    
        // 1. OPTIMISTIC UPDATE: Change the UI state instantly
        const wasInWishlist = wishlist.includes(itemId);
        const updatedWishlist = wasInWishlist 
            ? wishlist.filter(id => id !== itemId) 
            : [...wishlist, itemId];
        
        setWishlist(updatedWishlist);
    
        try {
            // 2. BACKGROUND SYNC: No 'await' for the response to avoid UI blocking
            const response = await axios.post(backendUrl + '/api/user/wishlist-toggle', { itemId }, { headers: { token } });
            
            if (!response.data.success) {
                // Rollback state if the server says no
                setWishlist(wishlist); 
                toast.error("Registry sync failed");
            }
            // Success toasts removed for "Zero Wastage" experience
        } catch (error) {
            // Rollback state if network fails
            setWishlist(wishlist);
            toast.error("Archive connection failed");
            console.error(error);
        }
    };
    
    const getWishlistData = async (userToken) => {
        try {
            const response = await axios.post(backendUrl + '/api/user/wishlist-get', {}, { headers: { token: userToken } });
            if (response.data.success) {
                setWishlist(response.data.wishlist);
            }
        } catch (error) { 
            console.error("Wishlist sync failed:", error); 
        }
    };

    // --- CURRENCY LOGIC ---
    const toggleCurrency = () => {
        setCurrency(prev => prev === 'INR' ? 'USD' : 'INR');
    };

    const formatPrice = (price) => {
        if (currency === 'USD') {
            return (price / exchangeRate).toFixed(2);
        }
        return price;
    };

    // --- DATA FETCHING ---
    const fetchUserData = async (activeToken) => {
        const tokenToUse = activeToken || token || localStorage.getItem('token');
        if (!tokenToUse) return;

        try {
            const response = await axios.get(backendUrl + '/api/user/profile', { 
                headers: { token: tokenToUse } 
            });
            if (response.data.success) {
                setUserData(response.data.user);
                setUserPoints(response.data.user.totalRewardPoints || 0);
            }
        } catch (error) {
            console.error("Archive connection failed:", error);
        }
    }

    const getProductsData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list');
            if (response.data.success) {
                setProducts(response.data.products.reverse());
            }
        } catch (error) {
            console.log(error);
        }
    }

    // --- CART LOGIC ---
    const addToCart = async (itemId, quantity) => {
        // 1. Create a deep copy of the current cart state
        let cartData = structuredClone(cartItems);
    
        // 2. Update logic: Use the passed quantity instead of hardcoded 1
        if (cartData[itemId]) {
            cartData[itemId] += quantity;
        } else {
            cartData[itemId] = quantity;
        }
    
        // 3. Update the local state for immediate UI feedback
        setCartItems(cartData);
    
        // 4. Synchronize with the backend registry
        if (token) {
            try {
                await axios.post(
                    backendUrl + '/api/cart/add', 
                    { itemId, quantity }, // Send quantity to backend
                    { headers: { token } }
                );
            } catch (error) {
                console.error(error);
                toast.error(error.message);
            }
        }
    };
    
    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            try {
                if (cartItems[items] > 0) {
                    totalCount += cartItems[items];
                }
            } catch (error) {}
        }
        return totalCount;
    }

    const updateQuantity = async (itemId, quantity) => {
        // 1. Create a deep copy of the current cart state
        let cartData = structuredClone(cartItems);
    
        // 2. Logic: If quantity is 0, remove the item; otherwise update it
        if (quantity <= 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
    
        // 3. Update local state for immediate UI reflection
        setCartItems(cartData);
    
        // 4. Synchronize with the backend registry
        if (token) {
            try {
                await axios.post(
                    backendUrl + '/api/cart/update', 
                    { itemId, quantity }, 
                    { headers: { token } }
                );
            } catch (error) {
                console.error(error);
                toast.error(error.message);
            }
        }
    };

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (itemInfo && cartItems[items] > 0) {
                // MULTIPLICATION IS KEY HERE
                totalAmount += itemInfo.price * cartItems[items];
            }
        }
        return totalAmount;
    };

    const getUserCart = async (userToken) => {
        try {
            const response = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token: userToken } });
            if (response.data.success) {
                setCartItems(response.data.cartData || {});
            }
        } catch (error) { console.log(error); }
    }

    // --- STARTUP LOGIC ---
    useEffect(() => {
        getProductsData();
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            fetchUserData(storedToken);
            getUserCart(storedToken);
            getWishlistData(storedToken); // NEW: Syncs saved specimens on load
        }
    }, []);

    const value = {
        products, currency, toggleCurrency, formatPrice, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, setCartItems,
        getCartCount, updateQuantity, getCartAmount, 
        navigate, backendUrl, setToken, token,
        userPoints, setUserPoints, userData, fetchUserData,
        toggleWishlist, wishlist, getWishlistData // NEW: Exposed for global use
    };

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    );
}

export default ShopContextProvider;