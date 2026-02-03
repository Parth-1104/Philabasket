import multer from "multer";

// Use memoryStorage instead of diskStorage for Vercel/Serverless compatibility
const storage = multer.memoryStorage();

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Optional: 10MB limit
});

export default upload;