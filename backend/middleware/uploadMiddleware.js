// backend/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // File system module to check/create directory

// Define the destination directory path
const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars'); // Adjust if your structure differs

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Create nested directories if needed
}


// Configure disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Save files to backend/uploads/avatars/
    },
    filename: function (req, file, cb) {
        // Create a unique filename: fieldname-timestamp.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter to accept only image files
const fileFilter = (req, file, cb) => {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true); // Accept file
    } else {
        cb(new Error('Error: Images Only! (jpeg, jpg, png, gif)'), false); // Reject file
    }
};

// Create the multer instance with storage, filter, and limits
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limit file size to 5MB
    }
});

// Export the configured multer middleware instance, ready to handle
// a single file upload with the field name 'avatarImage'
// We use .single() because we expect only one avatar file per user registration
module.exports = upload.single('avatarImage');
// Note: 'avatarImage' MUST match the name attribute used in the frontend form input later