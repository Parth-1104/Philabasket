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
    const [cartItems, setCartItems] = useState({}); 
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('')
    const navigate = useNavigate();

    // 1. PERSISTENCE: Load cart from local storage on initial startup
    useEffect(() => {
        const savedCart = localStorage.getItem('stampCart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error("Failed to parse saved cart", error);
            }
        }
    }, []);

    // 2. PERSISTENCE: Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('stampCart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = async (itemId) => {
        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            cartData[itemId] += 1;
        } else {
            cartData[itemId] = 1;
        }
        
        setCartItems(cartData);

        // TRIGGER TOAST IMMEDIATELY: Now guests see this too
        toast.success("Added to Collection")

        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/add', { itemId }, { headers: { token } })
            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const itemId in cartItems) {
            try {
                if (cartItems[itemId] > 0) {
                    totalCount += cartItems[itemId];
                }
            } catch (error) {
                console.error("Error calculating cart count", error)
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId] = quantity;
        setCartItems(cartData)

        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/update', { itemId, quantity }, { headers: { token } })
            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const itemId in cartItems) {
            let itemInfo = products.find((product) => product._id === itemId);
            try {
                if (itemInfo && cartItems[itemId] > 0) {
                    totalAmount += itemInfo.price * cartItems[itemId];
                }
            } catch (error) {
                console.error("Error calculating cart amount", error)
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

    // 3. MERGE LOGIC: Combine guest cart items with user database items
    const getUserCart = async (userToken) => {
        try {
            const response = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token: userToken } })
            if (response.data.success) {
                const dbCart = response.data.cartData || {};
                const currentLocalCart = JSON.parse(localStorage.getItem('stampCart')) || {};

                let mergedCart = { ...dbCart };

                // Merge logic
                for (const itemId in currentLocalCart) {
                    if (currentLocalCart[itemId] > 0) {
                        if (mergedCart[itemId]) {
                            mergedCart[itemId] += currentLocalCart[itemId];
                        } else {
                            mergedCart[itemId] = currentLocalCart[itemId];
                        }
                    }
                }

                setCartItems(mergedCart);

                // Sync the merged cart to the database
                for (const itemId in mergedCart) {
                    await axios.post(backendUrl + '/api/cart/update', { itemId, quantity: mergedCart[itemId] }, { headers: { token: userToken } })
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getProductsData()
    }, [])

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            getUserCart(storedToken);
        }
    }, []) // Only run once on mount

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