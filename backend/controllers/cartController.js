import userModel from "../models/userModel.js"

// add products to user cart (Stamp Logic: No Sizes)
const addToCart = async (req, res) => {
    try {
        const { userId, itemId } = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData || {}; // Ensure cartData exists

        // If stamp is already in cart, increment quantity, otherwise set to 1
        if (cartData[itemId]) {
            cartData[itemId] += 1
        } else {
            cartData[itemId] = 1
        }

        await userModel.findByIdAndUpdate(userId, { cartData })

        res.json({ success: true, message: "Added To Collection" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// update user cart quantity
const updateCart = async (req, res) => {
    try {
        const { userId, itemId, quantity } = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData || {};

        // Directly set the new quantity for the specific stamp
        cartData[itemId] = quantity

        await userModel.findByIdAndUpdate(userId, { cartData })
        res.json({ success: true, message: "Cart Updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// get user cart data
const getUserCart = async (req, res) => {
    try {
        const { userId } = req.body
        
        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData || {};

        res.json({ success: true, cartData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { addToCart, updateCart, getUserCart }