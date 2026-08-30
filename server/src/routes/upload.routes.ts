import { Router, Request, Response } from 'express';
import { upload } from '../config/multer.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

router.post(
  '/',
  authenticateToken,
  upload.single('image'),
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        sendError(res, 'No image file uploaded or invalid file format.', 400);
        return;
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      sendSuccess(
        res,
        {
          url: fileUrl,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
        'Image uploaded successfully'
      );
    } catch (err: any) {
      sendError(res, err.message || 'File upload failed', 500);
    }
  }
);

export default router;
