import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { asyncHandler, successResponse, ApiError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('只支持图片和视频文件') as any);
    }
  },
});

// Upload single file
router.post(
  '/single',
  upload.single('file'),
  asyncHandler((req, res) => {
    if (!req.file) throw new ApiError('请选择要上传的文件', 400);

    const fileUrl = `/uploads/${req.file.filename}`;
    successResponse(
      res,
      {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
      '上传成功',
      201
    );
  })
);

// Upload multiple files
router.post(
  '/multiple',
  upload.array('files', 9),
  asyncHandler((req, res) => {
    if (!req.files || (req.files as any[]).length === 0) {
      throw new ApiError('请选择要上传的文件', 400);
    }

    const result = (req.files as Express.Multer.File[]).map((file) => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }));

    successResponse(res, result, `成功上传 ${result.length} 个文件`, 201);
  })
);

export default router;
