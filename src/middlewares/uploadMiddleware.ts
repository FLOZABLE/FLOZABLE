// --- Multer Storage Configuration ---

import * as fs from 'fs';
import path from 'path';
import multer from 'multer';

const UPLOAD_DIR = path.join(__dirname, '../public/img/profile-images');
const MAX_FILE_SIZE_MB = 5;

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Generate a unique filename to prevent collisions.
    // We'll rename it later in the controller.
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

// --- Multer Upload Middleware Configuration ---
export const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, // 5 MB in bytes
  },
  fileFilter: (_req, file, cb) => {
    // Basic file type validation (e.g., allow only images or documents)
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'text/plain',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});
