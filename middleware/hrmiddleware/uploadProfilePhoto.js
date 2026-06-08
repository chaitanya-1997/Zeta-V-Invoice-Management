const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists for profile photos
const uploadDir = "uploads/profiles";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Format: profile-{timestamp}-{userId}-{originalname}
    const timestamp = Date.now();
    const userId = req.user?.id || "unknown";
    const extension = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, extension);
    // Clean filename: remove special characters and spaces
    const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "-");
    const filename = `profile-${userId}-${timestamp}-${cleanName}${extension}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  // Allowed image types for profile photos
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  
  const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only image files are allowed (JPG, JPEG, PNG, GIF, WEBP)."),
      false
    );
  }
};

const uploadProfilePhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile photos
  },
});

module.exports = uploadProfilePhoto;