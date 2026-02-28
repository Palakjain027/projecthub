import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../utils/ApiError.js';

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/markdown',
  'text/plain',
];
const ALLOWED_CODE_TYPES = ['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed'];

// File size limits
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_DOC_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_CODE_SIZE = 500 * 1024 * 1024; // 500MB

// Memory storage for S3 upload
const storage = multer.memoryStorage();

// File filter factory
function createFileFilter(allowedTypes: string[]) {
  return (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, `Invalid file type. Allowed: ${allowedTypes.join(', ')}`, 'INVALID_FILE_TYPE'));
    }
  };
}

// Generate unique filename
export function generateFilename(originalname: string): string {
  const ext = path.extname(originalname);
  return `${uuidv4()}${ext}`;
}

// Image upload middleware
export const uploadImage = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES),
});

// Video upload middleware
export const uploadVideo = multer({
  storage,
  limits: { fileSize: MAX_VIDEO_SIZE },
  fileFilter: createFileFilter(ALLOWED_VIDEO_TYPES),
});

// Document upload middleware
export const uploadDocument = multer({
  storage,
  limits: { fileSize: MAX_DOC_SIZE },
  fileFilter: createFileFilter(ALLOWED_DOC_TYPES),
});

// Source code upload middleware
export const uploadCode = multer({
  storage,
  limits: { fileSize: MAX_CODE_SIZE },
  fileFilter: createFileFilter(ALLOWED_CODE_TYPES),
});

// Multiple file types upload
export const uploadProject = multer({
  storage,
  limits: { fileSize: MAX_CODE_SIZE },
  fileFilter: createFileFilter([
    ...ALLOWED_IMAGE_TYPES,
    ...ALLOWED_VIDEO_TYPES,
    ...ALLOWED_DOC_TYPES,
    ...ALLOWED_CODE_TYPES,
  ]),
});

// Avatar upload
export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES),
});
