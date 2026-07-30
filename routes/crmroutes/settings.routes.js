const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const settingsController = require("../../controllers/crmControllers/settings/settings.controller");
const { verifyToken } = require("../../middleware/crmmiddleware/auth.middleware");
const { restrictTo } = require("../../middleware/crmmiddleware/role.middleware");

// ---- multer setup for profile image uploads ----
const uploadDir = path.join(__dirname, "..", "uploads", "profile-images");
fs.mkdirSync(uploadDir, { recursive: true }); // create folder on first run if missing

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.user.id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only JPG, PNG, or WEBP images are allowed"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// all settings routes require login
router.use(verifyToken);

router.get("/company", settingsController.getCompanyProfile);
router.put("/company", restrictTo("management"), settingsController.updateCompanyProfile);

router.get("/profile", settingsController.getUserProfile);

router.put("/profile", upload.single("image"), settingsController.updateUserProfile);

router.put("/change-password", settingsController.changePassword);

// Standalone image-only upload — still here in case the frontend ever
// wants to change just the photo without touching other profile fields.
router.post("/profile-image", upload.single("image"), settingsController.uploadProfileImage);

module.exports = router;