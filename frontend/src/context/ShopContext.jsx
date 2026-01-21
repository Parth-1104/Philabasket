import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const navigate = useNavigate();

    const [currency, setCurrency] = useState('INR'); 
    const exchangeRate = 83; 
    const delivery_fee = currency === 'INR' ? 80 : 1; 
    
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('');

    // --- REWARD POINTS STATE ---
    const [userPoints, setUserPoints] = useState(0);

    // Load saved currency preference
    useEffect(() => {
        const savedCurrency = localStorage.getItem('currency');
        if (savedCurrency) setCurrency(savedCurrency);
    }, []);

    const toggleCurrency = (newCurrency) => {
        setCurrency(newCurrency);
        localStorage.setItem('currency', newCurrency);
    };

    // --- FETCH USER POINTS FUNCTION ---
    const fetchUserPoints = async () => {
        if (!token) return;
        try {
            const response = await axios.get(backendUrl + '/api/user/profile', { headers: { token } });
            if (response.data.success) {
                setUserPoints(response.data.user.totalRewardPoints || 0);
            }
        } catch (error) {
            console.log("Error fetching points:", error);
        }
    }

    const formatPrice = (priceInInr) => {
        const amount = currency === 'USD' ? (priceInInr / exchangeRate).toFixed(2) : priceInInr;
        const symbol = currency === 'USD' ? '$' : '₹';
        return `${symbol}${amount}`;
    };

    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('stampCart');
        try {
            const parsed = savedCart ? JSON.parse(savedCart) : {};
            const sanitized = {};
            for (const key in parsed) {
                if (Number(parsed[key]) > 0) sanitized[key] = Number(parsed[key]);
            }
            return sanitized;
        } catch (error) { return {}; }
    });

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
        return currency === 'USD' ? (totalAmount / exchangeRate) : totalAmount;
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
            console.log(error);
            toast.error(error.message);
        }
    }

    const getUserCart = async (userToken) => {
        try {
            const response = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token: userToken } })
            if (response.data.success) {
                setCartItems(response.data.cartData || {});
            }
        } catch (error) { console.log(error); }
    }

    useEffect(() => { getProductsData() }, [])

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken && !token) {
            setToken(storedToken);
            getUserCart(storedToken);
        }
    }, []) 

    // Fetch points whenever the token changes
    useEffect(() => {
        if (token) {
            fetchUserPoints();
        }
    }, [token]);

    const value = {
        products, currency, toggleCurrency, formatPrice,
        delivery_fee, search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        setToken, token,
        // Exported Reward Points Logic
        userPoints, setUserPoints, fetchUserPoints 
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;