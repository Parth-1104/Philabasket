import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = '$';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('');
    const navigate = useNavigate();

    // 1. INITIALIZATION: Load from localStorage strictly
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('stampCart');
        try {
            const parsed = savedCart ? JSON.parse(savedCart) : {};
            const sanitized = {};
            for (const key in parsed) {
                if (Number(parsed[key]) > 0) sanitized[key] = Number(parsed[key]);
            }
            return sanitized;
        } catch (error) {
            return {};
        }
    });

    // 2. PERSISTENCE: Save to localStorage
    useEffect(() => {
        localStorage.setItem('stampCart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = async (itemId) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId] = (Number(cartData[itemId]) || 0) + 1;
        
        setCartItems(cartData);
        toast.success("Added to Collection");

        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/add', { itemId }, { headers: { token } })
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
    }

    const getCartCount = () => {
        return Object.values(cartItems).reduce((total, qty) => total + Number(qty), 0);
    }

    const updateQuantity = async (itemId, quantity) => {
        const qty = Number(quantity);
        setCartItems(prev => {
            const newData = { ...prev };
            if (qty <= 0) delete newData[itemId];
            else newData[itemId] = qty;
            return newData;
        });

        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/update', { itemId, quantity: qty }, { headers: { token } })
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const itemId in cartItems) {
            const itemInfo = products.find((product) => product._id === itemId);
            const quantity = Number(cartItems[itemId]);
            if (itemInfo && quantity > 0) {
                totalAmount += itemInfo.price * quantity;
            }
        }
        return totalAmount;
    }

    const getProductsData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list')
            if (response.data.success) {
                setProducts(response.data.products.reverse())
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // 3. FIXED MERGE LOGIC: Prevent the "Refresh Increase"
    const getUserCart = async (userToken) => {
        try {
            const response = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token: userToken } })
            if (response.data.success) {
                const dbCart = response.data.cartData || {};
                
                // We ONLY merge if there is a guest cart in localStorage that hasn't been synced yet
                // Otherwise, we just take the DB cart as the source of truth
                setCartItems(dbCart);
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getProductsData()
    }, [])

    // 4. AUTH INITIALIZATION: Only fetch once
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken && !token) {
            setToken(storedToken);
            getUserCart(storedToken);
        }
    }, []) 

    const value = {
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        setToken, token
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;