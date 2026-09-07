import multer from 'multer';

const storage = multer.memoryStorage();

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
