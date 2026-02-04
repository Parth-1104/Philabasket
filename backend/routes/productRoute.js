import express from 'express'
import { 
    listProducts, 
    addProduct, 
    removeProduct, 
    singleProduct, 
    uploadSingleImage,
    updateProductImages,
    updateProduct,
    removeBulkProducts,
    uploadMedia,
    bulkAddProducts,listMedia // Use the new matching logic
} from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const productRouter = express.Router();

// --- BULK OPERATIONS ---
// Replaced bulkAddStamps with bulkAddProducts to support Media Registry matching
productRouter.post('/bulk-add', adminAuth, upload.single('file'), bulkAddProducts);
productRouter.post('/remove-bulk', adminAuth, removeBulkProducts);
productRouter.get('/list-media', adminAuth, listMedia);
// --- MEDIA REGISTRY ---
// Dedicated endpoint to upload and map image filenames before CSV processing
productRouter.post('/upload-media', adminAuth, upload.single('image'), uploadMedia);
productRouter.post('/upload-single', adminAuth, upload.fields([{ name: 'image1', maxCount: 1 }]), uploadSingleImage);

// --- PRODUCT MANAGEMENT ---
productRouter.post('/add', adminAuth, upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
]), addProduct);

productRouter.post('/update', adminAuth, updateProduct);
productRouter.post('/update-images', adminAuth, upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
]), updateProductImages);

productRouter.post('/remove', adminAuth, removeProduct);
productRouter.post('/single', singleProduct);
productRouter.get('/list', listProducts);

export default productRouter;