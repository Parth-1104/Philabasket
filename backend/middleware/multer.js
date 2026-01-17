import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    // Specify where to store files temporarily
    destination: function (req, file, callback) {
        callback(null, 'uploads/') 
    },
    filename: function (req, file, callback) {
        // Adding a timestamp ensures unique filenames even if two users upload 'stamp.jpg'
        callback(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage })

export default upload