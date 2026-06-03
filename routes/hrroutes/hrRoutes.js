const express = require("express");
const router = express.Router();

const hrauthController = require("../../controllers/hrcontrollers/hrauthController");

router.post("/register", hrauthController.register);
router.post("/login", hrauthController.login);

module.exports = router;