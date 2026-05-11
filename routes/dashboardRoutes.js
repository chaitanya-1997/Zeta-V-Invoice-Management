const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

// INVOICE STATUS COUNTS
router.get(
  "/dashboard/invoice-status-counts",
  verifyToken,
  dashboardController.getInvoiceStatusCounts
);

module.exports = router;