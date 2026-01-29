import express from 'express';
import { loginUser, registerUser, adminLogin, getUserProfile ,googleLogin, forgotPassword, resetPassword } from '../controllers/userController.js';
import { toggleWishlist, getWishlist } from '../controllers/wishlistController.js';


import authUser from '../middleware/auth.js';


const userRouter = express.Router();


// routes/userRoute.js

userRouter.post('/forgot-password', forgotPassword)
userRouter.post('/reset-password', resetPassword)
userRouter.post('/wishlist-toggle', authUser, toggleWishlist);
userRouter.post('/wishlist-get', authUser, getWishlist);

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);
userRouter.post('/google-login', googleLogin);

// NEW: This is the route the Navbar and ShopContext call to get points
userRouter.get('/profile', authUser, getUserProfile);

export default userRouter;