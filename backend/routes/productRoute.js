import express from 'express'
import { listProducts, addProduct, removeProduct, singleProduct } from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';
import { bulkAddStamps,updateProductImages,updateProduct } from '../controllers/productController.js';


const productRouter = express.Router();



// Route for bulk upload (Admin only)
productRouter.post('/bulk-add', adminAuth, upload.single('file'), bulkAddStamps);

productRouter.post('/update-images', adminAuth, upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
]), updateProductImages);

productRouter.post('/add',adminAuth,upload.fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}]),addProduct);
productRouter.post('/remove',adminAuth,removeProduct);
productRouter.post('/single',singleProduct);
productRouter.post('/update', adminAuth, updateProduct);
productRouter.get('/list',listProducts)

export default productRouter