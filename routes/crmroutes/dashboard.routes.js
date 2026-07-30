const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/crmControllers/dashboard/dashboard.controller");
const { verifyToken } = require("../../middleware/crmmiddleware/auth.middleware");

router.get("/", verifyToken, dashboardController.getDashboard);

module.exports = router;
