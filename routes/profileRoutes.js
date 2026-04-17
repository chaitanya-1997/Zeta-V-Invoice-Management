const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

const verifyToken = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");

router.get("/profile", verifyToken, profileController.getProfile);

router.put(
  "/profile",
  verifyToken,
  upload.single("avatar"),
  profileController.updateProfile,
);

router.put(
  "/profile/change-password",
  verifyToken,
  profileController.changePassword,
);

module.exports = router;
