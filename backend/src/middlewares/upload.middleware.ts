import multer from 'multer';

// Use memory storage to keep file in a buffer
const storage = multer.memoryStorage();

// Accept only images, up to 5MB
export const uploadMiddleware = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép định dạng hình ảnh!'));
        }
    }
});
