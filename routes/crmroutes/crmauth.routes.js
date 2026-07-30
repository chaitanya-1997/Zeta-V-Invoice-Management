const express = require("express");
const router = express.Router();
const authController = require("../../controllers/crmControllers/auth/auth.controller");
const { verifyToken } = require("../../middleware/crmmiddleware/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.get("/me", verifyToken, authController.getProfile);

module.exports = router;
