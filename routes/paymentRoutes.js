const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const paymentController = require("../controllers/paymentController");

router.post("/payments", verifyToken, paymentController.createPayment);
router.get("/payments", verifyToken, paymentController.getAllPayments);

module.exports = router;
