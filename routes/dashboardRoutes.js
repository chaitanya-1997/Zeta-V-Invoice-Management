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

router.get(
  "/dashboard/total-revenue",
  verifyToken,
  dashboardController.getTotalRevenue
);

router.get(
  "/dashboard/revenue-by-country",
  verifyToken,
  dashboardController.getRevenueByCountry
);

router.get(
  "/dashboard/monthly-revenue",
  verifyToken,
  dashboardController.getMonthlyRevenue
);

module.exports = router;