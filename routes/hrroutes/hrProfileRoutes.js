const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const profileController = require('../../controllers/hrcontrollers/hrProfileController');
const hrAuthMiddleware = require('../../middleware/hrmiddleware/hrAuthMiddleware');

// Configure multer for profile photo upload directly in routes
const profileUploadDir = "uploads/profiles";
if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const userId = req.user?.id || "unknown";
    const extension = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, extension);
    const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "-");
    const filename = `profile-${userId}-${timestamp}-${cleanName}${extension}`;
    cb(null, filename);
  },
});

const profileFileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPG, JPEG, PNG, GIF, WEBP)."), false);
  }
};

const uploadProfilePhoto = multer({
  storage: profileStorage,
  fileFilter: profileFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Profile routes with photo upload
router.get('/profile/me', hrAuthMiddleware, profileController.getMyProfile);
// Get HR users for filter dropdown
router.get('/hr-users', hrAuthMiddleware, profileController.getAllHrUsers);
router.put('/profile/me', hrAuthMiddleware, uploadProfilePhoto.single('profile_image'), profileController.updateProfile);
router.post('/profile/change-password', hrAuthMiddleware, profileController.changePassword);

// Company settings routes
router.get('/company/settings', hrAuthMiddleware, profileController.getCompanySettings);
router.put('/company/settings', hrAuthMiddleware, profileController.updateCompanySettings);

// Email templates routes
router.get('/email-templates', hrAuthMiddleware, profileController.getEmailTemplates);
router.put('/email-templates', hrAuthMiddleware, profileController.updateEmailTemplates);

module.exports = router;