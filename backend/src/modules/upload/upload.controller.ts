import { Request, Response, NextFunction } from 'express';
import ImageKit from 'imagekit';
import { AppError } from '../../middlewares/error.middleware.js';

// Init ImageKit with env variables (it will crash if missing, but we provide mock or user will add later)
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_key_mock',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_key_mock',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'url_endpoint_mock'
});

export const uploadController = {
    async uploadImage(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                throw { statusCode: 400, message: 'Vui lòng chọn một file ảnh' } as AppError;
            }

            const response = await imagekit.upload({
                file: req.file.buffer, // file buffer from multer
                fileName: `cafe-upload-${Date.now()}-${req.file.originalname}`,
                folder: '/cafe-products' // optional
            });

            res.status(200).json({ 
                status: 'success', 
                message: 'Tải ảnh lên thành công',
                data: {
                    url: response.url,
                    fileId: response.fileId
                } 
            });
        } catch (error) {
            next(error);
        }
    }
};
