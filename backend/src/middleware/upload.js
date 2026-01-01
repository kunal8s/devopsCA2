const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
fs.mkdirSync(avatarsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    const id = (req.user && req.user.id) || Date.now();
    cb(null, `${id}_${Date.now()}_${baseName}${ext}`);
  }
});

// Basic image filter
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
};

const avatarUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

module.exports = { avatarUpload };
















